import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { ChevronDown, Check, X, Search, CheckSquare, Square, Loader2 } from 'lucide-react';
import { useClickOutside, useEscapeKey } from '@/hooks';
import { cn } from '@/lib/cn';

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  align?: 'auto' | 'left' | 'right';
  placement?: 'auto' | 'bottom' | 'top';
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  id?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  multiple = false,
  searchable = true,
  clearable = true,
  disabled = false,
  loading = false,
  size = 'md',
  align = 'auto',
  placement = 'auto',
  className,
  triggerClassName,
  menuClassName,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [openAbove, setOpenAbove] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [maxListHeight, setMaxListHeight] = useState<number>(224);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionListRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Vertical placement
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const isAbove =
      placement === 'top' || (placement === 'auto' && spaceBelow < 280 && spaceAbove > spaceBelow);
    setOpenAbove(isAbove);

    // Available height for options list
    const availH = isAbove ? spaceAbove - 24 : spaceBelow - 24;
    setMaxListHeight(Math.min(224, Math.max(120, availH - 64)));

    // Horizontal alignment
    const estimatedWidth = Math.max(rect.width, 220);
    const spaceRight = vw - rect.left;
    const isRight =
      align === 'right' ||
      (align === 'auto' && (spaceRight < estimatedWidth || rect.right > vw - 60));
    setAlignRight(isRight);
  }, [placement, align]);

  // Recalculate position on open, scroll and resize
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  useClickOutside([containerRef], () => setIsOpen(false), isOpen);
  useEscapeKey(() => setIsOpen(false), isOpen);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchable) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      setSearch('');
      setHighlightedIndex(0);
    }
  }, [isOpen, searchable]);

  const selectedValues = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return typeof value === 'string' && value ? [value] : [];
  }, [value, multiple]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q)) ||
        (opt.group && opt.group.toLowerCase().includes(q)),
    );
  }, [options, search]);

  const selectedOptions = useMemo(() => {
    return options.filter((opt) => selectedValues.includes(opt.value));
  }, [options, selectedValues]);

  const handleSelect = useCallback((optValue: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (multiple) {
      const next = selectedValues.includes(optValue)
        ? selectedValues.filter((v) => v !== optValue)
        : [...selectedValues, optValue];
      onChange(next);
    } else {
      onChange(optValue);
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  }, [multiple, selectedValues, onChange]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allEnabled = filteredOptions.filter((o) => !o.disabled).map((o) => o.value);
    // Combine existing selections with current filtered enabled options
    const merged = Array.from(new Set([...selectedValues, ...allEnabled]));
    onChange(merged);
  };

  const handleDeselectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!search.trim()) {
      onChange([]);
    } else {
      // Unselect only currently filtered options
      const filteredSet = new Set(filteredOptions.map((o) => o.value));
      onChange(selectedValues.filter((v) => !filteredSet.has(v)));
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        let next = prev + 1;
        while (next < filteredOptions.length && filteredOptions[next].disabled) {
          next++;
        }
        return next < filteredOptions.length ? next : prev;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        let next = prev - 1;
        while (next >= 0 && filteredOptions[next].disabled) {
          next--;
        }
        return next >= 0 ? next : prev;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredOptions[highlightedIndex];
      if (current && !current.disabled) {
        handleSelect(current.value, e);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  // Auto scroll highlighted item into view
  useEffect(() => {
    if (isOpen && optionListRef.current) {
      const activeEl = optionListRef.current.querySelector<HTMLElement>(`[data-option-index="${highlightedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Group options if any option has group property
  const groupedStructure = useMemo(() => {
    const hasGroups = filteredOptions.some((opt) => opt.group);
    if (!hasGroups) return null;

    const map = new Map<string, SelectOption[]>();
    for (const opt of filteredOptions) {
      const g = opt.group || 'General';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(opt);
    }
    return map;
  }, [filteredOptions]);

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-11 px-3.5 text-sm',
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between rounded-md border border-border bg-surface text-text transition-all text-left',
          'hover:border-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          isOpen && 'border-primary ring-2 ring-primary/20',
          disabled && 'cursor-not-allowed opacity-60 bg-surface-muted',
          sizeClasses[size],
          triggerClassName,
        )}
      >
        <div className="flex flex-1 items-center gap-1.5 overflow-hidden pr-2">
          {selectedOptions.length === 0 ? (
            <span className="text-muted truncate">{placeholder}</span>
          ) : multiple ? (
            <div className="flex flex-wrap items-center gap-1 overflow-hidden">
              {selectedOptions.slice(0, 2).map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 rounded bg-surface-muted border border-border px-1.5 py-0.5 text-xs font-medium text-text"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => handleSelect(opt.value, e)}
                    className="hover:text-danger rounded p-0.5"
                    aria-label={`Remove ${opt.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {selectedOptions.length > 2 && (
                <span className="text-xs font-medium text-muted">
                  +{selectedOptions.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 truncate">
              {selectedOptions[0]?.icon && (
                <span className="shrink-0 text-muted">{selectedOptions[0].icon}</span>
              )}
              <span className="truncate font-medium text-text">{selectedOptions[0]?.label}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-muted">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
          {clearable && selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear selection"
              className="p-1 hover:text-text rounded transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </div>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute z-50 min-w-[200px] w-full max-w-[calc(100vw-24px)] rounded-md border border-border bg-surface p-1.5 text-text animate-in fade-in duration-100',
            openAbove ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]',
            alignRight ? 'right-0 left-auto' : 'left-0 right-auto',
            menuClassName,
          )}
        >
          {/* Search Box */}
          {searchable && (
            <div className="relative mb-1 border-b border-border pb-1 px-1">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-muted text-xs">
                <Search className="h-3.5 w-3.5 text-muted shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder="Type to filter..."
                  className="w-full bg-transparent text-xs text-text outline-none placeholder:text-muted"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setHighlightedIndex(0);
                      searchInputRef.current?.focus();
                    }}
                    className="text-muted hover:text-text p-0.5 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Multi-select Header: Select All / Deselect All */}
          {multiple && (
            <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-border text-[11px] text-muted font-medium">
              <span>{selectedValues.length} selected</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <CheckSquare className="h-3 w-3" /> Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="hover:text-danger transition-colors flex items-center gap-1"
                >
                  <Square className="h-3 w-3" /> Clear
                </button>
              </div>
            </div>
          )}

          {/* Options List */}
          <div
            ref={optionListRef}
            style={{ maxHeight: `${maxListHeight}px` }}
            className="overflow-y-auto space-y-0.5"
          >
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted">No matching options</div>
            ) : groupedStructure ? (
              Array.from(groupedStructure.entries()).map(([groupName, groupOpts]) => (
                <div key={groupName} className="space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted uppercase">
                    {groupName}
                  </div>
                  {groupOpts.map((opt) => {
                    const globalIdx = filteredOptions.indexOf(opt);
                    const isSelected = selectedValues.includes(opt.value);
                    const isHighlighted = globalIdx === highlightedIndex;

                    return (
                      <div
                        key={opt.value}
                        data-option-index={globalIdx}
                        role="option"
                        aria-selected={isSelected}
                        onClick={(e) => !opt.disabled && handleSelect(opt.value, e)}
                        className={cn(
                          'flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-primary/10 text-primary font-medium'
                            : isHighlighted
                            ? 'bg-surface-muted text-text'
                            : 'text-text hover:bg-surface-muted',
                          opt.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {multiple ? (
                            <div
                              className={cn(
                                'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors',
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border bg-surface',
                              )}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5" />}
                            </div>
                          ) : (
                            opt.icon && <span className="shrink-0 text-muted">{opt.icon}</span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">{opt.label}</p>
                            {opt.description && (
                              <p className="truncate text-[10px] text-muted">{opt.description}</p>
                            )}
                          </div>
                        </div>

                        {!multiple && isSelected && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = selectedValues.includes(opt.value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={opt.value}
                    data-option-index={idx}
                    role="option"
                    aria-selected={isSelected}
                    onClick={(e) => !opt.disabled && handleSelect(opt.value, e)}
                    className={cn(
                      'flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-primary/10 text-primary font-medium'
                        : isHighlighted
                        ? 'bg-surface-muted text-text'
                        : 'text-text hover:bg-surface-muted',
                      opt.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {multiple ? (
                        <div
                          className={cn(
                            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-surface',
                          )}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5" />}
                        </div>
                      ) : (
                        opt.icon && <span className="shrink-0 text-muted">{opt.icon}</span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{opt.label}</p>
                        {opt.description && (
                          <p className="truncate text-[10px] text-muted">{opt.description}</p>
                        )}
                      </div>
                    </div>

                    {!multiple && isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
