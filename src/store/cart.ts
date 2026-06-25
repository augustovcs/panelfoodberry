"use client";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine } from "@/lib/types";
import { cartSubtotal, lineTotal } from "@/lib/domain/money";

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, "lineId">) => void;
  remove: (lineId: string) => void;
  setQty: (lineId: string, qty: number) => void;
  inc: (lineId: string) => void;
  dec: (lineId: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((s) => ({
          lines: [...s.lines, { ...line, lineId: crypto.randomUUID() }],
        })),
      remove: (lineId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.lineId !== lineId) })),
      setQty: (lineId, qty) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.lineId === lineId ? { ...l, quantity: Math.max(1, qty) } : l,
          ),
        })),
      inc: (lineId) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.lineId === lineId ? { ...l, quantity: l.quantity + 1 } : l,
          ),
        })),
      dec: (lineId) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.lineId === lineId
              ? { ...l, quantity: Math.max(1, l.quantity - 1) }
              : l,
          ),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "anotabem-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // evita mismatch de hidratação no SSR
    },
  ),
);

/* ── Seletores derivados ── */

export const lineDisplayTotal = (line: CartLine) =>
  lineTotal(line.basePrice, line.options, line.quantity);

export function useCartCount(): number {
  return useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
}

export function useCartSubtotal(): number {
  return useCart((s) => cartSubtotal(s.lines));
}

/**
 * Reidrata a store do localStorage no client e informa quando terminou.
 * Componentes que dependem do carrinho devem aguardar para não divergir do SSR.
 */
export function useCartHydrated(): boolean {
  // Inicia `false` no SSR (não acessa a persist API no servidor) e reidrata no client.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useCart.persist.onFinishHydration(() => setHydrated(true));
    void useCart.persist.rehydrate();
    if (useCart.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  return hydrated;
}
