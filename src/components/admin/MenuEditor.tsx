"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Plus, Power, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AdminItem {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  badge: string | null;
  featured: boolean;
  active: boolean;
}
interface AdminCategory {
  id: string;
  name: string;
  items: AdminItem[];
}
interface AdminCoupon {
  id: string;
  code: string;
  kind: string;
  value: number;
  min_order: number;
  active: boolean;
}
interface AdminSettings {
  name: string;
  is_open: boolean;
  delivery_fee: number;
  min_order: number;
  delivery_time: string | null;
  phone_whatsapp: string;
}

type Tab = "itens" | "negocio" | "cupons";

export function MenuEditor({
  configured,
  categories,
  settings,
  coupons,
}: {
  configured: boolean;
  categories: AdminCategory[];
  settings: AdminSettings | null;
  coupons: AdminCoupon[];
}) {
  const [tab, setTab] = useState<Tab>("itens");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 font-display text-2xl font-extrabold">Cardápio</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Edite itens, valores, dados do negócio e cupons.
      </p>

      {!configured && (
        <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] text-warning-foreground">
          Conecte o Supabase para editar o cardápio (as alterações são salvas no
          banco). Ver <code>supabase/README.md</code>.
        </div>
      )}

      <div className="mb-5 flex gap-2">
        {(["itens", "negocio", "cupons"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] font-bold capitalize transition-colors",
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "negocio" ? "Negócio" : t}
          </button>
        ))}
      </div>

      {tab === "itens" &&
        categories.map((cat) => (
          <section key={cat.id} className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-[16px] font-extrabold">
                {cat.name}
              </h2>
            </div>
            <div className="space-y-2">
              {cat.items.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
              <NewItem categoryId={cat.id} />
            </div>
          </section>
        ))}

      {tab === "negocio" && <SettingsForm settings={settings} />}
      {tab === "cupons" && <CouponsPanel coupons={coupons} />}
    </div>
  );
}

function useApi() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function call(url: string, method: string, body?: unknown) {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      router.refresh();
      return res.ok;
    } finally {
      setBusy(false);
    }
  }
  return { call, busy };
}

function ItemRow({ item }: { item: AdminItem }) {
  const { call, busy } = useApi();
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(String(item.price));
  const dirty = name !== item.name || Number(price) !== item.price;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card p-2.5",
        !item.active && "opacity-50",
      )}
    >
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9 min-w-[140px] flex-1"
      />
      <div className="relative w-28">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
          R$
        </span>
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(",", "."))}
          inputMode="decimal"
          className="h-9 pl-8 tabular-nums"
        />
      </div>
      <button
        onClick={() =>
          call(`/api/admin/items/${item.id}`, "PATCH", {
            featured: !item.featured,
          })
        }
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg border",
          item.featured
            ? "border-amber-300 bg-amber-50 text-amber-600"
            : "border-border text-muted-foreground",
        )}
        title="Destaque"
      >
        <Star className={cn("h-4 w-4", item.featured && "fill-amber-400")} />
      </button>
      <button
        onClick={() =>
          call(`/api/admin/items/${item.id}`, "PATCH", { active: !item.active })
        }
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg border",
          item.active
            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
            : "border-border text-muted-foreground",
        )}
        title={item.active ? "Ativo" : "Inativo"}
      >
        <Power className="h-4 w-4" />
      </button>
      {dirty && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() =>
            call(`/api/admin/items/${item.id}`, "PATCH", {
              name,
              price: Number(price),
            })
          }
          className="h-9"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </Button>
      )}
      <button
        onClick={() => {
          if (confirm(`Excluir "${item.name}"?`))
            call(`/api/admin/items/${item.id}`, "DELETE");
        }}
        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        title="Excluir"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function NewItem({ categoryId }: { categoryId: string }) {
  const { call, busy } = useApi();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2.5 text-[13px] font-semibold text-muted-foreground hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        Novo item
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card p-2.5">
      <Input
        autoFocus
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9 min-w-[140px] flex-1"
      />
      <Input
        placeholder="Preço"
        value={price}
        onChange={(e) => setPrice(e.target.value.replace(",", "."))}
        inputMode="decimal"
        className="h-9 w-28 tabular-nums"
      />
      <Button
        size="sm"
        disabled={busy || !name || !price}
        onClick={async () => {
          const ok = await call("/api/admin/items", "POST", {
            categoryId,
            name,
            price: Number(price),
          });
          if (ok) {
            setName("");
            setPrice("");
            setOpen(false);
          }
        }}
        className="h-9"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
      </Button>
      <button
        onClick={() => setOpen(false)}
        className="px-2 text-[13px] text-muted-foreground"
      >
        Cancelar
      </button>
    </div>
  );
}

