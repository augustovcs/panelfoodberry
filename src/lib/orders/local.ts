/**
 * Pedidos guardados no navegador (client). Servem para "Meus pedidos" e para o
 * acompanhamento funcionar em modo mock (sem banco) — o status é simulado pelo
 * tempo decorrido. Quando o Supabase estiver ativo, o tracking usa o banco e isto
 * vira só um histórico local de conveniência.
 */
import type { OrderStatus, DeliveryType } from "@/lib/types";

export interface LocalOrderItem {
  name: string;
  qty: number;
  lineTotal: number;
}

export interface LocalOrder {
  code: string;
  createdAt: number;
  deliveryType: DeliveryType;
  items: LocalOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

const KEY = "anotabem-orders";

export function getLocalOrders(): LocalOrder[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as LocalOrder[];
  } catch {
    return [];
  }
}

export function getLocalOrder(code: string): LocalOrder | null {
  return getLocalOrders().find((o) => o.code === code) ?? null;
}

export function saveLocalOrder(order: LocalOrder): void {
  try {
    const all = getLocalOrders().filter((o) => o.code !== order.code);
    localStorage.setItem(KEY, JSON.stringify([order, ...all].slice(0, 20)));
  } catch {
    /* ignore */
  }
}

/** Status simulado pelo tempo desde o pedido (usado só no mock sem banco). */
export function simulatedStatus(createdAt: number): OrderStatus {
  const min = (Date.now() - createdAt) / 60_000;
  if (min < 2) return "queue";
  if (min < 6) return "production";
  if (min < 12) return "sent";
  return "done";
}
