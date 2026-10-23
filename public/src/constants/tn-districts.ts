export interface TnDistrict {
  code: string;
  nameEn: string;
  nameTa: string;
}

export const TN_DISTRICTS: TnDistrict[] = [
  { code: 'CHENNAI', nameEn: 'Chennai', nameTa: 'சென்னை' },
  { code: 'COIMBATORE', nameEn: 'Coimbatore', nameTa: 'கோயம்புத்தூர்' },
  { code: 'MADURAI', nameEn: 'Madurai', nameTa: 'மதுரை' },
  { code: 'TIRUCHIRAPPALLI', nameEn: 'Tiruchirappalli', nameTa: 'திருச்சிராப்பள்ளி' },
  { code: 'SALEM', nameEn: 'Salem', nameTa: 'சேலம்' },
  { code: 'TIRUNELVELI', nameEn: 'Tirunelveli', nameTa: 'திருநெல்வேலி' },
  { code: 'TIRUPPUR', nameEn: 'Tiruppur', nameTa: 'திருப்பூர்' },
  { code: 'ERODE', nameEn: 'Erode', nameTa: 'ஈரோடு' },
  { code: 'VELLORE', nameEn: 'Vellore', nameTa: 'வேலூர்' },
  { code: 'THOOTHUKUDI', nameEn: 'Thoothukudi', nameTa: 'தூத்துக்குடி' },
  { code: 'DINDIGUL', nameEn: 'Dindigul', nameTa: 'திண்டுக்கல்' },
  { code: 'THANJAVUR', nameEn: 'Thanjavur', nameTa: 'தஞ்சாவூர்' },
  { code: 'RANIPET', nameEn: 'Ranipet', nameTa: 'இராணிப்பேட்டை' },
  { code: 'VIRUDHUNAGAR', nameEn: 'Virudhunagar', nameTa: 'விருதுநகர்' },
  { code: 'KARUR', nameEn: 'Karur', nameTa: 'கரூர்' },
  { code: 'NILGIRIS', nameEn: 'Nilgiris', nameTa: 'நீலகிரி' },
  { code: 'KRISHNAGIRI', nameEn: 'Krishnagiri', nameTa: 'கிருஷ்ணகிரி' },
  { code: 'KANCHEEPURAM', nameEn: 'Kancheepuram', nameTa: 'காஞ்சிபுரம்' },
  { code: 'CHENGALPATTU', nameEn: 'Chengalpattu', nameTa: 'செங்கல்பட்டு' },
  { code: 'TIRUVALLUR', nameEn: 'Tiruvallur', nameTa: 'திருவள்ளூர்' },
  { code: 'CUDDALORE', nameEn: 'Cuddalore', nameTa: 'கடலூர்' },
  { code: 'NAGAPATTINAM', nameEn: 'Nagapattinam', nameTa: 'நாகப்பட்டினம்' },
  { code: 'MAYILADUTHURAI', nameEn: 'Mayiladuthurai', nameTa: 'மயிலாடுதுறை' },
  { code: 'TIRUVARUR', nameEn: 'Tiruvarur', nameTa: 'திருவாரூர்' },
  { code: 'PUDUKKOTTAI', nameEn: 'Pudukkottai', nameTa: 'புதுக்கோட்டை' },
  { code: 'SIVAGANGA', nameEn: 'Sivaganga', nameTa: 'சிவகங்கை' },
  { code: 'RAMANATHAPURAM', nameEn: 'Ramanathapuram', nameTa: 'இராமநாதபுரம்' },
  { code: 'THENI', nameEn: 'Theni', nameTa: 'தேனி' },
  { code: 'TENKASI', nameEn: 'Tenkasi', nameTa: 'தென்காசி' },
  { code: 'KANNIYAKUMARI', nameEn: 'Kanniyakumari', nameTa: 'கன்னியாகுமரி' },
  { code: 'NAMAKKAL', nameEn: 'Namakkal', nameTa: 'நாமக்கல்' },
  { code: 'DHARMAPURI', nameEn: 'Dharmapuri', nameTa: 'தருமபுரி' },
  { code: 'TIRUPATHUR', nameEn: 'Tirupathur', nameTa: 'திருப்பத்தூர்' },
  { code: 'TIRUVANNAMALAI', nameEn: 'Tiruvannamalai', nameTa: 'திருவண்ணாமலை' },
  { code: 'VILUPPURAM', nameEn: 'Viluppuram', nameTa: 'விழுப்புரம்' },
  { code: 'KALLAKURICHI', nameEn: 'Kallakurichi', nameTa: 'கள்ளக்குறிச்சி' },
  { code: 'PERAMBALUR', nameEn: 'Perambalur', nameTa: 'பெரம்பலூர்' },
  { code: 'ARIYALUR', nameEn: 'Ariyalur', nameTa: 'அரியலூர்' },
];

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
