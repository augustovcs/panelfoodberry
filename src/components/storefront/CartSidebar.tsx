"use client";
import Link from "next/link";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useCart,
  useCartSubtotal,
  useCartCount,
  lineDisplayTotal,
} from "@/store/cart";
import { formatCurrency } from "@/lib/utils";

/** Painel do carrinho fixo no desktop (lg+) — estilo iFood / DeZap. */
export function CartSidebar({ ready }: { ready: boolean }) {
  const lines = useCart((s) => s.lines);
  const remove = useCart((s) => s.remove);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const subtotal = useCartSubtotal();
  const count = useCartCount();

  const isEmpty = !ready || lines.length === 0;

  return (
    <aside className="hidden w-[340px] shrink-0 lg:block">
      <div className="shadow-soft sticky top-[88px] overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="font-display text-[16px] font-extrabold">
            Seu pedido
          </h2>
          {ready && count > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-bold tabular-nums text-primary">
              {count} {count === 1 ? "item" : "itens"}
            </span>
          )}
        </div>

        {isEmpty ? (
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
              {lines.map((l) => (
                <div key={l.lineId} className="flex gap-2.5 rounded-xl p-2.5">
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg"
                    style={{ background: l.gradient }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold leading-tight">
                        {l.name}
                      </p>
                      <span className="shrink-0 text-[13px] font-bold tabular-nums">
                        {formatCurrency(lineDisplayTotal(l))}
                      </span>
                    </div>
                    {l.options.length > 0 && (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                        {l.options.map((o) => o.name).join(", ")}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dec(l.lineId)}
                          disabled={l.quantity <= 1}
                          className="grid h-6 w-6 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
                          aria-label="Diminuir"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-[12px] font-semibold tabular-nums">
                          {l.quantity}
                        </span>
                        <button
                          onClick={() => inc(l.lineId)}
                          className="grid h-6 w-6 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(l.lineId)}
                        className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/60 px-5 py-4">
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
                asChild
                className="mt-4 h-11 w-full rounded-xl text-[14px] font-bold"
              >
                <Link href="/carrinho">Continuar</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
