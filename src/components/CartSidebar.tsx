import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store";
import { formatCurrency } from "@/lib/utils";

/** Persistent cart panel shown on desktop (lg+) — iFood / DeZap style. */
export function CartSidebar() {
  const cart = useStore((s) => s.cart);
  const setView = useStore((s) => s.setView);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const updateCartQuantity = useStore((s) => s.updateCartQuantity);

  const subtotal = cart.reduce((sum, ci) => sum + ci.totalPrice, 0);
  const count = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <aside className="hidden lg:block w-[340px] shrink-0">
      <div className="sticky top-[88px] rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <h2 className="font-display text-[16px] font-extrabold">
            Seu pedido
          </h2>
          {count > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-bold text-primary tabular-nums">
              {count} {count === 1 ? "item" : "itens"}
            </span>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-[13px] font-semibold">Carrinho vazio</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Adicione itens do cardápio para começar.
            </p>
          </div>
        ) : (
          <>
            <div className="max-h-[42vh] overflow-y-auto px-2 py-2">
              {cart.map((ci) => (
                <div key={ci.id} className="flex gap-2.5 rounded-xl p-2.5">
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg"
                    style={{ background: ci.image }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold leading-tight">
                        {ci.name}
                      </p>
                      <span className="shrink-0 text-[13px] font-bold tabular-nums">
                        {formatCurrency(ci.totalPrice)}
                      </span>
                    </div>
                    {ci.extras.length > 0 && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                        {ci.extras.join(", ")}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(ci.id, -1)}
                          disabled={ci.quantity <= 1}
                          className="grid h-6 w-6 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-colors cursor-pointer"
                          aria-label="Diminuir"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-[12px] font-semibold tabular-nums">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(ci.id, 1)}
                          className="grid h-6 w-6 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(ci.id)}
                        className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-border/60">
              <div className="flex justify-between text-[13px] text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-[15px] font-extrabold">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <Button
                onClick={() => setView("address")}
                className="mt-4 h-11 w-full rounded-xl text-[14px] font-bold cursor-pointer"
              >
                Continuar
              </Button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
