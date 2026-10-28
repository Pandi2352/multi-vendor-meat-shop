import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StarRatingProps {
  value: number;
  max?: number;
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

const SIZE_MAP = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function StarRating({
  value,
  max = 5,
  onChange,
  size = 'md',
  readOnly = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const activeValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        const starNumber = i + 1;
        const isFilled = starNumber <= activeValue;

        if (readOnly) {
          return (
            <Star
              key={starNumber}
              className={cn(
                SIZE_MAP[size],
                isFilled
                  ? 'text-warning fill-warning'
                  : 'text-border fill-transparent',
              )}
              aria-hidden="true"
            />
          );
        }

        return (
          <button
            key={starNumber}
            type="button"
            onClick={() => onChange?.(starNumber)}
            onMouseEnter={() => setHoverValue(starNumber)}
            onMouseLeave={() => setHoverValue(null)}
            className="p-0.5 rounded-md hover:scale-110 transition-transform cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40"
            aria-label={`Rate ${starNumber} out of ${max} stars`}
          >
            <Star
              className={cn(
                SIZE_MAP[size],
                isFilled
                  ? 'text-warning fill-warning'
                  : 'text-muted/40 fill-transparent',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