function SettingsForm({ settings }: { settings: AdminSettings | null }) {
  const { call, busy } = useApi();
  const [s, setS] = useState({
    name: settings?.name ?? "",
    is_open: settings?.is_open ?? true,
    delivery_fee: String(settings?.delivery_fee ?? 0),
    min_order: String(settings?.min_order ?? 0),
    delivery_time: settings?.delivery_time ?? "",
    phone_whatsapp: settings?.phone_whatsapp ?? "",
  });

  return (
    <div className="shadow-soft max-w-md space-y-3 rounded-2xl border border-border/60 bg-card p-5">
      <button
        onClick={() => setS((p) => ({ ...p, is_open: !p.is_open }))}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border-2 px-4 py-3",
          s.is_open ? "border-emerald-300 bg-emerald-50" : "border-border",
        )}
      >
        <span className="text-[14px] font-bold">
          {s.is_open ? "Aberto agora" : "Fechado"}
        </span>
        <Power
          className={cn(
            "h-5 w-5",
            s.is_open ? "text-emerald-600" : "text-muted-foreground",
          )}
        />
      </button>

      <LabeledInput
        label="Nome do negócio"
        value={s.name}
        onChange={(v) => setS((p) => ({ ...p, name: v }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <LabeledInput
          label="Taxa de entrega (R$)"
          value={s.delivery_fee}
          onChange={(v) =>
            setS((p) => ({ ...p, delivery_fee: v.replace(",", ".") }))
          }
        />
        <LabeledInput
          label="Pedido mínimo (R$)"
          value={s.min_order}
          onChange={(v) =>
            setS((p) => ({ ...p, min_order: v.replace(",", ".") }))
          }
        />
      </div>
      <LabeledInput
        label="Tempo de entrega"
        value={s.delivery_time}
        onChange={(v) => setS((p) => ({ ...p, delivery_time: v }))}
      />
      <LabeledInput
        label="WhatsApp (E.164, ex: 5511...)"
        value={s.phone_whatsapp}
        onChange={(v) =>
          setS((p) => ({ ...p, phone_whatsapp: v.replace(/\D/g, "") }))
        }
      />

      <Button
        disabled={busy}
        onClick={() =>
          call("/api/admin/settings", "PATCH", {
            name: s.name,
            is_open: s.is_open,
            delivery_fee: Number(s.delivery_fee),
            min_order: Number(s.min_order),
            delivery_time: s.delivery_time,
            phone_whatsapp: s.phone_whatsapp,
          })
        }
        className="h-11 w-full rounded-xl font-bold"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
      </Button>
    </div>
  );
}

function CouponsPanel({ coupons }: { coupons: AdminCoupon[] }) {
  const { call, busy } = useApi();
  const [code, setCode] = useState("");
  const [kind, setKind] = useState("percent");
  const [value, setValue] = useState("");

  const kindLabel = (k: string) =>
    k === "percent" ? "%" : k === "fixed" ? "R$" : "Frete grátis";

  return (
    <div className="max-w-lg space-y-4">
      <div className="space-y-2">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3"
          >
            <div>
              <span className="font-display text-[14px] font-extrabold">
                {c.code}
              </span>
              <span className="ml-2 text-[12px] text-muted-foreground">
                {c.kind === "free_delivery"
                  ? "Frete grátis"
                  : `${c.value}${kindLabel(c.kind)}`}
              </span>
            </div>
            <button
              onClick={() =>
                call(`/api/admin/coupons/${c.id}`, "PATCH", {
                  active: !c.active,
                })
              }
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-bold",
                c.active
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {c.active ? "Ativo" : "Inativo"}
            </button>
          </div>
        ))}
        {coupons.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum cupom ainda.</p>
        )}
      </div>

      <div className="shadow-soft rounded-2xl border border-border/60 bg-card p-4">
        <h3 className="mb-3 flex items-center gap-2 font-display text-[14px] font-extrabold">
          <Tag className="h-4 w-4 text-primary" />
          Novo cupom
        </h3>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="CÓDIGO"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="h-10 min-w-[120px] flex-1 uppercase"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-2 text-[13px]"
          >
            <option value="percent">% desconto</option>
            <option value="fixed">R$ desconto</option>
            <option value="free_delivery">Frete grátis</option>
          </select>
          {kind !== "free_delivery" && (
            <Input
              placeholder="Valor"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(",", "."))}
              inputMode="decimal"
              className="h-10 w-24"
            />
          )}
          <Button
            disabled={busy || !code}
            onClick={async () => {
              const ok = await call("/api/admin/coupons", "POST", {
                code,
                kind,
                value: kind === "free_delivery" ? 0 : Number(value || 0),
              });
              if (ok) {
                setCode("");
                setValue("");
              }
            }}
            className="h-10"
          >
            Criar
          </Button>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold text-muted-foreground">
        {label}
      </span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
