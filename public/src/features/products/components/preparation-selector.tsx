import { cn } from '@/lib/cn';

const PREP_LABELS: Record<string, { en: string; ta: string }> = {
  SKIN_ON: { en: 'Skin-on', ta: 'தோலுடன்' },
  SKIN_OFF: { en: 'Skin-off', ta: 'தோல் நீக்கியது' },
  CLEANED: { en: 'Cleaned', ta: 'சுத்தம் செய்தது' },
  SMALL_PIECES: { en: 'Small Cut', ta: 'சிறிய துண்டு' },
  MEDIUM_PIECES: { en: 'Medium Cut', ta: 'நடுத்தர துண்டு' },
  LARGE_PIECES: { en: 'Biryani Cut', ta: 'பிரியாணி துண்டு' },
  SCALED: { en: 'Scaled', ta: 'செதில் நீக்கியது' },
  GUTTED: { en: 'Gutted', ta: 'குடல் நீக்கியது' },
};

interface PreparationSelectorProps {
  options: string[];
  selectedPrep: string;
  onSelect: (prep: string) => void;
}

export function PreparationSelector({ options, selectedPrep, onSelect }: PreparationSelectorProps) {
  if (!options || options.length <= 1) return null;

  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium text-muted">Butchery Prep Preference</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = opt === selectedPrep;
          const meta = PREP_LABELS[opt] || { en: opt.replace(/_/g, ' '), ta: '' };
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={cn(
                'px-2 py-0.5 text-[11px] rounded-md font-medium border transition-colors flex items-center gap-1',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border bg-surface text-muted hover:border-text hover:text-text',
              )}
            >
              <span>{meta.en}</span>
              {meta.ta && <span className="text-[10px] opacity-75">({meta.ta})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
