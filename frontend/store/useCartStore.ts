import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, AdSpace } from '@/types';

interface CartStore {
  items: CartItem[];
  userId: string | null;
  addItem: (adSpace: AdSpace, startDate: string, endDate: string, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  setUserId: (userId: string | null) => void;
  markItemsAsPending: (quoteRequestId: string) => void;
  markItemsAsApproved: (quoteRequestId: string) => void;
  markItemsAsRejected: (quoteRequestId: string) => void;
  getTotal: () => number;
  getItemCount: () => number;
  getPendingCount: () => number;
  getGuestCart: () => CartItem[];
  mergeGuestCart: (userId: string) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,
  
  setUserId: (userId) => {
    set({ userId });
  },

  addItem: (adSpace, startDate, endDate, quantity = 1) => {
    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const subtotal = adSpace.price_per_day * days * quantity;
    const currentUserId = get().userId || 'guest';
    
    const newItem: CartItem = {
      id: `temp-${Date.now()}`,
      user_id: currentUserId,
      ad_space_id: adSpace.id,
      ad_space: adSpace,
      start_date: startDate,
      end_date: endDate,
      quantity,
      subtotal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    set((state) => ({
      items: [...state.items, newItem],
    }));
  },
  
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
  
  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              updated_at: new Date().toISOString(),
            }
          : item
      ),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  markItemsAsPending: (quoteRequestId: string) => {
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        approval_status: 'pending' as const,
        quote_request_id: quoteRequestId,
        updated_at: new Date().toISOString(),
      })),
    }));
  },
  
  markItemsAsApproved: (quoteRequestId: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.quote_request_id === quoteRequestId
          ? {
              ...item,
              approval_status: 'approved' as const,
              updated_at: new Date().toISOString(),
            }
          : item
      ),
    }));
  },
  
  markItemsAsRejected: (quoteRequestId: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.quote_request_id === quoteRequestId
          ? {
              ...item,
              approval_status: 'rejected' as const,
              updated_at: new Date().toISOString(),
            }
          : item
      ),
    }));
  },
  
  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },
  
  getItemCount: () => {
    return get().items.length;
  },
  
  getPendingCount: () => {
    return get().items.filter((item) => item.approval_status === 'pending').length;
  },
  
  getGuestCart: () => {
    return get().items.filter((item) => item.user_id === 'guest');
  },
  
  mergeGuestCart: (userId) => {
    // This is called after user signs in to keep their guest cart items
    // Update all guest items to be associated with the user
    set((state) => ({
      items: state.items.map((item) =>
        item.user_id === 'guest'
          ? { ...item, user_id: userId, updated_at: new Date().toISOString() }
          : item
      ),
      userId,
    }));
    console.log('Guest cart merged with user account:', userId);
  },
    }),
    {
      name: 'elfsod-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

