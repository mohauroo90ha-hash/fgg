import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";

interface CartState {
  items: CartLine[];
  addItem: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId?: string) => void;
  setQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (line) => {
        const qty = line.quantity ?? 1;
        const { items } = get();
        const existing = items.find(
          (i) => i.productId === line.productId && i.variantId === line.variantId
        );

        if (existing) {
          const nextQty = Math.min(existing.quantity + qty, existing.stock || 99);
          set({
            items: items.map((i) =>
              i === existing ? { ...i, quantity: nextQty } : i
            ),
          });
        } else {
          set({ items: [...items, { ...line, quantity: qty }] });
        }
      },

      removeItem: (productId, variantId) =>
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }),

      setQuantity: (productId, variantId, quantity) =>
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock || 99)) }
              : i
          ),
        }),

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "mtraders-cart",
    }
  )
);
