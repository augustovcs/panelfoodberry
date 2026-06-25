import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { LayoutGrid, ClipboardList, Store, SearchX } from "lucide-react";
import { useStore } from "@/store";
import { CATEGORIES, RESTAURANT } from "@/data";
import { cn } from "@/lib/utils";
import { StorefrontHeader } from "./StorefrontHeader";
import { Destaques } from "./Destaques";
import { ItemCard } from "./ItemCard";
import { CartSidebar } from "./CartSidebar";
import { ItemDetail } from "./ItemDetail";
import type { MenuItem, Category } from "@/types";

export function MenuView() {
  const setView = useStore((s) => s.setView);
  const setMode = useStore((s) => s.setMode);

  const [selected, setSelected] = useState<{
    item: MenuItem;
    category: Category;
  } | null>(null);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabsRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const out: { item: MenuItem; category: Category }[] = [];
    for (const cat of CATEGORIES) {
      for (const item of cat.items) {
        if (
          item.name.toLowerCase().includes(trimmedQuery) ||
          item.description.toLowerCase().includes(trimmedQuery)
        ) {
          out.push({ item, category: cat });
        }
      }
    }
    return out;
  }, [trimmedQuery, isSearching]);

  const openItem = useCallback((item: MenuItem, category: Category) => {
    setSelected({ item, category });
  }, []);

  // Scroll-spy: highlight the category section nearest the top
  useEffect(() => {
    if (isSearching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveCat(topmost.target.id);
      },
      { rootMargin: "-128px 0px -62% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(
      (el) => el && observer.observe(el)
    );
    return () => observer.disconnect();
  }, [isSearching]);

  // Keep the active tab scrolled into view horizontally
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
      {/* Slim sticky top bar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/70">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-[15px] w-[15px]" />
            </div>
            <span className="font-display text-[15px] font-extrabold truncate">
              {RESTAURANT.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setView("tracking")}
              className="flex items-center gap-1.5 rounded-lg px-3 h-9 text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="hidden min-[380px]:inline">Meus pedidos</span>
            </button>
            <button
              onClick={() => setMode("admin")}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              aria-label="Painel administrativo"
            >
              <LayoutGrid className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <StorefrontHeader query={query} onQuery={setQuery} />

      {/* Sticky category tabs (hidden while searching) */}
      {!isSearching && (
        <nav className="sticky top-14 z-30 bg-background/90 backdrop-blur-md border-b border-border/60 mt-5">
          <div className="max-w-5xl mx-auto">
            <div
              ref={tabsRef}
              className="flex gap-2 overflow-x-auto scrollbar-none px-4 lg:px-6 py-2.5 touch-pan-x"
              role="tablist"
            >
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = cat.id === activeCat;
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={isActive}
                    data-active={isActive}
                    onClick={() => scrollToCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 h-9 rounded-full text-[13px] font-bold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
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
      )}

      {/* Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 lg:px-6 pb-28 lg:pb-12">
        <div className="lg:flex lg:gap-8 lg:pt-6">
          <div className="min-w-0 flex-1">
            {isSearching ? (
              <SearchResults
                results={searchResults}
                query={query}
                onSelect={openItem}
              />
            ) : (
              <>
                <Destaques onSelect={(item) => {
                  const cat = CATEGORIES.find((c) => c.items.includes(item))!;
                  openItem(item, cat);
                }} />

                {CATEGORIES.map((cat) => (
                  <section
                    key={cat.id}
                    id={cat.id}
                    ref={(el) => (sectionRefs.current[cat.id] = el)}
                    className="scroll-mt-28 pt-7"
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <cat.icon className="h-[18px] w-[18px] text-primary" />
                      <h2 className="font-display text-[19px] font-extrabold">
                        {cat.name}
                      </h2>
                      <span className="text-[12px] font-semibold text-muted-foreground tabular-nums">
                        {cat.items.length}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-x-6 mt-1">
                      {cat.items.map((item) => (
                        <div
                          key={item.id}
                          className="border-b border-border/50 last:border-b-0"
                        >
                          <ItemCard
                            item={item}
                            category={cat}
                            onSelect={(it) => openItem(it, cat)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </>
            )}
          </div>

          <CartSidebar />
        </div>
      </main>

      <ItemDetail
        item={selected?.item ?? null}
        category={selected?.category ?? null}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function SearchResults({
  results,
  query,
  onSelect,
}: {
  results: { item: MenuItem; category: Category }[];
  query: string;
  onSelect: (item: MenuItem, category: Category) => void;
}) {
  return (
    <div className="pt-6">
      <h2 className="font-display text-[17px] font-extrabold mb-1">
        {results.length > 0
          ? `${results.length} ${results.length === 1 ? "resultado" : "resultados"} para “${query.trim()}”`
          : "Nada encontrado"}
      </h2>

      {results.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-x-6 mt-2">
          {results.map(({ item, category }) => (
            <div
              key={item.id}
              className="border-b border-border/50 last:border-b-0"
            >
              <ItemCard
                item={item}
                category={category}
                onSelect={(it) => onSelect(it, category)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
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
