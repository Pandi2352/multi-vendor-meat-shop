import { createContext, useContext, useState, type ReactNode } from 'react';

interface DistrictContextValue {
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedCut: string;
  setSelectedCut: (cut: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DistrictContext = createContext<DistrictContextValue | null>(null);

const STORAGE_KEY = 'tn_meat_selected_district';

export function DistrictProvider({ children }: { children: ReactNode }) {
  const [selectedDistrict, setSelectedDistrictState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'Chennai';
    } catch {
      return 'Chennai';
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

  return (
    <DistrictContext.Provider
      value={{
        selectedDistrict,
        setSelectedDistrict,
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
