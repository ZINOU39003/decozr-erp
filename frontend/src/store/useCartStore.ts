import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  designId: string;
  designVersionId?: string;
  code: string;
  name_ar: string;
  image_url?: string | null;
  unit_price: number;
  quantity: number;
  options?: Record<string, unknown>;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (designId: string) => void;
  updateQuantity: (designId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.designId === item.designId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.designId === item.designId
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                designId: item.designId,
                designVersionId: item.designVersionId,
                code: item.code,
                name_ar: item.name_ar,
                image_url: item.image_url,
                unit_price: item.unit_price || 0,
                quantity: item.quantity || 1,
                options: item.options || {},
              },
            ],
          };
        });
      },
      removeItem: (designId) =>
        set((state) => ({ items: state.items.filter((i) => i.designId !== designId) })),
      updateQuantity: (designId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.designId === designId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),
    }),
    { name: 'decozr-cart' }
  )
);
