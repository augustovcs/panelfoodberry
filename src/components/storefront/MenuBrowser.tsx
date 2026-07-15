"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchX } from "lucide-react";
import type { Menu, MenuItem, MenuCategory } from "@/lib/menu/types";
import { featuredItems } from "@/lib/menu/types";
import { iconByName } from "@/lib/menu/icons";
import { clientEnv } from "@/lib/env";
import { useCartHydrated } from "@/store/cart";
import { TopBar } from "./TopBar";
import { StorefrontHeader } from "./StorefrontHeader";
import { CategoryTabs } from "./CategoryTabs";
import { PromoBanner } from "./PromoBanner";
import { Destaques } from "./Destaques";
import { ItemCard } from "./ItemCard";
import { CartSidebar } from "./CartSidebar";
import { FloatingCart } from "./FloatingCart";
import { ItemDetail } from "./ItemDetail";

interface Selection {
  item: MenuItem;
  category: MenuCategory;
}

export function MenuBrowser({ menu }: { menu: Menu }) {
  const { restaurant, categories, banners } = menu;
  const cartReady = useCartHydrated();
  const featured = useMemo(() => featuredItems(menu), [menu]);

  const [selected, setSelected] = useState<Selection | null>(null);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(categories[0]?.id ?? "");

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabsRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  const results = useMemo(() => {
    if (!isSearching) return [] as Selection[];
    const out: Selection[] = [];
    for (const category of categories) {
      for (const item of category.items) {
        if (
          item.name.toLowerCase().includes(trimmed) ||
          item.description.toLowerCase().includes(trimmed)
        ) {
          out.push({ item, category });
        }
      }
    }
    return out;
  }, [categories, trimmed, isSearching]);

  const openItem = useCallback((item: MenuItem, category: MenuCategory) => {
    setSelected({ item, category });
  }, []);

  // Scroll-spy: destaca a seção mais próxima do topo.
  useEffect(() => {
    if (isSearching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveCat(topmost.target.id);
      },
      { rootMargin: "-128px 0px -62% 0px", threshold: 0 },
    );
    Object.values(sectionRefs.current).forEach(
      (el) => el && observer.observe(el),
    );
    return () => observer.disconnect();
  }, [isSearching]);

  // Mantém a aba ativa visível horizontalmente.
  useEffect(() => {
    const active = tabsRef.current?.querySelector("[data-active=true]");
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeCat]);

  const scrollToCategory = useCallback((id: string) => {
    setActiveCat(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <TopBar
        name={restaurant.name}
        adminUrl={clientEnv.NEXT_PUBLIC_ADMIN_URL ?? "/login"}
      />

      <StorefrontHeader
        restaurant={restaurant}
        query={query}
        onQuery={setQuery}
      />

      {!isSearching && (
        <CategoryTabs
          categories={categories}
          activeCat={activeCat}
          onSelect={scrollToCategory}
          tabsRef={tabsRef}
        />
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 lg:px-6 lg:pb-12">
        <div className="lg:flex lg:gap-8 lg:pt-6">
          <div className="min-w-0 flex-1">
            {isSearching ? (
              <SearchResults
                results={results}
                query={query}
                onSelect={openItem}
              />
            ) : (
              <>
                <PromoBanner banners={banners} />

                <Destaques items={featured} onSelect={openItem} />

                {categories.map((cat) => {
                  const Icon = iconByName(cat.icon);
                  return (
                    <section
                      key={cat.id}
                      id={cat.id}
                      ref={(el) => {
                        sectionRefs.current[cat.id] = el;
                      }}
                      className="scroll-mt-28 pt-7"
                    >
                      <div className="mb-1 flex items-center gap-2.5">
                        <Icon className="h-[18px] w-[18px] text-primary" />
                        <h2 className="font-display text-[19px] font-extrabold">
                          {cat.name}
                        </h2>
                        <span className="text-[12px] font-semibold tabular-nums text-muted-foreground">
                          {cat.items.length}
                        </span>
                      </div>

                      <div className="mt-1 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        {cat.items.map((item) => (
                          <div
                            key={item.id}
                            className="border-b border-border/50 last:border-b-0"
                          >
                            <ItemCard
                              item={item}
                              iconName={cat.icon}
                              onSelect={(it) => openItem(it, cat)}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </>
            )}
          </div>

          <CartSidebar ready={cartReady} />
        </div>
      </main>

      <ItemDetail
        item={selected?.item ?? null}
        category={selected?.category ?? null}
        onClose={() => setSelected(null)}
      />

      <FloatingCart ready={cartReady} />
    </>
  );
}

function SearchResults({
  results,
  query,
  onSelect,
}: {
  results: Selection[];
  query: string;
  onSelect: (item: MenuItem, category: MenuCategory) => void;
}) {
  return (
    <div className="pt-6">
      <h2 className="mb-1 font-display text-[17px] font-extrabold">
        {results.length > 0
          ? `${results.length} ${results.length === 1 ? "resultado" : "resultados"} para “${query.trim()}”`
          : "Nada encontrado"}
      </h2>

      {results.length > 0 ? (
        <div className="mt-2 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {results.map(({ item, category }) => (
            <div
              key={item.id}
              className="border-b border-border/50 last:border-b-0"
            >
              <ItemCard
                item={item}
                iconName={category.icon}
                onSelect={(it) => onSelect(it, category)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
            <SearchX className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <p className="text-sm text-muted-foreground">
            Tente buscar por outro item do cardápio.
          </p>
        </div>
      )}
    </div>
  );
}
