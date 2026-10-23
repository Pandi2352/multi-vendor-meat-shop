import { createContext, useContext, useState, type ReactNode } from 'react';
import { VIRUDHUNAGAR_TOWNS, type VirudhunagarTown } from '@/constants/tn-districts';

interface DistrictContextValue {
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedTown: VirudhunagarTown;
  selectedCut: string;
  setSelectedCut: (cut: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DistrictContext = createContext<DistrictContextValue | null>(null);

const STORAGE_KEY = 'virudhunagar_meat_selected_town';

export function DistrictProvider({ children }: { children: ReactNode }) {
  const [selectedDistrict, setSelectedDistrictState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const exists = VIRUDHUNAGAR_TOWNS.some((t) => t.nameEn === saved);
      return exists && saved ? saved : 'Virudhunagar Town';
    } catch {
      return 'Virudhunagar Town';
    }
  });

  const [selectedCut, setSelectedCut] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const setSelectedDistrict = (district: string) => {
    setSelectedDistrictState(district);
    try {
      localStorage.setItem(STORAGE_KEY, district);
    } catch {
      // ignore storage failure
    }
  };

  const selectedTown =
    VIRUDHUNAGAR_TOWNS.find((t) => t.nameEn === selectedDistrict) ||
    VIRUDHUNAGAR_TOWNS[0];

  return (
    <DistrictContext.Provider
      value={{
        selectedDistrict,
        setSelectedDistrict,
        selectedTown,
        selectedCut,
        setSelectedCut,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </DistrictContext.Provider>
  );
}

export function useDistrict(): DistrictContextValue {
  const ctx = useContext(DistrictContext);
  if (!ctx) {
    throw new Error('useDistrict must be used within a DistrictProvider');
  }
  return ctx;
}
