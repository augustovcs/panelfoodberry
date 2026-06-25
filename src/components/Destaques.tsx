import { Flame } from "lucide-react";
import { FoodImage } from "./FoodImage";
import { FEATURED_ITEMS } from "@/data";
import { formatCurrency } from "@/lib/utils";
import type { MenuItem } from "@/types";

interface DestaquesProps {
  onSelect: (item: MenuItem) => void;
}

export function Destaques({ onSelect }: DestaquesProps) {
  if (FEATURED_ITEMS.length === 0) return null;

  return (
    <section className="pt-6 -mx-4 lg:mx-0">
      <div className="px-4 lg:px-0 flex items-center gap-2 mb-3">
        <Flame className="h-[18px] w-[18px] text-primary" />
        <h2 className="font-display text-[18px] font-extrabold">Destaques</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-none px-4 lg:px-0 pb-1 touch-pan-x snap-x snap-mandatory">
        {FEATURED_ITEMS.map(({ item, category }) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="group snap-start shrink-0 w-[164px] text-left rounded-2xl overflow-hidden bg-card border border-border/60 shadow-soft transition-transform hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="relative">
              <FoodImage
                item={item}
                category={category}
                className="h-28 w-full"
                iconClassName="h-9 w-9"
              />
              {item.badge && (
                <span className="absolute top-2 left-2 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-[13px] font-bold leading-tight truncate">
                {item.name}
              </h3>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-[14px] font-extrabold text-primary tabular-nums">
                  {formatCurrency(item.price)}
                </span>
                {item.oldPrice && (
                  <span className="text-[11px] text-muted-foreground line-through tabular-nums">
                    {formatCurrency(item.oldPrice)}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
