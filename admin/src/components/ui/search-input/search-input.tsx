import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = 'Search...', className, ...props }, ref) => {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div
        className={cn(
          'relative flex h-10 w-full items-center rounded-md border border-border bg-surface px-3 text-sm text-text transition-colors',
          'hover:border-muted/50 focus-within:border-primary',
          className,
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted mr-2.5" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-sm text-text placeholder:text-muted/70 outline-none"
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-text transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
