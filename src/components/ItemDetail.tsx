import { useState, useMemo } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FoodImage } from "./FoodImage";
import { useStore } from "@/store";
import { formatCurrency, cn } from "@/lib/utils";
import type { MenuItem, Category } from "@/types";

interface ItemDetailProps {
  item: MenuItem | null;
  category: Category | null;
  onClose: () => void;
}

export function ItemDetail({ item, category, onClose }: ItemDetailProps) {
  const addToCart = useStore((s) => s.addToCart);

  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const extras = item?.extras ?? [];

  const extrasTotal = useMemo(
    () =>
      [...selectedExtras].reduce((sum, eid) => {
        const e = extras.find((x) => x.id === eid);
        return sum + (e ? e.price : 0);
      }, 0),
    [selectedExtras, extras]
  );

  const totalPrice = item ? (item.price + extrasTotal) * quantity : 0;

  function toggleExtra(id: string) {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    if (!item) return;

    addToCart({
      itemId: item.id,
      name: item.name,
      image: item.image,
      basePrice: item.price,
      extras: [...selectedExtras]
        .map((eid) => extras.find((x) => x.id === eid)?.name ?? "")
        .filter(Boolean),
      extrasPrice: extrasTotal,
      notes: notes.trim(),
      quantity,
      totalPrice,
    });

    resetAndClose();
  }

  function resetAndClose() {
    setSelectedExtras(new Set());
    setNotes("");
    setQuantity(1);
    onClose();
  }

  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && resetAndClose()}>
      <SheetContent
        side="bottom"
        hideClose
        className="h-[92dvh] rounded-t-3xl p-0 flex flex-col overflow-hidden border-0"
      >
        {item && (
          <>
            <SheetTitle className="sr-only">{item.name}</SheetTitle>

            {/* Image Area */}
            <div className="relative h-56 shrink-0">
              <FoodImage
                item={item}
                category={category}
                className="h-full w-full"
                iconClassName="h-16 w-16"
              />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/40" />
              {item.badge && (
                <span className="absolute bottom-3 left-5 rounded-md bg-primary px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-5 pt-5 pb-4">
                <h2 className="font-display text-2xl font-extrabold leading-tight">
                  {item.name}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">
                  {item.description}
                </p>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <p className="text-lg font-extrabold text-primary tabular-nums">
                    {formatCurrency(item.price)}
                  </p>
                  {item.oldPrice && (
                    <span className="text-[13px] text-muted-foreground line-through tabular-nums">
                      {formatCurrency(item.oldPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Extras */}
              {extras.length > 0 && (
                <div className="px-5 pb-4">
                  <Separator className="mb-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Adicionais
                  </h3>
                  <div className="space-y-0.5">
                    {extras.map((extra) => {
                      const selected = selectedExtras.has(extra.id);
                      return (
                        <button
                          key={extra.id}
                          type="button"
                          onClick={() => toggleExtra(extra.id)}
                          className={cn(
                            "w-full flex items-center gap-3 py-3.5 px-3 -mx-3 rounded-xl transition-colors cursor-pointer",
                            selected ? "bg-primary/5" : "hover:bg-accent"
                          )}
                        >
                          <span
                            className={cn(
                              "w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150",
                              selected
                                ? "bg-primary border-primary"
                                : "border-border"
                            )}
                          >
                            {selected && (
                              <Check className="w-3 h-3 text-primary-foreground" />
                            )}
                          </span>
                          <span className="flex-1 text-left text-[14px] font-medium">
                            {extra.name}
                          </span>
                          <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">
                            + {formatCurrency(extra.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="px-5 pb-4">
                <Separator className="mb-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Alguma observação?
                </h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: sem cebola, ponto da carne mal passado..."
                  className="min-h-[72px] resize-none text-[14px] bg-secondary/50 border-border/60"
                />
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-center gap-5 py-4 px-5">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold tabular-nums min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border p-4 safe-bottom">
              <Button
                onClick={handleAdd}
                size="lg"
                className="w-full h-12 text-[15px] font-bold rounded-xl cursor-pointer"
              >
                Adicionar {formatCurrency(totalPrice)}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
