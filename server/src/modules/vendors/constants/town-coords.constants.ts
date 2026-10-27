export interface Coordinates {
  lat: number;
  lng: number;
}

export const VIRUDHUNAGAR_TOWN_COORDINATES: Record<string, Coordinates> = {
  'Virudhunagar Town': { lat: 9.568, lng: 77.9624 },
  Virudhunagar: { lat: 9.568, lng: 77.9624 },
  Sivakasi: { lat: 9.4533, lng: 77.8024 },
  Rajapalayam: { lat: 9.4532, lng: 77.5544 },
  Aruppukkottai: { lat: 9.5108, lng: 78.0984 },
  Srivilliputhur: { lat: 9.5098, lng: 77.6322 },
  Sattur: { lat: 9.3621, lng: 77.9254 },
  Thiruthangal: { lat: 9.4819, lng: 77.8067 },
  Kariapatti: { lat: 9.6806, lng: 78.1408 },
  Watrap: { lat: 9.6385, lng: 77.6401 },
  Tiruchuli: { lat: 9.5317, lng: 78.1977 },
};

export const getVirudhunagarCoords = (townName: string): Coordinates => {
  return (
    VIRUDHUNAGAR_TOWN_COORDINATES[townName] ||
    VIRUDHUNAGAR_TOWN_COORDINATES['Virudhunagar Town'] || { lat: 9.568, lng: 77.9624 }
  );
};
