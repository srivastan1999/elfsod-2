import { create } from 'zustand';

interface CampaignDatesStore {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  clearDates: () => void;
  initializeFromStorage: () => boolean;
  initializeDefaultDates: () => void;
}

// Helper function to get default dates
const getDefaultDates = () => {
  if (typeof window === 'undefined') {
    return { startDate: '', endDate: '' };
  }
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    startDate: formatDate(today),
    endDate: formatDate(tomorrow),
  };
};

export const useCampaignDatesStore = create<CampaignDatesStore>((set, get) => ({
  startDate: '',
  endDate: '',
  setStartDate: (date) => {
    set({ startDate: date });
    if (typeof window !== 'undefined') {
      if (date) {
        sessionStorage.setItem('campaignStartDate', date);
      } else {
        sessionStorage.removeItem('campaignStartDate');
      }
    }
  },
  setEndDate: (date) => {
    set({ endDate: date });
    if (typeof window !== 'undefined') {
      if (date) {
        sessionStorage.setItem('campaignEndDate', date);
      } else {
        sessionStorage.removeItem('campaignEndDate');
      }
    }
  },
  clearDates: () => {
    set({ startDate: '', endDate: '' });
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('campaignStartDate');
      sessionStorage.removeItem('campaignEndDate');
    }
  },
  initializeFromStorage: () => {
    if (typeof window !== 'undefined') {
      const storedStartDate = sessionStorage.getItem('campaignStartDate');
      const storedEndDate = sessionStorage.getItem('campaignEndDate');
      if (storedStartDate || storedEndDate) {
        set({
          startDate: storedStartDate || '',
          endDate: storedEndDate || '',
        });
        return true; // Dates were loaded from storage
      }
    }
    return false; // No dates in storage
  },
  initializeDefaultDates: () => {
    const dates = getDefaultDates();
    set({
      startDate: dates.startDate,
      endDate: dates.endDate,
    });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('campaignStartDate', dates.startDate);
      sessionStorage.setItem('campaignEndDate', dates.endDate);
    }
  },
}));

// Initialize dates on module load (client-side only)
if (typeof window !== 'undefined') {
  const store = useCampaignDatesStore.getState();
  // Try to load from storage first, if not found, use default dates
  const loadedFromStorage = store.initializeFromStorage();
  if (!loadedFromStorage) {
    store.initializeDefaultDates();
  }
}

