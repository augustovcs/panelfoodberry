import { ShoppingBag } from "lucide-react";
import { useStore } from "@/store";
import { formatCurrency, cn } from "@/lib/utils";

export function FloatingCart() {
  const cart = useStore((s) => s.cart);
  const setView = useStore((s) => s.setView);

  const count = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const total = cart.reduce((sum, ci) => sum + ci.totalPrice, 0);

  if (count === 0) return null;

  return (
    <button
      onClick={() => setView("cart")}
      className={cn(
        "fixed bottom-5 left-4 right-4 z-50 mx-auto max-w-[460px] lg:hidden",
        "flex items-center justify-between",
        "bg-primary text-primary-foreground",
        "rounded-2xl px-5 py-4",
        "shadow-cart",
        "active:scale-[0.98] transition-transform duration-150",
        "animate-slide-up",
        "cursor-pointer"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-sm font-bold tabular-nums">
          {count}
        </span>
        <span className="font-semibold text-[15px] flex items-center gap-2">
          <ShoppingBag className="w-[18px] h-[18px]" />
          Ver pedido
        </span>
      </div>
      <span className="font-bold text-base tabular-nums">
        {formatCurrency(total)}
      </span>
    </button>
  );
}
