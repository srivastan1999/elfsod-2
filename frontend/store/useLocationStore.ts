import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCityFromCoordinates } from '@/lib/googlePlaces';

interface LocationStore {
  selectedCity: string | null;
  hasAutoDetected: boolean;
  setSelectedCity: (city: string) => void;
  clearCity: () => void;
  setAutoDetected: (value: boolean) => void;
}

// Helper function to detect location on initial load
const detectInitialLocation = async (setSelectedCity: (city: string) => void, setAutoDetected: (value: boolean) => void) => {
  // Only run on client side
  if (typeof window === 'undefined') return;
  
  // Check if we've already auto-detected (to avoid repeated requests)
  const hasAutoDetected = sessionStorage.getItem('location-auto-detected') === 'true';
  if (hasAutoDetected) {
    setAutoDetected(true);
    return;
  }

  // Check if user has manually selected a location
  const savedCity = localStorage.getItem('location-storage');
  if (savedCity) {
    try {
      const parsed = JSON.parse(savedCity);
      if (parsed.state?.selectedCity) {
        // User has a saved location, don't auto-detect
        setAutoDetected(true);
        return;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Request location permission and detect city
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const city = await getCityFromCoordinates(latitude, longitude);
          if (city) {
            setSelectedCity(city);
            setAutoDetected(true);
            sessionStorage.setItem('location-auto-detected', 'true');
            console.log('✅ Auto-detected location:', city);
          } else {
            // Fallback to Mumbai if detection fails
            setSelectedCity('Mumbai');
            setAutoDetected(true);
            sessionStorage.setItem('location-auto-detected', 'true');
          }
        } catch (error) {
          console.error('Error detecting city from coordinates:', error);
          // Fallback to Mumbai
          setSelectedCity('Mumbai');
          setAutoDetected(true);
          sessionStorage.setItem('location-auto-detected', 'true');
        }
      },
      (error) => {
        console.log('Location access denied or unavailable:', error);
        // Fallback to Mumbai if permission denied
        setSelectedCity('Mumbai');
        setAutoDetected(true);
        sessionStorage.setItem('location-auto-detected', 'true');
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // 5 minutes
      }
    );
  } else {
    // Geolocation not supported, use default
    setSelectedCity('Mumbai');
    setAutoDetected(true);
    sessionStorage.setItem('location-auto-detected', 'true');
  }
};

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      selectedCity: null,
      hasAutoDetected: false,
      setSelectedCity: (city: string) => {
        set({ selectedCity: city });
      },
      clearCity: () => {
        set({ selectedCity: null, hasAutoDetected: false });
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('location-auto-detected');
        }
      },
      setAutoDetected: (value: boolean) => {
        set({ hasAutoDetected: value });
      },
    }),
    {
      name: 'location-storage', // unique name for localStorage key
      partialize: (state) => ({ selectedCity: state.selectedCity }), // only persist selectedCity
    }
  )
);

// Initialize location detection on module load (client-side only)
if (typeof window !== 'undefined') {
  const store = useLocationStore.getState();
  
  // Only auto-detect if no city is saved and we haven't already detected
  const savedCity = localStorage.getItem('location-storage');
  let shouldAutoDetect = true;
  
  if (savedCity) {
    try {
      const parsed = JSON.parse(savedCity);
      if (parsed.state?.selectedCity) {
        shouldAutoDetect = false;
      }
    } catch (e) {
      // If parsing fails, proceed with auto-detection
    }
  }
  
  if (shouldAutoDetect && !store.hasAutoDetected) {
    detectInitialLocation(store.setSelectedCity, store.setAutoDetected);
  }
}

