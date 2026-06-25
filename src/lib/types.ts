/**
 * Tipos de domínio compartilhados (pedido, carrinho, pagamento).
 * Tipos específicos do cardápio ficam em `@/lib/menu/types`.
 */

export type DeliveryType = "delivery" | "pickup";

export type PaymentMethod = "pix_entrega" | "dinheiro" | "cartao_maquina";

export type OrderStatus =
  | "queue"
  | "production"
  | "sent"
  | "done"
  | "cancelled";

export type CouponKind = "percent" | "fixed" | "free_delivery";

/** Opção (complemento) escolhida de um item. */
export interface SelectedOption {
  id: string;
  name: string;
  price: number;
}

/** Linha do carrinho (estado no cliente). */
export interface CartLine {
  /** id único da linha (não confundir com itemId do cardápio) */
  lineId: string;
  itemId: string;
  name: string;
  gradient: string;
  imageUrl?: string;
  basePrice: number;
  options: SelectedOption[];
  notes: string;
  quantity: number;
}

/** Linha congelada gravada no pedido (snapshot jsonb em orders.items). */
export interface OrderItemSnapshot {
  name: string;
  qty: number;
  unitPrice: number;
  options: { name: string; price: number }[];
  notes: string;
  lineTotal: number;
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix_entrega: "Pix na entrega",
  dinheiro: "Dinheiro",
  cartao_maquina: "Cartão na maquininha",
};

export const STATUS_FLOW: OrderStatus[] = [
  "queue",
  "production",
  "sent",
  "done",
];
