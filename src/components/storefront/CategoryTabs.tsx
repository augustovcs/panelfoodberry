import type { RefObject } from "react";
import type { MenuCategory } from "@/lib/menu/types";
import { iconByName } from "@/lib/menu/icons";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCat: string;
  onSelect: (id: string) => void;
  tabsRef: RefObject<HTMLDivElement>;
}

/** Abas de categoria fixas, com scroll horizontal e destaque por scroll-spy. */
export function CategoryTabs({
  categories,
  activeCat,
  onSelect,
  tabsRef,
}: CategoryTabsProps) {
  return (
    <nav className="sticky top-14 z-30 mt-6 border-b border-border/60 bg-[#faf6f0]/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px]">
        <div
          ref={tabsRef}
          role="tablist"
          className="scrollbar-none flex touch-pan-x gap-2 overflow-x-auto px-4 py-2.5 lg:px-8"
        >
          {categories.map((cat) => {
            const Icon = iconByName(cat.icon);
            const isActive = cat.id === activeCat;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                data-active={isActive}
                onClick={() => onSelect(cat.id)}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-all duration-200",
                  isActive
                    ? "shadow-cart bg-primary text-primary-foreground"
                    : "border border-border/60 bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
