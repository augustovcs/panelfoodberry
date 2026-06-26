"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  Trash2,
  Plus,
  Power,
  Loader2,
  Tag,
  FolderPlus,
  Boxes,
  ImagePlus,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { iconByName, ICON_NAMES } from "@/lib/menu/icons";
import { formatCurrency, cn } from "@/lib/utils";

interface AdminItem {
  id: string;
  name: string;
  description: string | null;
  type: "produto" | "combo";
  price: number;
  old_price: number | null;
  badge: string | null;
  image_url: string | null;
  featured: boolean;
  active: boolean;
}
interface AdminCategory {
  id: string;
  name: string;
  icon: string;
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

/** Hook de mutação: chama a API e revalida os dados do servidor. */
function useApi() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function call(url: string, method: string, body?: unknown) {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      router.refresh();
      return res.ok;
    } finally {
      setBusy(false);
    }
  }
  return { call, busy, router };
}

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
  const allItems = categories.flatMap((c) => c.items);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Cardápio</h1>
          <p className="text-sm text-muted-foreground">
            Itens, fotos, preços e promoções, combos, negócio e cupons.
          </p>
        </div>
      </div>

      {!configured && (
        <div className="mt-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] text-warning-foreground">
          Modo demonstração — as alterações (inclusive fotos) são salvas quando
          o Supabase estiver conectado. Ver <code>supabase/README.md</code>.
        </div>
      )}

      <div className="my-5 flex gap-2">
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

      {tab === "itens" && (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            <NewCategory />
            <NewCombo categories={categories} items={allItems} />
          </div>

          {categories.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhuma categoria ainda. Crie a primeira em “Nova categoria”.
            </p>
          )}

          {categories.map((cat) => {
            const Icon = iconByName(cat.icon);
            return (
              <section key={cat.id} className="mb-7">
                <div className="mb-2.5 flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-[15px] w-[15px]" />
                  </span>
                  <h2 className="font-display text-[17px] font-extrabold">
                    {cat.name}
                  </h2>
                  <span className="rounded-full bg-secondary px-2 text-[12px] font-bold tabular-nums text-muted-foreground">
                    {cat.items.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <ItemRow key={item.id} item={item} />
                  ))}
                  <NewItem categoryId={cat.id} />
                </div>
              </section>
            );
          })}
        </>
      )}

      {tab === "negocio" && <SettingsForm settings={settings} />}
      {tab === "cupons" && <CouponsPanel coupons={coupons} />}
    </div>
  );
}

/* ─────────────────────────── Item (iFood-style) ─────────────────────────── */

