/**
 * Cardápio público (domínio principal). Placeholder da Fase 0 — a UI real
 * (storefront SSR lendo do Supabase) é implementada na Fase 3.
 */
export default function LojaHome() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
        Cardápio
      </span>
      <h1 className="text-balance font-display text-4xl font-bold sm:text-5xl">
        Sabor &amp; Arte
      </h1>
      <p className="max-w-md text-muted-foreground">
        Base Next.js pronta (Fase 0). O cardápio digital chega na Fase 3.
      </p>
    </main>
  );
}
