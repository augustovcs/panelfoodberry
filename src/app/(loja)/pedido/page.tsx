import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Acompanhamento de pedidos. Placeholder da Fase 3 — o tracking por código
 * (com polling de 10s) é implementado na Fase 4.
 */
export default function PedidoPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-3xl font-bold">Meus pedidos</h1>
      <p className="max-w-md text-muted-foreground">
        O acompanhamento de pedidos chega na Fase 4.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao cardápio
      </Link>
    </main>
  );
}
