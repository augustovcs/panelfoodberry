import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validators/order";
import { getMenu } from "@/lib/menu/repository";
import { buildOrderDraft } from "@/lib/orders/build";
import { resolveCoupon } from "@/lib/orders/coupon-service";
import { persistOrder, ordersPersistenceEnabled } from "@/lib/orders/persist";
import { buildOrderMessage, buildWhatsappLink } from "@/lib/whatsapp";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`orders:${ip}`, { limit: 8, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const input = parsed.data;
  const menu = await getMenu();

  try {
    // 1ª passada para obter o subtotal e então validar o cupom no servidor.
    const probe = buildOrderDraft(input, menu, null);
    const couponRule = input.couponCode
      ? await resolveCoupon(input.couponCode, probe.subtotal)
      : null;

    const draft = buildOrderDraft(input, menu, couponRule);

    // Persistência best-effort — não bloqueia o handoff por WhatsApp.
    await persistOrder(draft).catch((e) =>
      console.error("[orders] persist falhou:", e),
    );

    const message = buildOrderMessage({
      code: draft.code,
      customerName: draft.customerName,
      items: draft.items,
      deliveryType: draft.deliveryType,
      address: draft.addressLine,
      paymentMethod: draft.paymentMethod,
      changeFor: draft.changeFor,
      subtotal: draft.subtotal,
      deliveryFee: draft.deliveryFee,
      discount: draft.discount,
      total: draft.total,
      notes: draft.notes,
    });

    return NextResponse.json({
      code: draft.code,
      total: draft.total,
      whatsappUrl: buildWhatsappLink(menu.restaurant.whatsapp, message),
      persisted: ordersPersistenceEnabled(),
    });
  } catch (e) {
    console.error("[orders] erro:", e);
    return NextResponse.json(
      { error: "Não foi possível processar o pedido." },
      { status: 400 },
    );
  }
}
