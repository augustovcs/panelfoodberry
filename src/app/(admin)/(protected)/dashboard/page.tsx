import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Clock,
  DollarSign,
  Receipt,
  Bike,
  Store,
  XCircle,
  Database,
} from "lucide-react";
import { getDashboardStats } from "@/lib/admin/data";
import { formatCurrency, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const s = await getDashboardStats();

  const periodNet = s.last14.reduce((a, d) => a + d.net, 0);
  const periodOrders = s.last14.reduce((a, d) => a + d.orders, 0);
  const avgDay = s.last14.length ? periodNet / s.last14.length : 0;
  const totalDelivery = s.deliveryCount + s.pickupCount;
  const deliveryPct = totalDelivery
    ? Math.round((s.deliveryCount / totalDelivery) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Visão do dia e vendas dos últimos 14 dias.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Ao vivo
        </span>
      </div>

      {!s.configured && <ConnectBanner />}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={DollarSign}
          label="Faturamento hoje"
          value={formatCurrency(s.todayGross)}
          delta={s.grossDelta}
          accent
        />
        <Stat
          icon={ShoppingBag}
          label="Pedidos hoje"
          value={String(s.todayCount)}
          hint={`${s.cancelledToday} cancelado${s.cancelledToday === 1 ? "" : "s"}`}
        />
        <Stat
          icon={Receipt}
          label="Ticket médio"
          value={formatCurrency(s.avgTicket)}
        />
        <Stat
          icon={Clock}
          label="Em aberto"
          value={String(s.openOrders)}
          hint="na cozinha agora"
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {/* Sales chart */}
        <div className="shadow-soft rounded-2xl border border-border/60 bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-[18px] w-[18px] text-primary" />
              <h2 className="font-display text-[15px] font-extrabold">
                Vendas — últimos 14 dias
              </h2>
            </div>
            <div className="flex items-center gap-4 text-right">
              <Mini label="Período" value={formatCurrency(periodNet)} />
              <Mini label="Pedidos" value={String(periodOrders)} />
              <Mini label="Média/dia" value={formatCurrency(avgDay)} />
            </div>
          </div>
          <SalesChart data={s.last14} avg={avgDay} />
        </div>

        {/* Modalidade split */}
        <div className="shadow-soft flex flex-col rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="mb-4 font-display text-[15px] font-extrabold">
            Modalidade hoje
          </h2>
          <SplitBar
            deliveryPct={deliveryPct}
            delivery={s.deliveryCount}
            pickup={s.pickupCount}
          />
          <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
            <Legend
              icon={Bike}
              label="Entrega"
              value={s.deliveryCount}
              tone="blue"
            />
            <Legend
              icon={Store}
              label="Retirada"
              value={s.pickupCount}
              tone="emerald"
            />
          </div>
          {s.cancelledToday > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">
              <XCircle className="h-4 w-4" />
              {s.cancelledToday} pedido{s.cancelledToday === 1 ? "" : "s"}{" "}
              cancelado{s.cancelledToday === 1 ? "" : "s"} hoje
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Banner: conectar Supabase (legível, com CTA) ── */
function ConnectBanner() {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
          <Database className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="text-[13.5px] font-bold text-amber-900">
            Modo demonstração — dados de exemplo
          </p>
          <p className="mt-0.5 text-[12.5px] text-amber-800">
            Conecte o Supabase para ver pedidos e faturamento reais em tempo
            real.
          </p>
        </div>
      </div>
      <a
        href="https://supabase.com/dashboard"
        target="_blank"
        rel="noreferrer"
        className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-center text-[13px] font-bold text-white transition-colors hover:bg-amber-700"
      >
        Conectar Supabase
      </a>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  delta,
  accent,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  hint?: string;
  delta?: number | null;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "shadow-soft rounded-2xl border p-4",
        accent
          ? "border-primary/20 bg-gradient-to-br from-primary/[0.07] to-card"
          : "border-border/60 bg-card",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            accent ? "bg-primary/15 text-primary" : "bg-secondary text-primary",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {delta != null && <DeltaChip delta={delta} />}
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-extrabold tabular-nums">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function DeltaChip({ delta }: { delta: number }) {
  const up = delta >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
        up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
      )}
    >
      <Icon className="h-3 w-3" />
      {up ? "+" : ""}
      {delta.toFixed(0)}%
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-display text-[14px] font-extrabold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function SalesChart({
  data,
  avg,
}: {
  data: { day: string; net: number; orders: number }[];
  avg: number;
}) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Sem dados ainda.
      </p>
    );
  }
  const max = Math.max(1, ...data.map((d) => d.net));
  const avgPct = (avg / max) * 100;

  return (
    <div className="relative h-44 pt-5">
      {/* linha de média */}
      <div
        className="pointer-events-none absolute inset-x-0 border-t border-dashed border-primary/40"
        style={{ bottom: `${avgPct}%` }}
      >
        <span className="absolute -top-4 right-0 text-[10px] font-semibold text-primary/70">
          média {formatCurrency(avg)}
        </span>
      </div>

      <div className="flex h-full items-end gap-1.5">
        {data.map((d) => {
          const date = new Date(d.day + "T12:00:00");
          const wd = date.toLocaleDateString("pt-BR", { weekday: "short" });
          const dd = date.getDate();
          return (
            <div
              key={d.day}
              className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              {/* tooltip */}
              <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-center text-[10px] font-semibold text-background shadow-lg group-hover:block">
                {formatCurrency(d.net)}
                <span className="block font-normal text-background/70">
                  {d.orders} pedidos
                </span>
              </div>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all group-hover:from-primary group-hover:to-primary"
                style={{ height: `${Math.max(4, (d.net / max) * 100)}%` }}
              />
              <span className="text-[9px] capitalize leading-none text-muted-foreground">
                {wd.replace(".", "")}
              </span>
              <span className="text-[9px] font-semibold leading-none text-foreground/60">
                {dd}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SplitBar({
  deliveryPct,
  delivery,
  pickup,
}: {
  deliveryPct: number;
  delivery: number;
  pickup: number;
}) {
  const empty = delivery + pickup === 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-3xl font-extrabold tabular-nums">
          {empty ? "—" : `${deliveryPct}%`}
        </span>
        <span className="text-[12px] text-muted-foreground">entrega</span>
      </div>
      <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-secondary">
        {!empty && (
          <>
            <div className="bg-blue-500" style={{ width: `${deliveryPct}%` }} />
            <div
              className="bg-emerald-500"
              style={{ width: `${100 - deliveryPct}%` }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Legend({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Bike;
  label: string;
  value: number;
  tone: "blue" | "emerald";
}) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <div className="flex items-center gap-1.5">
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "blue" ? "text-blue-600" : "text-emerald-600",
          )}
        />
        <span className="text-[12px] text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 font-display text-xl font-extrabold tabular-nums">
        {value}
      </p>
    </div>
  );
}
