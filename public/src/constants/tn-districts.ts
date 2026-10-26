export interface VirudhunagarTown {
  code: string;
  nameEn: string;
  nameTa: string;
  pincode: string;
  description: string;
  lat: number;
  lng: number;
}

export const VIRUDHUNAGAR_TOWNS: VirudhunagarTown[] = [
  {
    code: 'VIRUDHUNAGAR_TOWN',
    nameEn: 'Virudhunagar Town',
    nameTa: 'விருதுநகர் டவுன்',
    pincode: '626001',
    description: 'Bazaar, Madurai Road, Ramamoorthy Road & Collectorate',
    lat: 9.568,
    lng: 77.9624,
  },
  {
    code: 'SIVAKASI',
    nameEn: 'Sivakasi',
    nameTa: 'சிவகாசி',
    pincode: '626123',
    description: 'Car Street, Thiruthangal Road & Sattur Road',
    lat: 9.4533,
    lng: 77.8024,
  },
  {
    code: 'RAJAPALAYAM',
    nameEn: 'Rajapalayam',
    nameTa: 'ராஜபாளையம்',
    pincode: '626117',
    description: 'Tenkasi Road, PACR Salai & Gandhi Grounds',
    lat: 9.4532,
    lng: 77.5544,
  },
  {
    code: 'ARUPPUKKOTTAI',
    nameEn: 'Aruppukkottai',
    nameTa: 'அருப்புக்கோட்டை',
    pincode: '626101',
    description: 'Chokkalingapuram, Thirunagaram & Pandal Kudi Rd',
    lat: 9.5108,
    lng: 78.0984,
  },
  {
    code: 'SRIVILLIPUTHUR',
    nameEn: 'Srivilliputhur',
    nameTa: 'ஸ்ரீவில்லிபுத்தூர்',
    pincode: '626125',
    description: 'Andal Sannathi, Madurai Highway & Mada Veedhi',
    lat: 9.5098,
    lng: 77.6322,
  },
  {
    code: 'SATTUR',
    nameEn: 'Sattur',
    nameTa: 'சாத்தூர்',
    pincode: '626203',
    description: 'Kovilpatti Road & Main Bazaar',
    lat: 9.3621,
    lng: 77.9254,
  },
  {
    code: 'THIRUTHANGAL',
    nameEn: 'Thiruthangal',
    nameTa: 'திருத்தங்கல்',
    pincode: '626130',
    description: 'Annamalaiyar Colony & Sivakasi Link',
    lat: 9.4819,
    lng: 77.8067,
  },
  {
    code: 'KARIAPATTI',
    nameEn: 'Kariapatti',
    nameTa: 'காரியாபட்டி',
    pincode: '626106',
    description: 'Madurai-Aruppukkottai Bypass',
    lat: 9.6806,
    lng: 78.1408,
  },
  {
    code: 'WATRAP',
    nameEn: 'Watrap',
    nameTa: 'வத்திராயிருப்பு',
    pincode: '626132',
    description: 'Maharajapuram & Foothills',
    lat: 9.6385,
    lng: 77.6401,
  },
  {
    code: 'TIRUCHULI',
    nameEn: 'Tiruchuli',
    nameTa: 'திருச்சுழி',
    pincode: '626129',
    description: 'Bhuminathar Sannathi & Kamuthi Road',
    lat: 9.5317,
    lng: 78.1977,
  },
];

export interface TnDistrict {
  code: string;
  nameEn: string;
  nameTa: string;
}

// Maps towns as localities for compatibility
export const TN_DISTRICTS: TnDistrict[] = VIRUDHUNAGAR_TOWNS.map((t) => ({
  code: t.code,
  nameEn: t.nameEn,
  nameTa: t.nameTa,
}));

export interface CutFilterOption {
  code: string;
  label: string;
  labelTa: string;
}

export const CUT_FILTER_OPTIONS: CutFilterOption[] = [
  { code: 'ALL', label: 'All Cuts', labelTa: 'அனைத்து வெட்டுக்கள்' },
  { code: 'CURRY_CUT', label: 'Curry Cut', labelTa: 'கறி வெட்டு' },
  { code: 'BIRYANI_CUT', label: 'Biryani Cut', labelTa: 'பிரியாணி வெட்டு' },
  { code: 'BONELESS', label: 'Boneless', labelTa: 'எலும்பில்லாத' },
  { code: 'WITH_BONE', label: 'With Bone', labelTa: 'எலும்புடன்' },
  { code: 'WHOLE', label: 'Whole Bird / Cut', labelTa: 'முழு கறி' },
  { code: 'SOUP_PIECES', label: 'Soup Bones', labelTa: 'சூப் எலும்பு' },
  { code: 'MINCE', label: 'Keema / Mince', labelTa: 'கொத்து கறி' },
];
