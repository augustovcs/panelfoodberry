import { NextResponse } from "next/server";
import { getOrderByCode } from "@/lib/orders/lookup";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { code: string } },
) {
  const ip = clientIp(req);
  const rl = rateLimit(`track:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const view = await getOrderByCode(params.code.toUpperCase());
  if (!view) {
    return NextResponse.json(
      { error: "Pedido não encontrado" },
      { status: 404 },
    );
  }
  return NextResponse.json(view);
}
