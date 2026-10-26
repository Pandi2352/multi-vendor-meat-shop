import { Navigation, Scissors, Loader2 } from 'lucide-react';
import { useDistrict } from '@/context/district-context';
import { CUT_FILTER_OPTIONS, VIRUDHUNAGAR_TOWNS } from '@/constants/tn-districts';

export function LocationPickerBar() {
  const {
    selectedDistrict,
    setSelectedDistrict,
    selectedCut,
    setSelectedCut,
    detectLocation,
    isLocating,
  } = useDistrict();

  return (
    <div className="space-y-4">
      {/* Town chips */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-primary" />
            Select Your Virudhunagar Town
          </h3>
          <button
            type="button"
            onClick={detectLocation}
            disabled={isLocating}
            className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
          >
            {isLocating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            <span>{isLocating ? 'Locating...' : 'Use GPS Location'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {VIRUDHUNAGAR_TOWNS.map((town) => {
            const isActive = selectedDistrict === town.nameEn;
            return (
              <button
                key={town.code}
                type="button"
                onClick={() => setSelectedDistrict(town.nameEn)}
                className={`px-3 py-1.5 text-xs rounded-md border whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-muted hover:text-text hover:border-primary/40'
                }`}
              >
                <span>{town.nameEn}</span>
                <span className="opacity-75 ml-1 text-[10px]">({town.nameTa})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Cut Style Filter Pills */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text flex items-center gap-1.5">
            <Scissors className="h-3.5 w-3.5 text-primary" />
            Filter by Butchery Cut Style
          </h3>
          <span className="text-[11px] text-muted">Fresh butcher preparation</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CUT_FILTER_OPTIONS.map((cut) => {
            const isActive = selectedCut === cut.code;
            return (
              <button
                key={cut.code}
                type="button"
                onClick={() => setSelectedCut(cut.code)}
                className={`px-3 py-1.5 text-xs rounded-md border whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-muted hover:text-text hover:border-primary/40'
                }`}
              >
                <span>{cut.label}</span>
                <span className="opacity-75 ml-1 text-[10px]">({cut.labelTa})</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
