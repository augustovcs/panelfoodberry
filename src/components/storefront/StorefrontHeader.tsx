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
      <div className="relative h-44 w-full overflow-hidden sm:h-56 lg:h-72">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf6f0] via-black/15 to-black/30" />
      </div>

      <div className="mx-auto max-w-5xl px-4 lg:px-6">
        <div className="shadow-soft relative -mt-16 rounded-[28px] border border-border/60 bg-card p-5 lg:-mt-20 lg:p-7">
          <div className="flex gap-4">
            <div className="-mt-12 shrink-0 lg:-mt-16">
              <div className="shadow-cart grid h-[76px] w-[76px] place-items-center rounded-[22px] bg-primary text-primary-foreground ring-4 ring-card lg:h-24 lg:w-24">
                <span className="font-display text-[28px] font-extrabold lg:text-4xl">
                  {r.logoText}
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    Cardápio digital
                  </p>
                  <h1 className="mt-0.5 font-display text-[26px] font-extrabold leading-[1.05] lg:text-4xl">
                    {r.name}
                  </h1>
                </div>
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
              <p className="mt-1 truncate text-[13px] text-muted-foreground">
                {r.categoriesLabel}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Pill
              icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            >
              <span className="font-bold">
                {r.rating.toLocaleString("pt-BR")}
              </span>
              <span className="text-muted-foreground">
                ({r.reviews.toLocaleString("pt-BR")})
              </span>
            </Pill>
            <Pill icon={<Clock className="h-4 w-4 text-primary" />}>
              {r.deliveryTime}
            </Pill>
            <Pill icon={<Bike className="h-4 w-4 text-primary" />}>
              {formatCurrency(r.deliveryFee)}
            </Pill>
            <Pill
              icon={<ShoppingBag className="h-4 w-4 text-primary" />}
              className="hidden sm:inline-flex"
            >
              Mín. {formatCurrency(r.minOrder)}
            </Pill>
          </div>

          <button className="mt-3 flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{r.address}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          </button>

          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar no cardápio…"
              aria-label="Buscar item no cardápio"
              className="h-12 w-full rounded-2xl border border-transparent bg-secondary/70 pl-11 pr-4 text-[14px] outline-none transition-colors focus:border-primary focus:bg-background"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Pill({
  icon,
  children,
  className,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-[12.5px]",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
