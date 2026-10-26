import type { CutType, PreparationOption } from './api';

export interface CutTypeOption {
  value: CutType;
  label: string;
  tamilLabel: string;
  description: string;
}

export const CUT_TYPES: CutTypeOption[] = [
  { value: 'CURRY_CUT', label: 'Curry Cut', tamilLabel: 'கறி வெட்டு', description: 'Medium bone-in pieces ideal for traditional gravies' },
  { value: 'BIRYANI_CUT', label: 'Biryani Cut', tamilLabel: 'பிரியாணி வெட்டு', description: 'Large succulent cuts perfect for Dum Biryani' },
  { value: 'BONELESS', label: 'Boneless', tamilLabel: 'எலும்பில்லாதது', description: 'Pure meat cuts without bones for fries and roasts' },
  { value: 'WITH_BONE', label: 'With Bone', tamilLabel: 'எலும்புடன்', description: 'Classic bone-in cuts with marrow flavor' },
  { value: 'WHOLE', label: 'Whole Dressed', tamilLabel: 'முழு இறைச்சி', description: 'Complete cleaned and dressed portion' },
  { value: 'BREAST', label: 'Breast Fillet', tamilLabel: 'மார்பு இறைச்சி', description: 'Tender, lean high-protein cut' },
  { value: 'LEG', label: 'Leg & Thigh', tamilLabel: 'கால் & தொடை', description: 'Juicy, rich dark meat portions' },
  { value: 'WINGS', label: 'Wings', tamilLabel: 'இறக்கைகள்', description: 'Crispy fry wings portion' },
  { value: 'LIVER', label: 'Liver', tamilLabel: 'ஈரல்', description: 'Iron-rich fresh tender liver' },
  { value: 'GIZZARD', label: 'Gizzard', tamilLabel: 'கல் ஈரல்', description: 'Firm specialty cut' },
  { value: 'MINCE', label: 'Keema / Mince', tamilLabel: 'கொத்துக்கறி', description: 'Finely minced meat for koftas and cutlets' },
  { value: 'SOUP_PIECES', label: 'Soup Pieces', tamilLabel: 'சூப் எலும்பு', description: 'Bone and marrow cuts for mutton/chicken soup' },
  { value: 'FILLET', label: 'Fish Fillet', tamilLabel: 'மீன் துண்டுகள்', description: 'Boneless fish fillet cuts' },
  { value: 'STEAK', label: 'Fish Steak', tamilLabel: 'மீன் ஸ்டீக்', description: 'Cross-cut circular fish steaks' },
];

export interface PrepOption {
  value: PreparationOption;
  label: string;
  tamilLabel: string;
}

export const PREPARATION_OPTIONS: PrepOption[] = [
  { value: 'CLEANED', label: 'Cleaned & Dressed', tamilLabel: 'சுத்தம் செய்தது' },
  { value: 'SKIN_ON', label: 'Skin-on', tamilLabel: 'தோலுடன்' },
  { value: 'SKIN_OFF', label: 'Skin-off', tamilLabel: 'தோல் நீக்கியது' },
  { value: 'SMALL_PIECES', label: 'Small Pieces', tamilLabel: 'சிறிய துண்டுகள்' },
  { value: 'MEDIUM_PIECES', label: 'Medium Pieces', tamilLabel: 'நடுத்தர துண்டுகள்' },
  { value: 'LARGE_PIECES', label: 'Large Pieces', tamilLabel: 'பெரிய துண்டுகள்' },
  { value: 'SCALED', label: 'Scaled & Gutted', tamilLabel: 'செதில் நீக்கியது' },
  { value: 'GUTTED', label: 'Gutted', tamilLabel: 'உள்ளுறுப்பு நீக்கியது' },
];

export const WEIGHT_PRESETS = [
  { grams: 250, label: '250 g' },
  { grams: 500, label: '500 g (½ kg)' },
  { grams: 750, label: '750 g' },
  { grams: 1000, label: '1 kg (1000 g)' },
  { grams: 1500, label: '1.5 kg' },
  { grams: 2000, label: '2 kg' },
];
