import {
  Star,
  Clock,
  Bike,
  MapPin,
  Search,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { RESTAURANT, DELIVERY_FEE } from "@/data";
import { formatCurrency, cn } from "@/lib/utils";

interface StorefrontHeaderProps {
  query: string;
  onQuery: (v: string) => void;
}

export function StorefrontHeader({ query, onQuery }: StorefrontHeaderProps) {
  const r = RESTAURANT;

  return (
    <section className="relative">
      {/* Cover */}
      <div className="relative h-40 sm:h-52 lg:h-64 w-full overflow-hidden">
        <img
          src={r.cover}
          alt=""
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />
      </div>

      {/* Info card overlapping the cover */}
      <div className="max-w-5xl mx-auto px-4 lg:px-6">
        <div className="relative -mt-12 lg:-mt-16 rounded-2xl bg-card shadow-soft border border-border/60 p-4 lg:p-6">
          <div className="flex gap-4">
            {/* Logo */}
            <div className="shrink-0 -mt-10 lg:-mt-14">
              <div className="grid place-items-center h-[68px] w-[68px] lg:h-20 lg:w-20 rounded-2xl bg-primary text-primary-foreground shadow-cart ring-4 ring-card">
                <span className="font-display text-2xl lg:text-3xl font-extrabold">
                  S
                </span>
              </div>
            </div>

            {/* Title + status */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-display text-xl lg:text-2xl font-extrabold leading-tight truncate">
                  {r.name}
                </h1>
                <span
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
                    r.isOpen
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      r.isOpen ? "bg-emerald-500" : "bg-red-500"
                    )}
                  />
                  {r.isOpen ? "Aberto agora" : "Fechado"}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-0.5 truncate">
                {r.categories}
              </p>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px]">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {r.rating.toLocaleString("pt-BR")}
              <span className="font-normal text-muted-foreground">
                ({r.reviews.toLocaleString("pt-BR")})
              </span>
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {r.deliveryTime}
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Bike className="h-4 w-4" />
              {formatCurrency(DELIVERY_FEE)}
            </span>
            <span className="h-3 w-px bg-border hidden sm:inline-block" />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              Mín. {formatCurrency(r.minOrder)}
            </span>
          </div>

          {/* Address */}
          <button className="mt-3 flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{r.address}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          </button>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar no cardápio…"
              className="w-full h-11 rounded-xl bg-secondary/70 border border-transparent focus:border-primary focus:bg-background pl-11 pr-4 text-[14px] outline-none transition-colors"
              aria-label="Buscar item no cardápio"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
