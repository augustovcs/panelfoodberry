"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PromoBanner as Promo } from "@/lib/menu/types";
import { cn } from "@/lib/utils";

/**
 * Carrossel dos banners promocionais da loja (arte criada no Canva — já traz
 * título/subtítulo/botão). Faixa snap com setas (desktop) e dots.
 */
export function PromoBanner({ banners }: { banners: Promo[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el) return;
      const idx = (i + banners.length) % banners.length;
      el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
    },
    [banners.length],
  );

  // Auto-avança a cada 6s.
  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const next =
        (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 6000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <section className="pt-5 lg:pt-6" aria-label="Promoções da loja">
      <div className="relative mx-auto max-w-[880px]">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-3xl"
        >
          {banners.map((b, i) => (
            <div key={b.id} className="w-full shrink-0 snap-center">
              <div
                className="relative aspect-[2/1] overflow-hidden rounded-3xl"
                style={{ background: b.gradient }}
              >
                <Image
                  src={b.imageUrl!}
                  alt={b.title}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 880px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={() => goTo(active - 1)}
              aria-label="Banner anterior"
              className="shadow-cart absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-foreground transition-transform hover:scale-105 lg:grid"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => goTo(active + 1)}
              aria-label="Próximo banner"
              className="shadow-cart absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-foreground transition-transform hover:scale-105 lg:grid"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {banners.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => goTo(i)}
              aria-label={`Ir para o banner ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-6 bg-primary" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
