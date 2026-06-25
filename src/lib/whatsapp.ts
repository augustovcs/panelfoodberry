import type {
  OrderItemSnapshot,
  PaymentMethod,
  DeliveryType,
} from "@/lib/types";
import { PAYMENT_LABELS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { digitsOnly } from "@/lib/validators/common";

export interface WhatsappOrder {
  code: string;
  customerName: string;
  items: OrderItemSnapshot[];
  deliveryType: DeliveryType;
  address?: string;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes?: string;
}

/** Resumo do pedido formatado para o WhatsApp do restaurante. */
export function buildOrderMessage(o: WhatsappOrder): string {
  const lines: string[] = [
    `*Novo pedido ${o.code}*`,
    `Cliente: ${o.customerName}`,
    "",
  ];

  for (const it of o.items) {
    lines.push(`${it.qty}x ${it.name} — ${formatCurrency(it.lineTotal)}`);
    if (it.options.length > 0) {
      lines.push(`   + ${it.options.map((x) => x.name).join(", ")}`);
    }
    if (it.notes) lines.push(`   obs: ${it.notes}`);
  }

  lines.push("");
  lines.push(`Subtotal: ${formatCurrency(o.subtotal)}`);
  if (o.discount > 0) lines.push(`Desconto: -${formatCurrency(o.discount)}`);
  lines.push(
    o.deliveryType === "delivery"
      ? `Entrega: ${formatCurrency(o.deliveryFee)}`
      : "Retirada no local",
  );
  lines.push(`*Total: ${formatCurrency(o.total)}*`);
  lines.push("");

  if (o.deliveryType === "delivery" && o.address) {
    lines.push(`Endereço: ${o.address}`);
  }

  const change =
    o.paymentMethod === "dinheiro" && o.changeFor
      ? ` (troco p/ ${formatCurrency(o.changeFor)})`
      : "";
  lines.push(`Pagamento: ${PAYMENT_LABELS[o.paymentMethod]}${change}`);

  if (o.notes) lines.push(`Obs.: ${o.notes}`);

  return lines.join("\n");
}

/** Monta o link wa.me com o destino (E.164) e a mensagem codificada. */
export function buildWhatsappLink(phone: string, message: string): string {
  return `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(message)}`;
}
