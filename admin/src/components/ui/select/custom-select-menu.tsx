import { useMemo } from 'react';
import type { RefObject } from 'react';
import { Search, X, CheckSquare, Square, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SelectOption } from './custom-select.types';

export interface CustomSelectMenuProps {
  search: string;
  setSearch: (val: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  optionListRef: RefObject<HTMLDivElement | null>;
  searchable: boolean;
  multiple: boolean;
  filteredOptions: SelectOption[];
  selectedValues: string[];
  highlightedIndex: number;
  openAbove: boolean;
  alignRight: boolean;
  maxListHeight: number;
  menuClassName?: string;
  handleSelect: (optValue: string, e?: React.MouseEvent | React.KeyboardEvent) => void;
  handleSelectAll: () => void;
  handleDeselectAll: () => void;
}

export function CustomSelectMenu({
  search,
  setSearch,
  searchInputRef,
  optionListRef,
  searchable,
  multiple,
  filteredOptions,
  selectedValues,
  highlightedIndex,
  openAbove,
  alignRight,
  maxListHeight,
  menuClassName,
  handleSelect,
  handleSelectAll,
  handleDeselectAll,
}: CustomSelectMenuProps) {
  const groupedStructure = useMemo(() => {
    const hasGroups = filteredOptions.some((opt) => !!opt.group);
    if (!hasGroups) return null;
    const map = new Map<string, SelectOption[]>();
    for (const opt of filteredOptions) {
      const g = opt.group || 'Other';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(opt);
    }
    return map;
  }, [filteredOptions]);

  return (
    <div
      role="listbox"
      aria-multiselectable={multiple}
      className={cn(
        'absolute z-50 min-w-full rounded-md border border-border bg-surface p-1.5 transition-all animate-in fade-in-50',
        openAbove ? 'bottom-full mb-1' : 'top-full mt-1',
        alignRight ? 'right-0 left-auto' : 'left-0 right-auto',
        menuClassName,
      )}
      style={{ width: 'max-content', maxWidth: '340px' }}
    >
      {searchable && (
        <div className="relative mb-1.5 px-1 pt-0.5">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search options..."
              aria-label="Filter options"
              className="w-full rounded-md border border-border bg-surface-muted py-1.5 pl-8 pr-7 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
            {search && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch('');
                  searchInputRef.current?.focus();
                }}
                className="text-muted hover:text-text p-0.5 rounded-md"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

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
                            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-md border transition-colors',
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
                        'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-md border transition-colors',
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
  );
}
