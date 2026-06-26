"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  ChefHat,
  Bike,
  PartyPopper,
  XCircle,
  ArrowLeft,
  SearchX,
} from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import { STATUS_FLOW } from "@/lib/types";
import {
  getLocalOrder,
  simulatedStatus,
  type LocalOrder,
} from "@/lib/orders/local";
import { formatCurrency } from "@/lib/utils";

interface TrackData {
  code: string;
  status: OrderStatus;
  items: { name: string; qty: number; lineTotal: number }[];
  total: number;
}

const META: Record<OrderStatus, { label: string; icon: typeof Clock }> = {
  queue: { label: "Na fila", icon: Clock },
  production: { label: "Em produção", icon: ChefHat },
  sent: { label: "Saiu para entrega", icon: Bike },
  done: { label: "Finalizado", icon: PartyPopper },
  cancelled: { label: "Cancelado", icon: XCircle },
};

export function OrderTracking({ code }: { code: string }) {
  // Banco (quando configurado).
  const { data, isError } = useQuery<TrackData>({
    queryKey: ["order", code],
    queryFn: async () => {
      const r = await fetch(`/api/orders/${code}`);
      if (!r.ok) throw new Error("not found");
      return r.json();
    },
    refetchInterval: 10_000,
  });

  // Fallback local (modo mock) + tick p/ progredir o status simulado.
  const [local, setLocal] = useState<LocalOrder | null>(null);
  const [, setTick] = useState(0);
  useEffect(() => {
    setLocal(getLocalOrder(code));
    const t = setInterval(() => setTick((n) => n + 1), 10_000);
    return () => clearInterval(t);
  }, [code]);

  const view: {
    status: OrderStatus;
    items: { name: string; qty: number; lineTotal: number }[];
    total: number;
  } | null = data
    ? data
    : isError && local
      ? {
          status: simulatedStatus(local.createdAt),
          items: local.items,
          total: local.total,
        }
      : null;

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

        {!view && !isError && (
          <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
        )}

        {!view && isError && (
          <div className="mt-5 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
              <SearchX className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-semibold">Pedido não encontrado</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Ele pode já ter sido enviado ao WhatsApp do restaurante.
            </p>
          </div>
        )}

        {view &&
          (view.status === "cancelled" ? (
            <div className="mt-4 rounded-xl bg-destructive/10 p-4 text-[14px] font-semibold text-destructive">
              Pedido cancelado. Fale com o restaurante.
            </div>
          ) : (
            <>
              <ol className="mt-5 space-y-1">
                {STATUS_FLOW.map((s, i) => {
                  const reached = STATUS_FLOW.indexOf(view.status) >= i;
                  const current = view.status === s;
                  const Icon = META[s].icon;
                  return (
                    <li key={s} className="flex items-center gap-3">
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
                          reached
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span
                        className={`text-[14px] ${
                          current
                            ? "font-extrabold text-foreground"
                            : reached
                              ? "font-semibold text-foreground"
                              : "font-medium text-muted-foreground"
                        }`}
                      >
                        {META[s].label}
                      </span>
                      {current && (
                        <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-primary" />
                      )}
                    </li>
                  );
                })}
              </ol>

              <div className="mt-5 border-t border-border/60 pt-4">
                {view.items.map((it, i) => (
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
                    {formatCurrency(view.total)}
                  </span>
                </div>
              </div>
            </>
          ))}
      </div>
    </main>
  );
}
