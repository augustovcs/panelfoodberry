import "server-only";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { ordersPersistenceEnabled } from "./persist";
import type { OrderItemSnapshot, OrderStatus, DeliveryType } from "@/lib/types";

export interface OrderStatusView {
  code: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  customerName: string;
  createdAt: string;
}

/**
 * Busca um pedido pelo `code` (capability token). Usa a service_role no servidor
 * — o `code` funciona como senha do pedido. Retorna `null` se não houver banco.
 */
export async function getOrderByCode(
  code: string,
): Promise<OrderStatusView | null> {
  if (!ordersPersistenceEnabled()) return null;
  const db = createAdminSupabase();

  const { data } = await db
    .from("orders")
    .select(
      "code,status,delivery_type,items,subtotal,delivery_fee,discount,total,customer_name,created_at",
    )
    .eq("code", code)
    .maybeSingle();

  if (!data) return null;
  return {
    code: data.code,
    status: data.status,
    deliveryType: data.delivery_type,
    items: data.items,
    subtotal: Number(data.subtotal),
    deliveryFee: Number(data.delivery_fee),
    discount: Number(data.discount),
    total: Number(data.total),
    customerName: data.customer_name,
    createdAt: data.created_at,
  };
}
