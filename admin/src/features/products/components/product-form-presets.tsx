import type { PreparationOption } from '../api';
import { PREPARATION_OPTIONS, WEIGHT_PRESETS } from '../constants';

interface ProductFormPresetsProps {
  selectedWeights: number[];
  onToggleWeight: (grams: number) => void;
  selectedPreps: PreparationOption[];
  onTogglePrep: (prep: PreparationOption) => void;
}

export function ProductFormPresets({
  selectedWeights,
  onToggleWeight,
  selectedPreps,
  onTogglePrep,
}: ProductFormPresetsProps) {
  return (
    <div className="space-y-3">
      {/* Available package weights */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text">
          Available Package Sizes <span className="text-muted">(Pick all offered)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {WEIGHT_PRESETS.map((preset) => {
            const isSelected = selectedWeights.includes(preset.grams);
            return (
              <button
                key={preset.grams}
                type="button"
                onClick={() => onToggleWeight(preset.grams)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-muted border-border hover:bg-surface-muted hover:text-text'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Butchery preparation options */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text">
          Butchery Preparation Options <span className="text-muted">(Cuts & cleaning offered)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PREPARATION_OPTIONS.map((prep) => {
            const isSelected = selectedPreps.includes(prep.value);
            return (
              <button
                key={prep.value}
                type="button"
                onClick={() => onTogglePrep(prep.value)}
                className={`px-2 py-1 text-xs font-medium rounded-md border transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                    : 'bg-surface text-muted border-border hover:bg-surface-muted hover:text-text'
                }`}
              >
                <span>{prep.label}</span>
                <span className="text-[10px] opacity-75">({prep.tamilLabel})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
