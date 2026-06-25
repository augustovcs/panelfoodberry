import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Carrinho / checkout. Placeholder da Fase 3 — o fluxo completo (endereço,
 * pagamento, criação do pedido e handoff WhatsApp) é a Fase 4.
 */
export default function CarrinhoPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-3xl font-bold">Seu pedido</h1>
      <p className="max-w-md text-muted-foreground">
        O checkout (endereço, pagamento e envio para o WhatsApp) chega na Fase
        4.
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
