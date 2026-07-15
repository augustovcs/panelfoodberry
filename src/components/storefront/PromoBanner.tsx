"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { PromoBanner as Promo } from "@/lib/menu/types";
import { cn } from "@/lib/utils";

/**
 * Carrossel de banners promocionais da própria loja (full-branded).
 * Snap horizontal no mobile, mesma faixa em telas grandes; dots de navegação.
 */
export function PromoBanner({ banners }: { banners: Promo[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setActive(i);
  }, []);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }, []);

  // Auto-avança a cada 5s (respeita reduced-motion via CSS de scroll suave).
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
    <section className="pt-5" aria-label="Promoções da loja">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {banners.map((b) => (
          <div
            key={b.id}
            className="w-full shrink-0 snap-center px-0.5 first:pl-0 last:pr-0"
          >
            <article
              className="relative flex h-40 items-end overflow-hidden rounded-3xl sm:h-48 lg:h-52"
              style={{ background: b.gradient }}
            >
              {b.imageUrl && (
                <Image
                  src={b.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="object-cover opacity-45 mix-blend-overlay"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

              {b.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[12px] font-extrabold tabular-nums text-primary shadow-sm">
                  {b.badge}
                </span>
              )}

              <div className="relative z-10 max-w-[78%] p-5 sm:p-6 lg:max-w-[60%]">
                <h3 className="font-display text-[22px] font-extrabold leading-tight text-white sm:text-2xl lg:text-[28px]">
                  {b.title}
                </h3>
                {b.subtitle && (
                  <p className="mt-1 text-[13px] font-medium leading-snug text-white/85 sm:text-sm">
                    {b.subtitle}
                  </p>
                )}
                {b.cta && (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-foreground shadow-sm">
                    {b.cta}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                )}
              </div>
            </article>
          </div>
        ))}
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
                i === active ? "w-5 bg-primary" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
