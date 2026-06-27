"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowLeft,
  Bike,
  Store,
  Phone,
  MapPin,
  CreditCard,
  StickyNote,
  Tag,
  AlertTriangle,
  Ban,
} from "lucide-react";
import type { KitchenOrder } from "@/lib/admin/data";
import {
  STATUS_FLOW,
  STATUS_CONFIG,
  PAYMENT_LABELS,
  type OrderStatus,
} from "@/lib/types";
import { formatCurrency, cn, maskPhone, timeAgo } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: "queue", label: "Na fila" },
  { status: "production", label: "Em produção" },
  { status: "sent", label: "Saiu p/ entrega" },
];

function nextStatus(s: OrderStatus): OrderStatus | null {
  const i = STATUS_FLOW.indexOf(s);
  return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1]! : null;
}
function prevStatus(s: OrderStatus): OrderStatus | null {
  const i = STATUS_FLOW.indexOf(s);
  return i > 0 ? STATUS_FLOW[i - 1]! : null;
}

export function KitchenBoard({
  initial,
  configured,
  demo = false,
}: {
  initial: KitchenOrder[];
  configured: boolean;
  demo?: boolean;
}) {
  const qc = useQueryClient();
  const [localOrders, setLocalOrders] = useState<KitchenOrder[]>(initial);
  const [openCode, setOpenCode] = useState<string | null>(null);

  const { data: queryOrders = [] } = useQuery({
    queryKey: ["kitchen"],
    queryFn: async (): Promise<KitchenOrder[]> => {
      const r = await fetch("/api/admin/orders");
      if (!r.ok) throw new Error("falha");
      return (await r.json()).orders;
    },
    initialData: initial,
    refetchInterval: 10_000,
    enabled: !demo && configured,
  });

  const serverMutate = useMutation({
    mutationFn: async (vars: { code: string; status: OrderStatus }) => {
      await fetch(`/api/admin/orders/${vars.code}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: vars.status }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kitchen"] }),
  });

  const orders = demo ? localOrders : queryOrders;
  const active = orders.find((o) => o.code === openCode) ?? null;

  function setStatus(vars: { code: string; status: OrderStatus }) {
    const leaves = vars.status === "done" || vars.status === "cancelled";
    if (leaves) setOpenCode(null);
    if (demo) {
      // ⚠️ DEMO — sem banco: move/remove apenas em memória.
      setLocalOrders((prev) =>
        prev.flatMap((o) => {
          if (o.code !== vars.code) return [o];
          if (leaves) return [];
          return [{ ...o, status: vars.status }];
        }),
      );
      return;
    }
    serverMutate.mutate(vars);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 font-display text-2xl font-extrabold">Cozinha</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Toque num pedido para ver os detalhes. Atualiza a cada 10s.
      </p>

      {!configured && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
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
                  <Card
                    key={o.code}
                    order={o}
                    onOpen={() => setOpenCode(o.code)}
                  />
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

      <OrderDialog
        order={active}
        onClose={() => setOpenCode(null)}
        onSetStatus={setStatus}
      />
    </div>
  );
}

function Card({ order, onOpen }: { order: KitchenOrder; onOpen: () => void }) {
  const itemCount = order.items.reduce((n, it) => n + it.qty, 0);
  return (
    <button
      onClick={onOpen}
      className="shadow-soft block w-full rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-[13px] font-extrabold">
          #{order.code}
        </span>
        <DeliveryChip type={order.deliveryType} />
      </div>
      <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
        {order.customerName}
      </p>
      <ul className="mt-2 space-y-0.5">
        {order.items.slice(0, 3).map((it, i) => (
          <li key={i} className="truncate text-[12px]">
            <span className="font-semibold tabular-nums">{it.qty}×</span>{" "}
            {it.name}
          </li>
        ))}
        {order.items.length > 3 && (
          <li className="text-[11px] text-muted-foreground">
            +{order.items.length - 3} item(ns)
          </li>
        )}
      </ul>
      <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
        <span className="text-[11px] text-muted-foreground">
          {itemCount} item(ns) · {timeAgo(new Date(order.createdAt).getTime())}
        </span>
        <span className="text-[13px] font-bold tabular-nums">
          {formatCurrency(order.total)}
        </span>
      </div>
    </button>
  );
}

function DeliveryChip({ type }: { type: KitchenOrder["deliveryType"] }) {
  const delivery = type === "delivery";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
        delivery
          ? "bg-blue-50 text-blue-700"
          : "bg-emerald-50 text-emerald-700",
      )}
    >
      {delivery ? <Bike className="h-3 w-3" /> : <Store className="h-3 w-3" />}
      {delivery ? "Entrega" : "Retirada"}
    </span>
  );
}

/* ─────────────────────────── Modal do pedido ─────────────────────────── */

type Pending = "advance" | "retreat" | "cancel" | null;

function OrderDialog({
  order,
  onClose,
  onSetStatus,
}: {
  order: KitchenOrder | null;
  onClose: () => void;
  onSetStatus: (v: { code: string; status: OrderStatus }) => void;
}) {
  const [pending, setPending] = useState<Pending>(null);
  const open = order !== null;

  function handleClose(o: boolean) {
    if (!o) {
      setPending(null);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {order && (
        <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto p-0">
          <Body
            order={order}
            pending={pending}
            setPending={setPending}
            onSetStatus={(status) => {
              setPending(null);
              onSetStatus({ code: order.code, status });
            }}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}

function Body({
  order,
  pending,
  setPending,
  onSetStatus,
}: {
  order: KitchenOrder;
  pending: Pending;
  setPending: (p: Pending) => void;
  onSetStatus: (status: OrderStatus) => void;
}) {
  const cfg = STATUS_CONFIG[order.status];
  const next = nextStatus(order.status);
  const prev = prevStatus(order.status);

  return (
    <>
      {/* Cabeçalho */}
      <div className="sticky top-0 z-10 border-b border-border/60 bg-card px-5 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <DialogTitle className="font-display text-xl font-extrabold">
            #{order.code}
          </DialogTitle>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold",
              cfg.bg,
              cfg.color,
            )}
          >
            {cfg.label}
          </span>
          <DeliveryChip type={order.deliveryType} />
        </div>
        <DialogDescription className="mt-1 text-[12px]">
          Recebido {timeAgo(new Date(order.createdAt).getTime())} atrás
        </DialogDescription>
      </div>

      <div className="space-y-4 px-5 py-4">
        {/* Comprador */}
        <Section title="Cliente">
          <Row icon={Phone} label="Nome">
            <span className="font-semibold">{order.customerName}</span>
          </Row>
          {order.customerPhone && (
            <Row icon={Phone} label="WhatsApp">
              <a
                href={`https://wa.me/${order.customerPhone}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                {maskPhone(order.customerPhone)}
              </a>
            </Row>
          )}
          <Row icon={MapPin} label="Endereço">
            {order.deliveryType === "delivery" ? (
              <span>{order.addressLine ?? "—"}</span>
            ) : (
              <span className="text-muted-foreground">Retirada no balcão</span>
            )}
          </Row>
          <Row icon={CreditCard} label="Pagamento">
            <span>
              {order.paymentMethod ? PAYMENT_LABELS[order.paymentMethod] : "—"}
              {order.changeFor != null && (
                <span className="text-muted-foreground">
                  {" "}
                  · troco p/ {formatCurrency(order.changeFor)}
                </span>
              )}
            </span>
          </Row>
        </Section>

        {/* Itens */}
        <Section title={`Itens (${order.items.length})`}>
          <ul className="space-y-2">
            {order.items.map((it, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-3 rounded-lg bg-secondary/50 p-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">
                    <span className="tabular-nums text-primary">{it.qty}×</span>{" "}
                    {it.name}
                  </p>
                  {it.options.length > 0 && (
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {it.options.map((o) => o.name).join(", ")}
                    </p>
                  )}
                  {it.notes && (
                    <p className="mt-0.5 text-[11.5px] italic text-amber-700">
                      “{it.notes}”
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[13px] font-bold tabular-nums">
                  {formatCurrency(it.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        {order.notes && (
          <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12.5px] text-amber-900">
            <StickyNote className="h-4 w-4 shrink-0 text-amber-600" />
            <span>{order.notes}</span>
          </div>
        )}

        {/* Totais */}
        <div className="space-y-1.5 rounded-xl border border-border/60 p-3 text-[13px]">
          <Line label="Subtotal" value={formatCurrency(order.subtotal)} />
          {order.deliveryType === "delivery" && (
            <Line
              label="Taxa de entrega"
              value={formatCurrency(order.deliveryFee)}
            />
          )}
          {order.discount > 0 && (
            <Line
              label={
                <span className="inline-flex items-center gap-1 text-success">
                  <Tag className="h-3.5 w-3.5" />
                  Desconto{order.couponCode ? ` (${order.couponCode})` : ""}
                </span>
              }
              value={`- ${formatCurrency(order.discount)}`}
              valueClass="text-success"
            />
          )}
          <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-2 font-display text-[15px] font-extrabold">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="sticky bottom-0 border-t border-border/60 bg-card px-5 py-3">
        {pending ? (
          <ConfirmBar
            pending={pending}
            next={next}
            prev={prev}
            onCancel={() => setPending(null)}
            onConfirm={() => {
              if (pending === "advance" && next) onSetStatus(next);
              else if (pending === "retreat" && prev) onSetStatus(prev);
              else if (pending === "cancel") onSetStatus("cancelled");
            }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPending("cancel")}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-[13px] font-bold text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
            >
              <Ban className="h-4 w-4" /> Cancelar
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setPending("retreat")}
                disabled={!prev}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-[13px] font-bold transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
              <button
                onClick={() => setPending("advance")}
                disabled={!next}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {next === "done" ? "Finalizar" : "Avançar"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ConfirmBar({
  pending,
  next,
  prev,
  onCancel,
  onConfirm,
}: {
  pending: Exclude<Pending, null>;
  next: OrderStatus | null;
  prev: OrderStatus | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const text =
    pending === "cancel"
      ? "Cancelar este pedido? Esta ação não pode ser desfeita."
      : pending === "advance"
        ? next === "done"
          ? "Finalizar e arquivar este pedido?"
          : `Avançar para “${next ? STATUS_CONFIG[next].label : ""}”?`
        : `Voltar para “${prev ? STATUS_CONFIG[prev].label : ""}”?`;
  const danger = pending === "cancel";

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <p
        className={cn(
          "flex items-center gap-1.5 text-[12.5px] font-semibold",
          danger ? "text-destructive" : "text-foreground",
        )}
      >
        <AlertTriangle className="h-4 w-4 shrink-0" />
        {text}
      </p>
      <div className="ml-auto flex shrink-0 gap-2">
        <button
          onClick={onCancel}
          className="h-9 rounded-lg border border-border px-3 text-[13px] font-bold transition-colors hover:bg-accent"
        >
          Voltar
        </button>
        <button
          onClick={onConfirm}
          className={cn(
            "h-9 rounded-lg px-4 text-[13px] font-bold text-white transition-colors",
            danger
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-primary hover:bg-primary/90",
          )}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

/* ── helpers de layout do modal ── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Phone;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-[13px]">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}

function Line({
  label,
  value,
  valueClass,
}: {
  label: React.ReactNode;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular-nums", valueClass)}>{value}</span>
    </div>
  );
}
