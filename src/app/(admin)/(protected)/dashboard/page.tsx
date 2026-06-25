import { TrendingUp, ShoppingBag, Clock, DollarSign } from "lucide-react";
import { getDashboardStats } from "@/lib/admin/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const s = await getDashboardStats();
  const maxNet = Math.max(1, ...s.last14.map((d) => d.net));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 font-display text-2xl font-extrabold">Dashboard</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Visão do dia e vendas recentes.
      </p>

      {!s.configured && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] font-medium text-warning-foreground">
          Supabase não configurado — os números aparecem quando o banco estiver
          conectado (ver <code>supabase/README.md</code>).
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat
          icon={ShoppingBag}
          label="Pedidos hoje"
          value={String(s.todayCount)}
        />
        <Stat
          icon={DollarSign}
          label="Faturamento hoje"
          value={formatCurrency(s.todayGross)}
        />
        <Stat icon={Clock} label="Em aberto" value={String(s.openOrders)} />
      </div>

      <div className="shadow-soft mt-6 rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-[18px] w-[18px] text-primary" />
          <h2 className="font-display text-[15px] font-extrabold">
            Vendas (últimos 14 dias)
          </h2>
        </div>
        {s.last14.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
        ) : (
          <div className="flex h-40 items-end gap-1.5">
            {s.last14.map((d) => (
              <div
                key={d.day}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className="w-full rounded-t bg-primary/80"
                  style={{ height: `${(d.net / maxNet) * 100}%` }}
                  title={`${d.day}: ${formatCurrency(d.net)}`}
                />
                <span className="text-[9px] text-muted-foreground">
                  {d.day.slice(8, 10)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="shadow-soft rounded-2xl border border-border/60 bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 text-[12px] text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-extrabold tabular-nums">
        {value}
      </p>
    </div>
  );
}
