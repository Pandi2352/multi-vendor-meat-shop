import { Sparkles } from 'lucide-react';
import type { CutType, PreparationOption } from '../api';

export interface QuickCutPreset {
  id: string;
  name: string;
  tamilName: string;
  categoryMatch: string; // 'chicken' | 'mutton' | 'fish' | 'prawns'
  cutType: CutType;
  pricePerKg: number;
  mrpPerKg: number;
  minGrams: number;
  allowedWeights: number[];
  allowedPreps: PreparationOption[];
}

export const TAMIL_NADU_POPULAR_CUTS: QuickCutPreset[] = [
  {
    id: 'country-chicken-curry',
    name: 'Country Chicken Curry Cut / நாட்டுக்கோழி',
    tamilName: 'நாட்டுக்கோழி',
    categoryMatch: 'chicken',
    cutType: 'CURRY_CUT',
    pricePerKg: 580,
    mrpPerKg: 620,
    minGrams: 500,
    allowedWeights: [500, 1000, 1500],
    allowedPreps: ['CLEANED', 'SKIN_ON', 'MEDIUM_PIECES'],
  },
  {
    id: 'mutton-curry-cut',
    name: 'Tender Mutton Curry Cut / ஆட்டுக்கறி',
    tamilName: 'ஆட்டுக்கறி',
    categoryMatch: 'mutton',
    cutType: 'CURRY_CUT',
    pricePerKg: 860,
    mrpPerKg: 920,
    minGrams: 500,
    allowedWeights: [250, 500, 1000],
    allowedPreps: ['CLEANED', 'MEDIUM_PIECES'],
  },
  {
    id: 'mutton-biryani-cut',
    name: 'Mutton Biryani Cut / பிரியாணி வெட்டு',
    tamilName: 'பிரியாணி வெட்டு',
    categoryMatch: 'mutton',
    cutType: 'BIRYANI_CUT',
    pricePerKg: 880,
    mrpPerKg: 940,
    minGrams: 500,
    allowedWeights: [500, 1000],
    allowedPreps: ['CLEANED', 'LARGE_PIECES'],
  },
  {
    id: 'broiler-chicken-curry',
    name: 'Broiler Chicken Curry Cut / பிராய்லர் சிக்கன்',
    tamilName: 'பிராய்லர்',
    categoryMatch: 'chicken',
    cutType: 'CURRY_CUT',
    pricePerKg: 240,
    mrpPerKg: 260,
    minGrams: 500,
    allowedWeights: [500, 1000, 2000],
    allowedPreps: ['CLEANED', 'SKIN_OFF', 'MEDIUM_PIECES'],
  },
  {
    id: 'seer-fish-slices',
    name: 'Seer Fish Steaks / வஞ்சிரம் மீன் துண்டுகள்',
    tamilName: 'வஞ்சிரம்',
    categoryMatch: 'fish',
    cutType: 'STEAK',
    pricePerKg: 950,
    mrpPerKg: 1050,
    minGrams: 500,
    allowedWeights: [500, 1000],
    allowedPreps: ['CLEANED', 'SCALED', 'GUTTED'],
  },
];

interface QuickCutPresetsProps {
  onSelect: (preset: QuickCutPreset) => void;
}

/** Quick-pick pills for common Tamil Nadu butchery meat cuts. */
export function QuickCutPresets({ onSelect }: QuickCutPresetsProps) {
  return (
    <div className="space-y-1.5 p-2.5 rounded-md bg-surface-muted/60 border border-border">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>Quick Fill Common Butchery Cuts:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TAMIL_NADU_POPULAR_CUTS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset)}
            className="px-2 py-1 text-[11px] rounded-md border border-border bg-surface hover:border-primary hover:text-primary transition-colors text-text text-left font-medium"
          >
            {preset.name} • <span className="text-primary font-semibold">₹{preset.pricePerKg}/kg</span>
          </button>
        ))}
      </div>
    </div>
  );
}
