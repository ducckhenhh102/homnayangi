import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'hnag_discovery_preferences';

const DEFAULT_PREFERENCES = {
  diningType: 'meal',  // 'snack' | 'meal' | 'drinking'
  radiusKm: 5,        // 1..10
  location: {
    type: 'manual',    // 'gps' | 'manual'
    lat: 21.028511,    // Hà Nội center default fallback
    lng: 105.854444,
    address: 'Hoàn Kiếm, Hà Nội',
  },
};

const DiscoveryContext = createContext(null);

export function DiscoveryProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          diningType: parsed.diningType || DEFAULT_PREFERENCES.diningType,
          radiusKm: Math.min(10, Math.max(1, Number(parsed.radiusKm) || 5)),
          location: parsed.location || DEFAULT_PREFERENCES.location,
        };
      }
    } catch (e) {
      console.warn('Could not load preferences from localStorage', e);
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Could not save preferences to localStorage', e);
    }
  }, [preferences]);

  const setDiningType = (diningType) => {
    setPreferences((prev) => ({ ...prev, diningType }));
  };

  const setRadiusKm = (radiusKm) => {
    const clamped = Math.min(10, Math.max(1, Number(radiusKm) || 5));
    setPreferences((prev) => ({ ...prev, radiusKm: clamped }));
  };

  const setLocation = (location) => {
    setPreferences((prev) => ({ ...prev, location }));
  };

  return (
    <DiscoveryContext.Provider
      value={{
        preferences,
        setDiningType,
        setRadiusKm,
        setLocation,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const context = useContext(DiscoveryContext);
  if (!context) {
    throw new Error('useDiscovery must be used within a DiscoveryProvider');
  }
  return context;
}
