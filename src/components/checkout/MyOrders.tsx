"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardList, ChevronRight } from "lucide-react";
import {
  getLocalOrders,
  simulatedStatus,
  type LocalOrder,
} from "@/lib/orders/local";
import { STATUS_CONFIG } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function MyOrders() {
  const [orders, setOrders] = useState<LocalOrder[] | null>(null);

  useEffect(() => {
    setOrders(getLocalOrders());
  }, []);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 lg:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Cardápio
      </Link>

      <h1 className="mb-4 font-display text-2xl font-extrabold">
        Meus pedidos
      </h1>

      {orders === null ? null : orders.length === 0 ? (
        <div className="shadow-soft rounded-2xl border border-border/60 bg-card p-8 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold">Nenhum pedido ainda</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Seus pedidos aparecem aqui depois do checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const cfg = STATUS_CONFIG[simulatedStatus(o.createdAt)];
            return (
              <Link
                key={o.code}
                href={`/pedido/${o.code}`}
                className="shadow-soft flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-secondary/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[15px] font-extrabold">
                      #{o.code}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                    {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                  </p>
                </div>
                <span className="text-[14px] font-bold tabular-nums">
                  {formatCurrency(o.total)}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
