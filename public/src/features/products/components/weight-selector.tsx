import { cn } from '@/lib/cn';
import { formatWeight } from '@/utils';

interface WeightSelectorProps {
  weights: number[];
  selectedWeight: number;
  onSelect: (weight: number) => void;
}

export function WeightSelector({ weights, selectedWeight, onSelect }: WeightSelectorProps) {
  const displayWeights = weights.length > 0 ? weights : [250, 500, 1000];

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayWeights.map((w) => {
        const isSelected = w === selectedWeight;
        return (
          <button
            key={w}
            type="button"
            onClick={() => onSelect(w)}
            className={cn(
              'px-2.5 py-1 text-xs rounded-md font-medium border transition-colors',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-surface text-muted hover:border-text hover:text-text',
            )}
          >
            {formatWeight(w)}
          </button>
        );
      })}
    </div>
  );
}
