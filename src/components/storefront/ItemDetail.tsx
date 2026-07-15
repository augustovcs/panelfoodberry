"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
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
        className={cn(
          "flex h-[92dvh] flex-col overflow-hidden rounded-t-3xl border-0 p-0",
          // Desktop: cartão centrado com largura fixa — evita a foto esticada.
          "lg:bottom-6 lg:mx-auto lg:h-auto lg:max-h-[86vh] lg:max-w-[440px] lg:rounded-3xl",
        )}
      >
        {item && (
          <>
            <SheetTitle className="sr-only">{item.name}</SheetTitle>

            <div className="relative h-56 shrink-0 lg:h-60">
              <FoodImage
                name={item.name}
                gradient={item.gradient}
                imageUrl={item.imageUrl}
                icon={category ? iconByName(category.icon) : undefined}
                className="h-full w-full"
                iconClassName="h-16 w-16"
                sizes="(min-width: 1024px) 440px, 100vw"
              />
              <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-white/50 lg:hidden" />

              <SheetClose
                aria-label="Fechar"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </SheetClose>

              {item.badge && (
                <span className="absolute bottom-3 left-5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-5 pb-4 pt-5">
                <h2 className="font-display text-[26px] font-extrabold leading-tight">
                  {item.name}
                </h2>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-xl font-extrabold tabular-nums text-primary">
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
            </div>

            {/* Barra fixa: stepper de quantidade + adicionar. */}
            <div className="safe-bottom shrink-0 border-t border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-background p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[24px] text-center text-[15px] font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-primary"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="shadow-cart flex h-12 flex-1 items-center justify-between rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground transition-transform active:scale-[0.98]"
                >
                  <span>Adicionar</span>
                  <span className="tabular-nums">
                    {formatCurrency(totalPrice)}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
