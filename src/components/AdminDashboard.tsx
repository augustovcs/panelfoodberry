import {
  Clock,
  ChefHat,
  Truck,
  CheckCircle2,
  XCircle,
  BarChart3,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import { STATUS_CONFIG, type OrderStatus } from "@/types";

const METRIC_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  queue: Clock,
  production: ChefHat,
  sent: Truck,
  done: CheckCircle2,
  cancelled: XCircle,
  total: BarChart3,
  revenue: Receipt,
  avg: TrendingUp,
};

export function AdminDashboard() {
  const orders = useStore((s) => s.orders);

  const counts: Record<OrderStatus, number> = {
    queue: 0,
    production: 0,
    sent: 0,
    done: 0,
    cancelled: 0,
  };
  orders.forEach((o) => counts[o.status]++);

  const revenue = orders
    .filter((o) => o.status === "done")
    .reduce((s, o) => s + o.total, 0);

  const avgTicket = counts.done > 0 ? revenue / counts.done : 0;

  const metrics = [
    {
      key: "queue",
      label: "Na fila",
      value: String(counts.queue),
      sub: "aguardando",
      highlight: true,
    },
    {
      key: "production",
      label: "Em produção",
      value: String(counts.production),
      sub: "preparando",
      color: "text-amber-600",
    },
    {
      key: "sent",
      label: "Enviados",
      value: String(counts.sent),
      sub: "a caminho",
      color: "text-blue-600",
    },
    {
      key: "done",
      label: "Finalizados",
      value: String(counts.done),
      sub: "entregues",
      color: "text-emerald-600",
    },
    {
      key: "cancelled",
      label: "Cancelados",
      value: String(counts.cancelled),
      sub: "hoje",
      color: "text-red-500",
    },
    {
      key: "total",
      label: "Total pedidos",
      value: String(orders.length),
      sub: "hoje",
    },
    {
      key: "revenue",
      label: "Faturamento",
      value: formatCurrency(revenue),
      sub: "finalizados",
      highlight: true,
      smallValue: true,
    },
    {
      key: "avg",
      label: "Ticket médio",
      value: formatCurrency(avgTicket),
      sub: "por pedido",
      smallValue: true,
    },
  ];

  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <main className="flex-1 py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Page heading */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold leading-tight">
              Visão de hoje
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Acompanhe os pedidos e o faturamento em tempo real.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ao vivo
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {metrics.map((m, i) => {
            const Icon = METRIC_ICONS[m.key];
            return (
              <div
                key={m.key}
                className={cn(
                  "rounded-xl border p-4 transition-colors animate-slide-up",
                  m.highlight
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card hover:border-border/80"
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </span>
                  <Icon className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <p
                  className={cn(
                    "font-display font-extrabold tabular-nums",
                    m.smallValue ? "text-xl" : "text-[26px]",
                    m.color ?? (m.highlight ? "text-primary" : "text-foreground")
                  )}
                >
                  {m.value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {m.sub}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <h2 className="font-display text-[18px] font-extrabold mb-4">
          Pedidos recentes
        </h2>
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider hidden md:table-cell">
                    Itens
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider hidden sm:table-cell">
                    Hora
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((o) => {
                  const status = STATUS_CONFIG[o.status];
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-border/60 last:border-0 hover:bg-accent/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-primary tabular-nums">
                        {o.id}
                      </td>
                      <td className="px-4 py-3">{o.customer.name}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate hidden md:table-cell">
                        {o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        {formatCurrency(o.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide inline-block",
                            status.bg,
                            status.color
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums hidden sm:table-cell">
                        {timeAgo(o.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
