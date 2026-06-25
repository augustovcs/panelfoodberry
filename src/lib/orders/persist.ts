import "server-only";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { clientEnv } from "@/lib/env";
import type { OrderDraft } from "./build";

/** Persistência só está disponível com Supabase + service_role configurados. */
export function ordersPersistenceEnabled(): boolean {
  return (
    !!clientEnv.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Grava o pedido (best-effort): upsert do cliente por telefone, insert do pedido
 * (snapshot jsonb) e débito atômico do cupom. Nunca derruba o checkout — o
 * handoff por WhatsApp é o caminho primário.
 */
export async function persistOrder(draft: OrderDraft): Promise<void> {
  if (!ordersPersistenceEnabled()) return;
  const db = createAdminSupabase();

  const { data: customer } = await db
    .from("customers")
    .upsert(
      {
        name: draft.customerName,
        phone: draft.customerPhone,
        last_order_at: new Date().toISOString(),
      },
      { onConflict: "phone" },
    )
    .select("id")
    .single();

  await db.from("orders").insert({
    code: draft.code,
    customer_id: customer?.id ?? null,
    customer_name: draft.customerName,
    customer_phone: draft.customerPhone,
    delivery_type: draft.deliveryType,
    address: draft.address ?? null,
    payment_method: draft.paymentMethod,
    change_for: draft.changeFor ?? null,
    items: draft.items,
    subtotal: draft.subtotal,
    delivery_fee: draft.deliveryFee,
    discount: draft.discount,
    coupon_code: draft.couponCode ?? null,
    total: draft.total,
    notes: draft.notes,
    status: "queue",
  });

  if (draft.couponCode) {
    await db.rpc("increment_coupon_use", { p_code: draft.couponCode });
  }
}
