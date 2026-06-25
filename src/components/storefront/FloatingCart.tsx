"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart, useCartCount, lineDisplayTotal } from "@/store/cart";
import { formatCurrency, cn } from "@/lib/utils";

/** Botão flutuante do carrinho (mobile). Aparece só com itens no carrinho. */
export function FloatingCart({ ready }: { ready: boolean }) {
  const count = useCartCount();
  const total = useCart((s) =>
    s.lines.reduce((sum, l) => sum + lineDisplayTotal(l), 0),
  );

  if (!ready || count === 0) return null;

  return (
    <Link
      href="/carrinho"
      className={cn(
        "fixed bottom-5 left-4 right-4 z-50 mx-auto max-w-[460px] lg:hidden",
        "flex items-center justify-between",
        "rounded-2xl bg-primary px-5 py-4 text-primary-foreground",
        "shadow-cart transition-transform duration-150 active:scale-[0.98]",
        "animate-slide-up",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm font-bold tabular-nums">
          {count}
        </span>
        <span className="flex items-center gap-2 text-[15px] font-semibold">
          <ShoppingBag className="h-[18px] w-[18px]" />
          Ver pedido
        </span>
      </div>
      <span className="text-base font-bold tabular-nums">
        {formatCurrency(total)}
      </span>
    </Link>
  );
}
