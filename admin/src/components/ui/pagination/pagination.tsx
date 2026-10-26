import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { CustomSelect, type SelectOption } from '../select';
import { cn } from '@/lib/cn';

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSize?: boolean;
  showSummary?: boolean;
  showJumpTo?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  showSummary = true,
  showJumpTo = true,
  className,
  size = 'md',
}: PaginationProps) {
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Calculate smart range of visible pages with ellipsis
  const visiblePages = useMemo<(number | 'ellipsis')[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
    }

    if (page >= totalPages - 3) {
      return [
        1,
        'ellipsis',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
  }, [page, totalPages]);

  const startItem = totalItems ? Math.min((page - 1) * pageSize + 1, totalItems) : (page - 1) * pageSize + 1;
  const endItem = totalItems ? Math.min(page * pageSize, totalItems) : page * pageSize;

  const pageSizeOptionsFormatted: SelectOption[] = useMemo(() => {
    return pageSizeOptions.map((opt) => ({
      label: `${opt} / page`,
      value: String(opt),
    }));
  }, [pageSizeOptions]);

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput.trim(), 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
      setJumpPageInput('');
    }
  };

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  if (totalPages <= 0 && (!totalItems || totalItems === 0)) {
    return null;
  }

  return (
    <div
      className={cn(
        'w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border text-xs text-text',
        className,
      )}
    >
      {/* Left: Summary and Page Size */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        {showSummary && typeof totalItems === 'number' && (
          <p className="text-muted text-xs">
            Showing <span className="font-semibold text-text">{startItem}</span> to{' '}
            <span className="font-semibold text-text">{endItem}</span> of{' '}
            <span className="font-semibold text-text">{totalItems}</span> results
          </p>
        )}

        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-muted text-[11px] hidden md:inline">Rows:</span>
            <div className="w-28">
              <CustomSelect
                value={String(pageSize)}
                onChange={(val) => onPageSizeChange(Number(val))}
                options={pageSizeOptionsFormatted}
                searchable={false}
                clearable={false}
                size="sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Right: Page Navigation and Jump To */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onPageChange(1)}
            aria-label="First page"
            className={cn(
              'flex items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors cursor-pointer',
              size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
              isFirst
                ? 'opacity-40 cursor-not-allowed bg-surface-muted'
                : 'hover:text-text hover:bg-surface-muted',
            )}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            className={cn(
              'flex items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors cursor-pointer',
              size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
              isFirst
                ? 'opacity-40 cursor-not-allowed bg-surface-muted'
                : 'hover:text-text hover:bg-surface-muted',
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Page numbers */}
          {visiblePages.map((item, idx) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex items-center justify-center text-muted px-1 text-xs select-none"
                >
                  ...
                </span>
              );
            }

            const isActive = item === page;
            return (
              <button
                key={item}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  'flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer select-none',
                  size === 'sm' ? 'h-7 min-w-[28px] px-2' : 'h-8 min-w-[32px] px-2.5',
                  isActive
                    ? 'border border-border font-semibold bg-surface text-text'
                    : 'text-muted hover:text-text hover:bg-surface-muted border border-transparent',
                )}
              >
                {item}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            type="button"
            disabled={isLast}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            className={cn(
              'flex items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors cursor-pointer',
              size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
              isLast
                ? 'opacity-40 cursor-not-allowed bg-surface-muted'
                : 'hover:text-text hover:bg-surface-muted',
            )}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            disabled={isLast}
            onClick={() => onPageChange(totalPages)}
            aria-label="Last page"
            className={cn(
              'flex items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors cursor-pointer',
              size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
              isLast
                ? 'opacity-40 cursor-not-allowed bg-surface-muted'
                : 'hover:text-text hover:bg-surface-muted',
            )}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Jump to Page */}
        {showJumpTo && totalPages > 5 && (
          <form onSubmit={handleJumpSubmit} className="hidden md:flex items-center gap-1 pl-1">
            <span className="text-muted text-[11px]">Go to:</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder={String(page)}
              className="h-8 w-12 rounded-md border border-border bg-surface px-2 text-center text-xs text-text outline-none focus:border-primary"
            />
          </form>
        )}
      </div>
    </div>
  );
}
