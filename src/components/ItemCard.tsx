import { Plus } from "lucide-react";
import { FoodImage } from "./FoodImage";
import { formatCurrency, cn } from "@/lib/utils";
import type { MenuItem, Category } from "@/types";

interface ItemCardProps {
  item: MenuItem;
  category: Category;
  onSelect: (item: MenuItem) => void;
}

export function ItemCard({ item, category, onSelect }: ItemCardProps) {
  return (
    <button
      onClick={() => onSelect(item)}
      className={cn(
        "group w-full text-left flex gap-3.5 rounded-2xl p-3",
        "transition-colors hover:bg-secondary/60 cursor-pointer"
      )}
    >
      {/* Text */}
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-bold leading-snug truncate">
            {item.name}
          </h3>
          {item.badge && (
            <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {item.badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground line-clamp-2">
          {item.description}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[15px] font-extrabold text-foreground tabular-nums">
            {formatCurrency(item.price)}
          </span>
          {item.oldPrice && (
            <span className="text-[12px] text-muted-foreground line-through tabular-nums">
              {formatCurrency(item.oldPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Image + add */}
      <div className="relative shrink-0">
        <FoodImage
          item={item}
          category={category}
          className="h-[104px] w-[104px] rounded-xl shadow-soft"
          iconClassName="h-8 w-8"
        />
        <span
          className={cn(
            "absolute -bottom-2 -right-2 grid place-items-center h-8 w-8 rounded-full",
            "bg-primary text-primary-foreground shadow-cart ring-2 ring-card",
            "transition-transform group-hover:scale-110 group-active:scale-95"
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </div>
    </button>
  );
}
