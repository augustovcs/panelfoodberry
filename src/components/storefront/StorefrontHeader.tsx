import Image from "next/image";
import {
  Star,
  Clock,
  Bike,
  MapPin,
  Search,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import type { RestaurantInfo } from "@/lib/menu/types";
import { formatCurrency, cn } from "@/lib/utils";

interface StorefrontHeaderProps {
  restaurant: RestaurantInfo;
  query: string;
  onQuery: (v: string) => void;
}

/** Capa + cartão de informações do restaurante sobreposto + busca. */
export function StorefrontHeader({
  restaurant: r,
  query,
  onQuery,
}: StorefrontHeaderProps) {
  return (
    <section className="relative">
      <div className="relative h-40 w-full overflow-hidden sm:h-52 lg:h-64">
        {r.coverUrl && (
          <Image
            src={r.coverUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />
      </div>

      <div className="mx-auto max-w-5xl px-4 lg:px-6">
        <div className="shadow-soft relative -mt-12 rounded-2xl border border-border/60 bg-card p-4 lg:-mt-16 lg:p-6">
          <div className="flex gap-4">
            <div className="-mt-10 shrink-0 lg:-mt-14">
              <div className="shadow-cart grid h-[68px] w-[68px] place-items-center rounded-2xl bg-primary text-primary-foreground ring-4 ring-card lg:h-20 lg:w-20">
                <span className="font-display text-2xl font-extrabold lg:text-3xl">
                  {r.logoText}
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-3">
                <h1 className="truncate font-display text-xl font-extrabold leading-tight lg:text-2xl">
                  {r.name}
                </h1>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
                    r.isOpen
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      r.isOpen ? "bg-emerald-500" : "bg-red-500",
                    )}
                  />
                  {r.isOpen ? "Aberto agora" : "Fechado"}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                {r.categoriesLabel}
              </p>
            </div>
          </div>

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
              {formatCurrency(r.deliveryFee)}
            </span>
            <span className="hidden h-3 w-px bg-border sm:inline-block" />
            <span className="hidden items-center gap-1.5 text-muted-foreground sm:inline-flex">
              <ShoppingBag className="h-4 w-4" />
              Mín. {formatCurrency(r.minOrder)}
            </span>
          </div>

          <button className="mt-3 flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{r.address}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          </button>

          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar no cardápio…"
              aria-label="Buscar item no cardápio"
              className="h-11 w-full rounded-xl border border-transparent bg-secondary/70 pl-11 pr-4 text-[14px] outline-none transition-colors focus:border-primary focus:bg-background"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
