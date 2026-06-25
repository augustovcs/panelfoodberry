import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BackHeader } from "./BackHeader";
import { useStore } from "@/store";
import { formatCurrency, cn } from "@/lib/utils";

export function CartView() {
  const cart = useStore((s) => s.cart);
  const setView = useStore((s) => s.setView);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const updateCartQuantity = useStore((s) => s.updateCartQuantity);

  const subtotal = cart.reduce((sum, ci) => sum + ci.totalPrice, 0);

  return (
    <>
      <BackHeader title="Meu Pedido" backTo="menu" />

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
            <ShoppingBag className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold mb-1">Carrinho vazio</h2>
          <p className="text-sm text-muted-foreground max-w-[240px] mb-6">
            Explore o cardápio e adicione itens ao seu pedido.
          </p>
          <Button
            onClick={() => setView("menu")}
            className="rounded-xl cursor-pointer"
          >
            Ver cardápio
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
          {/* Items */}
          <div className="flex-1">
            {cart.map((ci, idx) => (
              <div
                key={ci.id}
                className={cn(
                  "flex gap-3 px-4 py-4 animate-slide-up",
                  idx < cart.length - 1 && "border-b border-border/60"
                )}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div
                  className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ background: ci.image }}
                >
                  <ShoppingBag className="w-5 h-5 text-white/60" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[14px] font-semibold leading-snug">
                      {ci.name}
                    </h3>
                    <span className="text-[14px] font-bold text-primary tabular-nums shrink-0">
                      {formatCurrency(ci.totalPrice)}
                    </span>
                  </div>

                  {ci.extras.length > 0 && (
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      {ci.extras.join(", ")}
                    </p>
                  )}
                  {ci.notes && (
                    <p className="text-[12px] text-muted-foreground/70 italic mt-0.5">
                      &ldquo;{ci.notes}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCartQuantity(ci.id, -1)}
                        disabled={ci.quantity <= 1}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[14px] font-semibold tabular-nums min-w-[20px] text-center">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(ci.id, 1)}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(ci.id)}
                      className="text-[12px] text-destructive font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-secondary/50 px-4 py-4 mt-auto">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 py-4 safe-bottom space-y-2.5">
            <Button
              onClick={() => setView("address")}
              size="lg"
              className="w-full h-12 text-[15px] font-bold rounded-xl cursor-pointer"
            >
              Continuar
            </Button>
            <Button
              onClick={() => setView("menu")}
              variant="ghost"
              className="w-full text-[13px] cursor-pointer"
            >
              Adicionar mais itens
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
