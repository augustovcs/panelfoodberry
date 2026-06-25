import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store";

export function OrderSuccess() {
  const orders = useStore((s) => s.orders);
  const setView = useStore((s) => s.setView);

  const lastOrder = orders[orders.length - 1];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center animate-scale-in">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
      </div>

      <h1 className="font-display text-[26px] font-extrabold mb-2">
        Pedido confirmado
      </h1>

      {lastOrder && (
        <span className="inline-block bg-primary/10 text-primary text-base font-bold px-5 py-2 rounded-full mb-3 tabular-nums">
          {lastOrder.id}
        </span>
      )}

      <p className="text-sm text-muted-foreground max-w-[280px] mb-8 leading-relaxed">
        Seu pedido foi recebido e logo estará em produção. Acompanhe pelo seu
        telefone.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <Button
          onClick={() => setView("menu")}
          size="lg"
          className="w-full h-12 rounded-xl text-[15px] font-bold cursor-pointer"
        >
          Voltar ao cardápio
        </Button>
        <Button
          onClick={() => setView("tracking")}
          variant="outline"
          className="w-full rounded-xl cursor-pointer"
        >
          Acompanhar pedido
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
