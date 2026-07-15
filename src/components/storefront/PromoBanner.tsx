"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { PromoBanner as Promo } from "@/lib/menu/types";
import { cn } from "@/lib/utils";

/**
 * Carrossel de banners promocionais da própria loja (full-branded).
 * Hero grande no desktop (com setas), faixa snap no mobile; dots de navegação.
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

  // Auto-avança a cada 5s.
  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const next =
        (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <section className="pt-5 lg:pt-6" aria-label="Promoções da loja">
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
        >
          {banners.map((b) => (
            <div key={b.id} className="w-full shrink-0 snap-center">
              <article
                className="relative flex h-44 items-end overflow-hidden rounded-3xl sm:h-56 lg:h-[340px]"
                style={{ background: b.gradient }}
              >
                {b.imageUrl && (
                  <Image
                    src={b.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 1400px, 100vw"
                    className="object-cover opacity-50 mix-blend-overlay"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />

                {b.badge && (
                  <span className="absolute right-5 top-5 rounded-full bg-white/95 px-3 py-1 text-[12px] font-extrabold tabular-nums text-primary shadow-sm lg:px-4 lg:py-1.5 lg:text-sm">
                    {b.badge}
                  </span>
                )}

                <div className="relative z-10 max-w-[80%] p-5 sm:p-7 lg:max-w-[56%] lg:py-12 lg:pl-24 lg:pr-12">
                  <h3 className="font-display text-[22px] font-extrabold leading-[1.05] text-white sm:text-3xl lg:text-5xl">
                    {b.title}
                  </h3>
                  {b.subtitle && (
                    <p className="mt-1.5 text-[13px] font-medium leading-snug text-white/85 sm:text-base lg:mt-3 lg:text-lg">
                      {b.subtitle}
                    </p>
                  )}
                  {b.cta && (
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-foreground shadow-sm lg:mt-5 lg:px-6 lg:py-3 lg:text-[15px]">
                      {b.cta}
                      <ArrowRight
                        className="h-3.5 w-3.5 lg:h-4 lg:w-4"
                        strokeWidth={2.5}
                      />
                    </span>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <>
            {/* Setas — só desktop, onde o banner é grande. */}
            <button
              onClick={() => goTo(active - 1)}
              aria-label="Banner anterior"
              className="shadow-cart absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-foreground transition-transform hover:scale-105 lg:grid"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => goTo(active + 1)}
              aria-label="Próximo banner"
              className="shadow-cart absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-foreground transition-transform hover:scale-105 lg:grid"
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
