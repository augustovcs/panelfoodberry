import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/guard";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { couponCodeSchema } from "@/lib/validators/coupon";
import { audit } from "@/lib/admin/audit";
import { isDemoMode, demoNoop } from "@/lib/admin/demo"; // ⚠️ DEMO — remover em produção

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  code: couponCodeSchema,
  kind: z.enum(["percent", "fixed", "free_delivery"]),
  value: z.number().nonnegative().max(100000).default(0),
  min_order: z.number().nonnegative().max(100000).default(0),
});

export async function POST(req: Request) {
  const a = await assertAdmin();
  if ("response" in a) return a.response;
  if (isDemoMode()) return demoNoop(); // ⚠️ DEMO — remover em produção

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
  }

  const db = createAdminSupabase();
  const { data, error } = await db
    .from("coupons")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Falha ao criar (código já existe?)" },
      { status: 400 },
    );
  }
  await audit(a.session.email, "coupon.create", "coupon", data.id, {
    code: parsed.data.code,
  });
  return NextResponse.json({ id: data.id });
}
