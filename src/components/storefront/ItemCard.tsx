import { Plus } from "lucide-react";
import { FoodImage } from "./FoodImage";
import { iconByName } from "@/lib/menu/icons";
import type { MenuItem } from "@/lib/menu/types";
import { formatCurrency, cn } from "@/lib/utils";

interface ItemCardProps {
  item: MenuItem;
  iconName: string;
  onSelect: (item: MenuItem) => void;
}

export function ItemCard({ item, iconName, onSelect }: ItemCardProps) {
  return (
    <button
      onClick={() => onSelect(item)}
      className={cn(
        "group flex w-full gap-4 rounded-3xl p-3 text-left",
        "transition-colors hover:bg-card",
      )}
    >
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] font-bold leading-snug">
            {item.name}
          </h3>
          {item.badge && (
            <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {item.badge}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-[15px] font-extrabold tabular-nums text-foreground">
            {formatCurrency(item.price)}
          </span>
          {item.oldPrice && (
            <span className="text-[12px] tabular-nums text-muted-foreground line-through">
              {formatCurrency(item.oldPrice)}
            </span>
          )}
        </div>
      </div>

      <div className="relative shrink-0">
        <FoodImage
          name={item.name}
          gradient={item.gradient}
          imageUrl={item.imageUrl}
          icon={iconByName(iconName)}
          className="shadow-soft h-[108px] w-[108px] rounded-2xl"
          iconClassName="h-8 w-8"
          sizes="108px"
        />
        <span
          className={cn(
            "absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full",
            "shadow-cart bg-primary text-primary-foreground ring-[3px] ring-[#faf6f0]",
            "transition-transform group-hover:scale-110 group-active:scale-95",
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </div>
    </button>
  );
}
