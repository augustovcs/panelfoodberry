"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bike,
  Store,
  Minus,
  Plus,
  Trash2,
  Tag,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FoodImage } from "@/components/storefront/FoodImage";
import {
  useCart,
  useCartSubtotal,
  useCartHydrated,
  lineDisplayTotal,
} from "@/store/cart";
import type { PaymentMethod } from "@/lib/types";
import { PAYMENT_LABELS } from "@/lib/types";
import { saveLocalOrder } from "@/lib/orders/local";
import { toE164BR } from "@/lib/validators/common";
import {
  formatCurrency,
  cn,
  maskPhone,
  maskCEP,
  maskCurrency,
} from "@/lib/utils";

const PAYMENTS: PaymentMethod[] = ["pix_entrega", "dinheiro", "cartao_maquina"];

interface AppliedCoupon {
  code: string;
  discount: number;
  freeDelivery: boolean;
}

export function CheckoutFlow({
  deliveryFee,
  minOrder,
}: {
  deliveryFee: number;
  minOrder: number;
}) {
  const router = useRouter();
  const ready = useCartHydrated();
  const lines = useCart((s) => s.lines);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotal = useCartSubtotal();

  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">(
    "delivery",
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
  });
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [changeFor, setChangeFor] = useState("");
  const [notes, setNotes] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fee =
    deliveryType === "delivery" ? (coupon?.freeDelivery ? 0 : deliveryFee) : 0;
  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal + fee - discount);
  const belowMin = subtotal < minOrder;

  if (ready && lines.length === 0) return <EmptyCart />;

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({
          code: data.code,
          discount: data.discount,
          freeDelivery: data.freeDelivery,
        });
        setCouponMsg("Cupom aplicado!");
      } else {
        setCoupon(null);
        setCouponMsg("Cupom inválido ou expirado.");
      }
    } catch {
      setCouponMsg("Não foi possível validar o cupom agora.");
    } finally {
      setCheckingCoupon(false);
    }
  }

  function validate(): string | null {
    if (name.trim().length < 2) return "Informe seu nome.";
    if (!toE164BR(phone)) return "Telefone inválido.";
    if (deliveryType === "delivery") {
      if (!address.street.trim() || !address.number.trim())
        return "Informe rua e número.";
      if (!address.neighborhood.trim() || !address.city.trim())
        return "Informe bairro e cidade.";
    }
    if (!payment) return "Escolha a forma de pagamento.";
    if (belowMin)
      return `Pedido mínimo de ${formatCurrency(minOrder)} para finalizar.`;
    return null;
  }

  async function submit() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSubmitting(true);

    const payload = {
      customerName: name.trim(),
      customerPhone: toE164BR(phone)!,
      deliveryType,
      address: deliveryType === "delivery" ? address : undefined,
      paymentMethod: payment,
      changeFor:
        payment === "dinheiro" && changeFor
          ? Number(changeFor.replace(/\./g, "").replace(",", "."))
          : undefined,
      couponCode: coupon?.code,
      notes: notes.trim(),
      items: lines.map((l) => ({
        itemId: l.itemId,
        optionIds: l.options.map((o) => o.id),
        quantity: l.quantity,
        notes: l.notes,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Não foi possível enviar o pedido.");
        setSubmitting(false);
        return;
      }
      const data = await res.json();
      // Histórico local (Meus pedidos + tracking em modo mock).
      saveLocalOrder({
        code: data.code,
        createdAt: Date.now(),
        deliveryType,
        items: lines.map((l) => ({
          name: l.name,
          qty: l.quantity,
          lineTotal: lineDisplayTotal(l),
        })),
        subtotal,
        deliveryFee: fee,
        discount,
        total,
      });
      clear();
      if (data.whatsappUrl) window.open(data.whatsappUrl, "_blank");
      router.push(`/pedido/${data.code}`);
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-40 pt-4 lg:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Cardápio
      </Link>

      <h1 className="mb-4 font-display text-2xl font-extrabold">Seu pedido</h1>

      {/* Itens */}
      <section className="shadow-soft rounded-2xl border border-border/60 bg-card p-2">
        {lines.map((l) => (
          <div key={l.lineId} className="flex gap-3 rounded-xl p-2.5">
            <FoodImage
              name={l.name}
              gradient={l.gradient}
              imageUrl={l.imageUrl}
              className="h-20 w-20 shrink-0 rounded-xl"
              sizes="80px"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14px] font-semibold leading-tight">
                  {l.name}
                </p>
                <span className="shrink-0 text-[14px] font-bold tabular-nums">
                  {formatCurrency(lineDisplayTotal(l))}
                </span>
              </div>
              {l.options.length > 0 && (
                <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">
                  {l.options.map((o) => o.name).join(", ")}
                </p>
              )}
              {l.notes && (
                <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                  {l.notes}
                </p>
              )}
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dec(l.lineId)}
                    disabled={l.quantity <= 1}
                    className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
                    aria-label="Diminuir"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-[13px] font-semibold tabular-nums">
                    {l.quantity}
                  </span>
                  <button
                    onClick={() => inc(l.lineId)}
                    className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    aria-label="Aumentar"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => remove(l.lineId)}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Entrega ou retirada */}
      <SectionTitle>Entrega</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <ToggleCard
          active={deliveryType === "delivery"}
          onClick={() => setDeliveryType("delivery")}
          icon={<Bike className="h-5 w-5" />}
          title="Entrega"
          subtitle={formatCurrency(deliveryFee)}
        />
        <ToggleCard
          active={deliveryType === "pickup"}
          onClick={() => setDeliveryType("pickup")}
          icon={<Store className="h-5 w-5" />}
          title="Retirada"
          subtitle="Grátis"
        />
      </div>

      {deliveryType === "delivery" && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="CEP">
            <Input
              value={address.cep}
              onChange={(e) =>
                setAddress((a) => ({ ...a, cep: maskCEP(e.target.value) }))
              }
              inputMode="numeric"
              placeholder="00000-000"
            />
          </Field>
          <Field label="Cidade">
            <Input
              value={address.city}
              onChange={(e) =>
                setAddress((a) => ({ ...a, city: e.target.value }))
              }
            />
          </Field>
          <div className="col-span-2">
            <Field label="Rua">
              <Input
                value={address.street}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, street: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Número">
            <Input
              value={address.number}
              onChange={(e) =>
                setAddress((a) => ({ ...a, number: e.target.value }))
              }
              inputMode="numeric"
            />
          </Field>
          <Field label="Complemento">
            <Input
              value={address.complement}
              onChange={(e) =>
                setAddress((a) => ({ ...a, complement: e.target.value }))
              }
              placeholder="opcional"
            />
          </Field>
          <div className="col-span-2">
            <Field label="Bairro">
              <Input
                value={address.neighborhood}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, neighborhood: e.target.value }))
                }
              />
            </Field>
          </div>
        </div>
      )}

      {/* Dados do cliente */}
      <SectionTitle>Seus dados</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nome">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Telefone (WhatsApp)">
          <Input
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            inputMode="numeric"
            placeholder="(11) 99999-8888"
          />
        </Field>
      </div>

      {/* Cupom */}
      <SectionTitle>Cupom</SectionTitle>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="CÓDIGO"
            className="pl-9 uppercase"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={applyCoupon}
          disabled={checkingCoupon}
        >
          {checkingCoupon ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Aplicar"
          )}
        </Button>
      </div>
      {couponMsg && (
        <p
          className={cn(
            "mt-1.5 text-[12px] font-semibold",
            coupon ? "text-success" : "text-destructive",
          )}
        >
          {couponMsg}
        </p>
      )}

      {/* Pagamento */}
      <SectionTitle>Pagamento na entrega</SectionTitle>
      <div className="space-y-2">
        {PAYMENTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPayment(p)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors",
              payment === p
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-accent",
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full border-2",
                payment === p ? "border-primary" : "border-border",
              )}
            >
              {payment === p && (
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </span>
            <span className="text-[14px] font-semibold">
              {PAYMENT_LABELS[p]}
            </span>
          </button>
        ))}
      </div>
      {payment === "dinheiro" && (
        <div className="mt-3">
          <Field label="Troco para quanto?">
            <Input
              value={changeFor}
              onChange={(e) => setChangeFor(maskCurrency(e.target.value))}
              inputMode="numeric"
              placeholder="0,00"
            />
          </Field>
        </div>
      )}

      {/* Observação */}
      <SectionTitle>Observação do pedido</SectionTitle>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ex: tocar a campainha, deixar na portaria..."
        className="min-h-[64px] resize-none"
        maxLength={300}
      />

      {error && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-[13px] font-semibold text-destructive">
          {error}
        </p>
      )}

      {/* Resumo fixo */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="safe-bottom mx-auto max-w-2xl px-4 py-3 lg:px-6">
          <div className="mb-2 space-y-1 text-[13px]">
            <Row label="Subtotal" value={formatCurrency(subtotal)} muted />
            {deliveryType === "delivery" && (
              <Row
                label="Entrega"
                value={fee === 0 ? "Grátis" : formatCurrency(fee)}
                muted
              />
            )}
            {discount > 0 && (
              <Row
                label="Desconto"
                value={`- ${formatCurrency(discount)}`}
                accent
              />
            )}
            <Row label="Total" value={formatCurrency(total)} bold />
          </div>
          <Button
            onClick={submit}
            disabled={submitting || !ready}
            size="lg"
            className="h-12 w-full rounded-xl text-[15px] font-bold"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Enviar pedido no WhatsApp"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 font-display text-[15px] font-extrabold">
      {children}
    </h2>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function ToggleCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl border-2 px-4 py-3 transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-accent",
      )}
    >
      <span className={active ? "text-primary" : "text-muted-foreground"}>
        {icon}
      </span>
      <span className="text-[14px] font-bold">{title}</span>
      <span className="text-[12px] text-muted-foreground">{subtitle}</span>
    </button>
  );
}

function Row({
  label,
  value,
  muted,
  bold,
  accent,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between",
        muted && "text-muted-foreground",
        accent && "text-success",
        bold && "text-[15px] font-extrabold",
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary">
        <ShoppingBag className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="font-display text-2xl font-bold">Carrinho vazio</h1>
      <p className="text-muted-foreground">
        Adicione itens do cardápio para fazer seu pedido.
      </p>
      <Button asChild className="rounded-xl">
        <Link href="/">Ver cardápio</Link>
      </Button>
    </div>
  );
}
