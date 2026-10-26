export interface MeatCategoryMeta {
  slug: string;
  name: string;
  tamilName: string;
  description: string;
  badgeColor: string;
}

export const VIRUDHUNAGAR_MEAT_CATEGORIES: MeatCategoryMeta[] = [
  {
    slug: 'broiler-chicken',
    name: 'Broiler Chicken',
    tamilName: 'பிராய்லர் சிக்கன்',
    description: 'Fresh farm-dressed chicken, curry cut, biryani cut & boneless',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
  {
    slug: 'nattu-kozhi',
    name: 'Nattu Kozhi (Country Chicken)',
    tamilName: 'நாட்டுக்கோழி',
    description: 'Authentic village-raised country chicken with rich traditional flavor',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
  },
  {
    slug: 'goat-mutton',
    name: 'Tender Goat Mutton',
    tamilName: 'ஆட்டுக்கறி',
    description: 'Grass-fed farm-reared tender goat meat, butchered fresh daily',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  },
  {
    slug: 'keema',
    name: 'Mutton & Chicken Keema',
    tamilName: 'கீமா / கொத்துக்கறி',
    description: 'Finely minced tender meat for koftas, rolls, and rich Chettinad gravies',
    badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  },
  {
    slug: 'kadai-quail',
    name: 'Kadai (Quail)',
    tamilName: 'காடை',
    description: 'Farm-raised Japanese quail (kadai), whole dressed and ready to cook',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
  {
    slug: 'fish-seafood',
    name: 'Sea Fish & Prawns',
    tamilName: 'கடல் மீன் & இறால்',
    description: 'Gulf of Mannar coastal sea catch, Seer fish (Vanjaram), and fresh prawns',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  },
];
