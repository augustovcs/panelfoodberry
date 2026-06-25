"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FoodImage } from "./FoodImage";
import { iconByName } from "@/lib/menu/icons";
import { useCart } from "@/store/cart";
import { lineUnitPrice } from "@/lib/domain/money";
import type { MenuItem, MenuCategory, MenuOptionGroup } from "@/lib/menu/types";
import { formatCurrency, cn } from "@/lib/utils";

interface ItemDetailProps {
  item: MenuItem | null;
  category: MenuCategory | null;
  onClose: () => void;
}

export function ItemDetail({ item, category, onClose }: ItemDetailProps) {
  const add = useCart((s) => s.add);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Reseta o estado a cada item aberto.
  useEffect(() => {
    setSelected(new Set());
    setNotes("");
    setQuantity(1);
  }, [item?.id]);

  const groups = useMemo(() => item?.optionGroups ?? [], [item]);

  const selectedOptions = useMemo(
    () =>
      groups.flatMap((g) =>
        g.options.filter((o) => selected.has(o.id)).map((o) => ({ ...o })),
      ),
    [groups, selected],
  );

  const unitPrice = item ? lineUnitPrice(item.price, selectedOptions) : 0;
  const totalPrice = unitPrice * quantity;

  function toggle(group: MenuOptionGroup, optionId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
        return next;
      }
      const inGroup = group.options.filter((o) => next.has(o.id)).length;
      if (group.maxSelect === 1) {
        group.options.forEach((o) => next.delete(o.id)); // comportamento radio
      } else if (inGroup >= group.maxSelect) {
        return prev; // limite do grupo atingido
      }
      next.add(optionId);
      return next;
    });
  }

  function handleAdd() {
    if (!item) return;
    add({
      itemId: item.id,
      name: item.name,
      gradient: item.gradient,
      imageUrl: item.imageUrl,
      basePrice: item.price,
      options: selectedOptions.map((o) => ({
        id: o.id,
        name: o.name,
        price: o.price,
      })),
      notes: notes.trim(),
      quantity,
    });
    onClose();
  }

  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        hideClose
        className="flex h-[92dvh] flex-col overflow-hidden rounded-t-3xl border-0 p-0"
      >
        {item && (
          <>
            <SheetTitle className="sr-only">{item.name}</SheetTitle>

            <div className="relative h-56 shrink-0">
              <FoodImage
                name={item.name}
                gradient={item.gradient}
                imageUrl={item.imageUrl}
                icon={category ? iconByName(category.icon) : undefined}
                className="h-full w-full"
                iconClassName="h-16 w-16"
                sizes="100vw"
              />
              <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-white/40" />
              {item.badge && (
                <span className="absolute bottom-3 left-5 rounded-md bg-primary px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-5 pb-4 pt-5">
                <h2 className="font-display text-2xl font-extrabold leading-tight">
                  {item.name}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <p className="text-lg font-extrabold tabular-nums text-primary">
                    {formatCurrency(item.price)}
                  </p>
                  {item.oldPrice && (
                    <span className="text-[13px] tabular-nums text-muted-foreground line-through">
                      {formatCurrency(item.oldPrice)}
                    </span>
                  )}
                </div>
              </div>

              {groups.map((group) => (
                <div key={group.id} className="px-5 pb-4">
                  <Separator className="mb-4" />
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {group.name}
                  </h3>
                  <div className="space-y-0.5">
                    {group.options.map((option) => {
                      const isOn = selected.has(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggle(group, option.id)}
                          className={cn(
                            "-mx-3 flex w-full items-center gap-3 rounded-xl px-3 py-3.5 transition-colors",
                            isOn ? "bg-primary/5" : "hover:bg-accent",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150",
                              isOn
                                ? "border-primary bg-primary"
                                : "border-border",
                            )}
                          >
                            {isOn && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </span>
                          <span className="flex-1 text-left text-[14px] font-medium">
                            {option.name}
                          </span>
                          <span className="text-[13px] font-semibold tabular-nums text-muted-foreground">
                            + {formatCurrency(option.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="px-5 pb-4">
                <Separator className="mb-4" />
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Alguma observação?
                </h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: sem cebola, ponto da carne mal passado..."
                  className="min-h-[72px] resize-none border-border/60 bg-secondary/50 text-[14px]"
                  maxLength={200}
                />
              </div>

              <div className="flex items-center justify-center gap-5 px-5 py-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[32px] text-center text-xl font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="safe-bottom shrink-0 border-t border-border p-4">
              <Button
                onClick={handleAdd}
                size="lg"
                className="h-12 w-full rounded-xl text-[15px] font-bold"
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