function ItemRow({ item }: { item: AdminItem }) {
  const { call, busy, router } = useApi();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(String(item.price));
  const [oldPrice, setOldPrice] = useState(
    item.old_price != null ? String(item.old_price) : "",
  );

  const dirty =
    name !== item.name ||
    Number(price) !== item.price ||
    (oldPrice === "" ? null : Number(oldPrice)) !== item.old_price;

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("itemId", item.id);
      await fetch("/api/admin/upload", { method: "POST", body: fd });
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={cn(
        "shadow-soft flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 transition-opacity",
        !item.active && "opacity-55",
      )}
    >
      {/* Foto */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-secondary"
        aria-label={`Trocar foto de ${item.name}`}
        title="Trocar foto"
      >
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
          </span>
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <ImagePlus className="h-5 w-5 text-white" />
          )}
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadPhoto(f);
          e.target.value = "";
        }}
      />

      {/* Nome + chips + preços */}
      <div className="min-w-[180px] flex-1">
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 flex-1 font-semibold"
          />
          {item.type === "combo" && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              <Boxes className="h-3 w-3" /> Combo
            </span>
          )}
          {item.badge && (
            <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              {item.badge}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-end gap-2">
          <PriceField label="Preço" value={price} onChange={setPrice} />
          <PriceField
            label="De (promo)"
            value={oldPrice}
            onChange={setOldPrice}
            muted
          />
          {/* Prévia do desconto */}
          {oldPrice !== "" && Number(oldPrice) > Number(price) && (
            <span className="pb-1.5 text-[11px] font-bold text-success">
              -{Math.round((1 - Number(price) / Number(oldPrice)) * 100)}%
            </span>
          )}
          {dirty && (
            <Button
              size="sm"
              disabled={busy}
              onClick={() =>
                call(`/api/admin/items/${item.id}`, "PATCH", {
                  name,
                  price: Number(price),
                  old_price: oldPrice === "" ? null : Number(oldPrice),
                })
              }
              className="h-9"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="ml-auto flex items-center gap-1.5">
        <IconToggle
          on={item.featured}
          onClick={() =>
            call(`/api/admin/items/${item.id}`, "PATCH", {
              featured: !item.featured,
            })
          }
          title="Destaque"
          tone="amber"
        >
          <Star className={cn("h-4 w-4", item.featured && "fill-amber-400")} />
        </IconToggle>
        <IconToggle
          on={item.active}
          onClick={() =>
            call(`/api/admin/items/${item.id}`, "PATCH", {
              active: !item.active,
            })
          }
          title={item.active ? "Ativo" : "Inativo"}
          tone="emerald"
        >
          <Power className="h-4 w-4" />
        </IconToggle>
        <button
          onClick={() => {
            if (confirm(`Excluir "${item.name}"?`))
              call(`/api/admin/items/${item.id}`, "DELETE");
          }}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PriceField({
  label,
  value,
  onChange,
  muted,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  muted?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="relative w-24">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
          R$
        </span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(",", "."))}
          inputMode="decimal"
          placeholder={muted ? "—" : "0,00"}
          className="h-9 pl-8 tabular-nums"
        />
      </div>
    </label>
  );
}

function IconToggle({
  on,
  onClick,
  title,
  tone,
  children,
}: {
  on: boolean;
  onClick: () => void;
  title: string;
  tone: "amber" | "emerald";
  children: React.ReactNode;
}) {
  const onCls =
    tone === "amber"
      ? "border-amber-300 bg-amber-50 text-amber-600"
      : "border-emerald-300 bg-emerald-50 text-emerald-600";
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={on}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg border transition-colors",
        on ? onCls : "border-border text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── Criação ─────────────────────────── */

function NewCategory() {
  const { call, busy } = useApi();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("UtensilsCrossed");

  if (!open) {
    return (
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        className="h-10 gap-1.5 font-bold"
      >
        <FolderPlus className="h-4 w-4" /> Nova categoria
      </Button>
    );
  }
  return (
    <div className="shadow-soft flex w-full flex-wrap items-end gap-2 rounded-2xl border border-border/60 bg-card p-3">
      <label className="block flex-1">
        <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">
          Nome da categoria
        </span>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Sobremesas"
          className="h-10 min-w-[160px]"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">
          Ícone
        </span>
        <select
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-2 text-[13px]"
        >
          {ICON_NAMES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <Button
        disabled={busy || !name.trim()}
        onClick={async () => {
          const ok = await call("/api/admin/categories", "POST", {
            name,
            icon,
          });
          if (ok) {
            setName("");
            setOpen(false);
          }
        }}
        className="h-10 gap-1.5"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        Criar
      </Button>
      <Button variant="ghost" onClick={() => setOpen(false)} className="h-10">
        <X className="h-4 w-4" />
      </Button>
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
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" /> Novo item
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card p-3">
      <Input
        autoFocus
        placeholder="Nome do item"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-10 min-w-[160px] flex-1"
      />
      <Input
        placeholder="Preço"
        value={price}
        onChange={(e) => setPrice(e.target.value.replace(",", "."))}
        inputMode="decimal"
        className="h-10 w-28 tabular-nums"
      />
      <Button
        disabled={busy || !name.trim() || !price}
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
        className="h-10"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
      </Button>
      <Button variant="ghost" onClick={() => setOpen(false)} className="h-10">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function NewCombo({
  categories,
  items,
}: {
  categories: AdminCategory[];
  items: AdminItem[];
}) {
  const { call, busy } = useApi();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const components = items.filter((i) => i.type === "produto");

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!open) {
    return (
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        disabled={categories.length === 0}
        className="h-10 gap-1.5 font-bold"
      >
        <Boxes className="h-4 w-4" /> Novo combo
      </Button>
    );
  }
  return (
    <div className="shadow-soft w-full rounded-2xl border border-border/60 bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 font-display text-[15px] font-extrabold">
        <Boxes className="h-4 w-4 text-primary" /> Novo combo
      </h3>
      <div className="flex flex-wrap items-end gap-2">
        <label className="block flex-1">
          <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">
            Nome
          </span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Combo Casal"
            className="h-10 min-w-[160px]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">
            Categoria
          </span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-2 text-[13px]"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">
            Preço
          </span>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(",", "."))}
            inputMode="decimal"
            className="h-10 w-24 tabular-nums"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">
            De (promo)
          </span>
          <Input
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value.replace(",", "."))}
            inputMode="decimal"
            placeholder="—"
            className="h-10 w-24 tabular-nums"
          />
        </label>
      </div>

      <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Itens do combo ({picked.size})
      </p>
      <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-border/60 p-1.5">
        {components.map((it) => {
          const on = picked.has(it.id);
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => toggle(it.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                on ? "bg-primary/5" : "hover:bg-accent",
              )}
            >
              <span
                className={cn(
                  "grid h-[18px] w-[18px] place-items-center rounded border-2",
                  on ? "border-primary bg-primary" : "border-border",
                )}
              >
                {on && <Check className="h-3 w-3 text-primary-foreground" />}
              </span>
              <span className="flex-1 text-[13px] font-medium">{it.name}</span>
              <span className="text-[12px] tabular-nums text-muted-foreground">
                {formatCurrency(it.price)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          disabled={
            busy || !name.trim() || !price || picked.size === 0 || !categoryId
          }
          onClick={async () => {
            const ok = await call("/api/admin/combos", "POST", {
              categoryId,
              name,
              price: Number(price),
              oldPrice: oldPrice === "" ? null : Number(oldPrice),
              componentIds: [...picked],
            });
            if (ok) {
              setName("");
              setPrice("");
              setOldPrice("");
              setPicked(new Set());
              setOpen(false);
            }
          }}
          className="h-10 gap-1.5"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Criar combo
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)} className="h-10">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────── Negócio ─────────────────────────── */

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

/* ─────────────────────────── Cupons ─────────────────────────── */

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
