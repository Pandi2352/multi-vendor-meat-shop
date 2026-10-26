import { createContext, useContext, useState, type ReactNode } from 'react';
import { VIRUDHUNAGAR_TOWNS, type VirudhunagarTown } from '@/constants/tn-districts';
import { calculateDistanceKm } from '@/utils';

interface DistrictContextValue {
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedTown: VirudhunagarTown;
  selectedCut: string;
  setSelectedCut: (cut: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userCoords: { lat: number; lng: number } | null;
  isLocating: boolean;
  detectLocation: () => Promise<void>;
  isGpsDetected: boolean;
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
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGpsDetected, setIsGpsDetected] = useState<boolean>(false);

  const setSelectedDistrict = (district: string) => {
    setSelectedDistrictState(district);
    setIsGpsDetected(false);
    try {
      localStorage.setItem(STORAGE_KEY, district);
    } catch {
      // ignore storage failure
    }
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
        });
      });

      const { latitude, longitude } = pos.coords;
      setUserCoords({ lat: latitude, lng: longitude });
      setIsGpsDetected(true);

      // Find the closest town
      let closestTown = VIRUDHUNAGAR_TOWNS[0];
      let minDistance = Infinity;

      for (const town of VIRUDHUNAGAR_TOWNS) {
        const d = calculateDistanceKm(latitude, longitude, town.lat, town.lng);
        if (d < minDistance) {
          minDistance = d;
          closestTown = town;
        }
      }

      setSelectedDistrictState(closestTown.nameEn);
      try {
        localStorage.setItem(STORAGE_KEY, closestTown.nameEn);
      } catch {
        // ignore
      }
    } catch {
      // Fallback silently if user denies geolocation permission
    } finally {
      setIsLocating(false);
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
        userCoords,
        isLocating,
        detectLocation,
        isGpsDetected,
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
