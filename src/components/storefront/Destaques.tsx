import { Flame } from "lucide-react";
import { FoodImage } from "./FoodImage";
import { iconByName } from "@/lib/menu/icons";
import type { FeaturedItem, MenuItem, MenuCategory } from "@/lib/menu/types";
import { formatCurrency } from "@/lib/utils";

interface DestaquesProps {
  items: FeaturedItem[];
  onSelect: (item: MenuItem, category: MenuCategory) => void;
}

export function Destaques({ items, onSelect }: DestaquesProps) {
  if (items.length === 0) return null;

  return (
    <section className="-mx-4 pt-6 lg:mx-0">
      <div className="mb-3 flex items-center gap-2 px-4 lg:px-0">
        <Flame className="h-[18px] w-[18px] text-primary" />
        <h2 className="font-display text-[18px] font-extrabold">Destaques</h2>
      </div>

      <div className="scrollbar-none flex touch-pan-x snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 lg:px-0">
        {items.map(({ item, category }) => (
          <button
            key={item.id}
            onClick={() => onSelect(item, category)}
            className="shadow-soft group w-[164px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 bg-card text-left transition-transform hover:-translate-y-0.5"
          >
            <div className="relative">
              <FoodImage
                name={item.name}
                gradient={item.gradient}
                imageUrl={item.imageUrl}
                icon={iconByName(category.icon)}
                className="h-28 w-full"
                iconClassName="h-9 w-9"
                sizes="164px"
              />
              {item.badge && (
                <span className="absolute left-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="truncate text-[13px] font-bold leading-tight">
                {item.name}
              </h3>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-[14px] font-extrabold tabular-nums text-primary">
                  {formatCurrency(item.price)}
                </span>
                {item.oldPrice && (
                  <span className="text-[11px] tabular-nums text-muted-foreground line-through">
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
