import { NextResponse } from "next/server";
import { z } from "zod";
import { couponCodeSchema } from "@/lib/validators/coupon";
import { resolveCoupon } from "@/lib/orders/coupon-service";
import { computeOrderPricing } from "@/lib/domain/coupon";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  code: couponCodeSchema,
  subtotal: z.number().nonnegative().max(100000),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`coupon:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: "Cupom inválido" });
  }

  const { code, subtotal } = parsed.data;
  const rule = await resolveCoupon(code, subtotal);
  if (!rule) return NextResponse.json({ valid: false });

  const { discount } = computeOrderPricing({
    subtotal,
    deliveryFee: 0,
    coupon: rule,
  });

  return NextResponse.json({
    valid: true,
    code,
    kind: rule.kind,
    discount,
    freeDelivery: rule.kind === "free_delivery",
  });
}
