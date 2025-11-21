import { create } from 'zustand';

interface FilterStore {
  isOpen: boolean;
  openFilters: () => void;
  closeFilters: () => void;
  toggleFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  isOpen: false,
  openFilters: () => set({ isOpen: true }),
  closeFilters: () => set({ isOpen: false }),
  toggleFilters: () => set((state) => ({ isOpen: !state.isOpen })),
}));

