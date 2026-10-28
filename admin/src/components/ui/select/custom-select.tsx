import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X, Loader2 } from 'lucide-react';
import { useClickOutside, useEscapeKey } from '@/hooks';
import { cn } from '@/lib/cn';
import type { CustomSelectProps } from './custom-select.types';
import { CustomSelectMenu } from './custom-select-menu';
import { useSelectPosition } from './use-select-position';

export * from './custom-select.types';

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
  portal = true,
  className,
  triggerClassName,
  menuClassName,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionListRef = useRef<HTMLDivElement>(null);

  const { openAbove, alignRight, maxListHeight, menuStyle, updatePosition } = useSelectPosition({
    triggerRef,
    isOpen,
    portal,
    placement,
    align,
  });

  useClickOutside([containerRef, menuRef], () => setIsOpen(false), isOpen);
  useEscapeKey(() => setIsOpen(false), isOpen);

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

  const handleSelect = useCallback(
    (optValue: string, e?: React.MouseEvent | React.KeyboardEvent) => {
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
    },
    [multiple, onChange, selectedValues],
  );

  const handleSelectAll = useCallback(() => {
    const allSelectable = filteredOptions.filter((o) => !o.disabled).map((o) => o.value);
    onChange(Array.from(new Set([...selectedValues, ...allSelectable])));
  }, [filteredOptions, onChange, selectedValues]);

  const handleDeselectAll = useCallback(() => onChange([]), [onChange]);
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  }, [multiple, onChange]);

  const handleTriggerClick = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const sizeClasses = { sm: 'h-8 px-2.5 text-xs', md: 'h-9 px-3 text-xs', lg: 'h-10 px-3.5 text-sm' };

  const menuNode = (
    <CustomSelectMenu
      search={search}
      setSearch={setSearch}
      searchInputRef={searchInputRef}
      optionListRef={optionListRef}
      menuRef={menuRef}
      searchable={searchable}
      multiple={multiple}
      filteredOptions={filteredOptions}
      selectedValues={selectedValues}
      highlightedIndex={highlightedIndex}
      openAbove={openAbove}
      alignRight={alignRight}
      maxListHeight={maxListHeight}
      portal={portal}
      style={menuStyle}
      menuClassName={menuClassName}
      handleSelect={handleSelect}
      handleSelectAll={handleSelectAll}
      handleDeselectAll={handleDeselectAll}
    />
  );

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleTriggerClick}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-md border border-border bg-surface text-left transition-colors',
          'focus-visible:outline-none focus-visible:border-primary',
          disabled && 'cursor-not-allowed opacity-50 bg-surface-muted',
          sizeClasses[size],
          triggerClassName,
        )}
      >
        <div className="flex-1 truncate">
          {selectedOptions.length === 0 ? (
            <span className="text-muted truncate">{placeholder}</span>
          ) : multiple ? (
            <div className="flex flex-wrap items-center gap-1 overflow-hidden">
              {selectedOptions.slice(0, 2).map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 rounded-md bg-surface-muted border border-border px-1.5 py-0.5 text-xs font-medium text-text"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => handleSelect(opt.value, e)}
                    className="hover:text-danger rounded-md p-0.5"
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
              className="p-1 hover:text-text rounded-md transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </div>
      </button>

      {isOpen && (portal ? createPortal(menuNode, document.body) : menuNode)}
    </div>
  );
}
