"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CompareState = {
  productIds: string[];
  toggle: (id: string) => void;
};

const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (id) => {
        const { productIds } = get();
        set({
          productIds: productIds.includes(id)
            ? productIds.filter((p) => p !== id)
            : [...productIds, id].slice(-4),
        });
      },
    }),
    { name: "compare-list" }
  )
);

export function useCompare(productId: string) {
  const { productIds, toggle } = useCompareStore();
  return { isComparing: productIds.includes(productId), toggle: () => toggle(productId) };
}
