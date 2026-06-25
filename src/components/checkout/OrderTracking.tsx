"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  PartyPopper,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import { STATUS_FLOW } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface TrackData {
  code: string;
  status: OrderStatus;
  items: { name: string; qty: number; lineTotal: number }[];
  total: number;
  customerName: string;
}

const META: Record<OrderStatus, { label: string; icon: typeof Clock }> = {
  queue: { label: "Na fila", icon: Clock },
  production: { label: "Em produção", icon: ChefHat },
  sent: { label: "Saiu para entrega", icon: Bike },
  done: { label: "Finalizado", icon: PartyPopper },
  cancelled: { label: "Cancelado", icon: XCircle },
};

export function OrderTracking({ code }: { code: string }) {
  const { data, isLoading, isError } = useQuery<TrackData>({
    queryKey: ["order", code],
    queryFn: async () => {
      const r = await fetch(`/api/orders/${code}`);
      if (!r.ok) throw new Error("not found");
      return r.json();
    },
    refetchInterval: 10_000,
  });

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 lg:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Cardápio
      </Link>

      <div className="shadow-soft rounded-2xl border border-border/60 bg-card p-5">
        <p className="text-[13px] text-muted-foreground">Pedido</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          #{code}
        </h1>

        {isLoading && (
          <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
        )}

        {/* Sem banco: o pedido já foi para o WhatsApp do restaurante. */}
        {isError && (
          <div className="mt-4 rounded-xl bg-primary/5 p-4 text-[14px]">
            <CheckCircle2 className="mb-2 h-6 w-6 text-primary" />
            <p className="font-semibold">Pedido enviado!</p>
            <p className="mt-1 text-muted-foreground">
              Seu pedido foi encaminhado ao WhatsApp do restaurante. O
              acompanhamento ao vivo aparece aqui quando o painel confirmar.
            </p>
          </div>
        )}

        {data && (
          <>
            {data.status === "cancelled" ? (
              <div className="mt-4 rounded-xl bg-destructive/10 p-4 text-[14px] font-semibold text-destructive">
                Pedido cancelado. Fale com o restaurante.
              </div>
            ) : (
              <ol className="mt-5 space-y-1">
                {STATUS_FLOW.map((s, i) => {
                  const reached = STATUS_FLOW.indexOf(data.status) >= i;
                  const Icon = META[s].icon;
                  return (
                    <li key={s} className="flex items-center gap-3">
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-full ${
                          reached
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span
                        className={`text-[14px] font-semibold ${
                          reached ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {META[s].label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-5 border-t border-border/60 pt-4">
              {data.items.map((it, i) => (
                <div
                  key={i}
                  className="flex justify-between text-[13px] text-muted-foreground"
                >
                  <span>
                    {it.qty}× {it.name}
                  </span>
                  <span className="tabular-nums">
                    {formatCurrency(it.lineTotal)}
                  </span>
                </div>
              ))}
              <div className="mt-2 flex justify-between text-[15px] font-extrabold">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(data.total)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
