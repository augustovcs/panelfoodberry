"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, X, Bike, Store } from "lucide-react";
import type { KitchenOrder } from "@/lib/admin/data";
import { STATUS_FLOW, type OrderStatus } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";

const COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: "queue", label: "Na fila" },
  { status: "production", label: "Em produção" },
  { status: "sent", label: "Saiu p/ entrega" },
];

function nextStatus(s: OrderStatus): OrderStatus | null {
  const i = STATUS_FLOW.indexOf(s);
  return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1]! : null;
}

export function KitchenBoard({
  initial,
  configured,
}: {
  initial: KitchenOrder[];
  configured: boolean;
}) {
  const qc = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["kitchen"],
    queryFn: async (): Promise<KitchenOrder[]> => {
      const r = await fetch("/api/admin/orders");
      if (!r.ok) throw new Error("falha");
      return (await r.json()).orders;
    },
    initialData: initial,
    refetchInterval: 10_000,
    enabled: configured,
  });

  const mutate = useMutation({
    mutationFn: async (vars: { code: string; status: OrderStatus }) => {
      await fetch(`/api/admin/orders/${vars.code}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: vars.status }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kitchen"] }),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 font-display text-2xl font-extrabold">Cozinha</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Atualiza automaticamente a cada 10s.
      </p>

      {!configured && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] text-warning-foreground">
          Conecte o Supabase para ver os pedidos em tempo real.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const list = orders.filter((o) => o.status === col.status);
          return (
            <div key={col.status} className="rounded-2xl bg-card/60 p-2">
              <div className="mb-2 flex items-center justify-between px-2 py-1">
                <h2 className="font-display text-[14px] font-extrabold">
                  {col.label}
                </h2>
                <span className="rounded-full bg-primary/10 px-2 text-[12px] font-bold tabular-nums text-primary">
                  {list.length}
                </span>
              </div>
              <div className="space-y-2">
                {list.map((o) => (
                  <Card key={o.code} order={o} onAdvance={mutate.mutate} />
                ))}
                {list.length === 0 && (
                  <p className="px-2 py-6 text-center text-[12px] text-muted-foreground">
                    Vazio
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({
  order,
  onAdvance,
}: {
  order: KitchenOrder;
  onAdvance: (v: { code: string; status: OrderStatus }) => void;
}) {
  const next = nextStatus(order.status);
  return (
    <div className="shadow-soft rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="font-display text-[13px] font-extrabold">
          #{order.code}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
            order.deliveryType === "delivery"
              ? "bg-blue-50 text-blue-700"
              : "bg-emerald-50 text-emerald-700",
          )}
        >
          {order.deliveryType === "delivery" ? (
            <Bike className="h-3 w-3" />
          ) : (
            <Store className="h-3 w-3" />
          )}
          {order.deliveryType === "delivery" ? "Entrega" : "Retirada"}
        </span>
      </div>
      <p className="mt-0.5 text-[12px] text-muted-foreground">
        {order.customerName}
      </p>
      <ul className="mt-2 space-y-0.5">
        {order.items.map((it, i) => (
          <li key={i} className="text-[12px]">
            <span className="font-semibold tabular-nums">{it.qty}×</span>{" "}
            {it.name}
          </li>
        ))}
      </ul>
      {order.notes && (
        <p className="mt-1 text-[11px] italic text-muted-foreground">
          {order.notes}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[13px] font-bold tabular-nums">
          {formatCurrency(order.total)}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => onAdvance({ code: order.code, status: "cancelled" })}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Cancelar"
          >
            <X className="h-4 w-4" />
          </button>
          {next && (
            <button
              onClick={() => onAdvance({ code: order.code, status: next })}
              className="inline-flex h-7 items-center gap-1 rounded-lg bg-primary px-2.5 text-[12px] font-bold text-primary-foreground"
            >
              Avançar
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
