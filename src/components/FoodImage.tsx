import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MenuItem, Category } from "@/types";

interface FoodImageProps {
  item: MenuItem;
  category?: Category | null;
  className?: string;
  iconClassName?: string;
  sizes?: string;
}

/**
 * Renders the real food photo over a food-toned gradient.
 * If the photo fails to load, the gradient + category glyph remain,
 * so the UI never shows a broken image.
 */
export function FoodImage({
  item,
  category,
  className,
  iconClassName,
  sizes,
}: FoodImageProps) {
  const [failed, setFailed] = useState(false);
  const Icon = category?.icon;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: item.image }}
    >
      {item.img && !failed && (
        <img
          src={item.img}
          alt={item.name}
          loading="lazy"
          decoding="async"
          sizes={sizes}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {(failed || !item.img) && Icon && (
        <div className="absolute inset-0 grid place-items-center">
          <Icon
            className={cn("text-white/70", iconClassName)}
            strokeWidth={1.2}
          />
        </div>
      )}
    </div>
  );
}
