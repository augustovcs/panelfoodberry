import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/guard";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { audit } from "@/lib/admin/audit";
import { isDemoMode, demoNoop } from "@/lib/admin/demo"; // ⚠️ DEMO — remover em produção

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ active: z.boolean() });

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const a = await assertAdmin();
  if ("response" in a) return a.response;
  if (isDemoMode()) return demoNoop(); // ⚠️ DEMO — remover em produção

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
  }

  const db = createAdminSupabase();
  const { error } = await db
    .from("coupons")
    .update({ active: parsed.data.active })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: "Falha" }, { status: 400 });

  await audit(
    a.session.email,
    "coupon.toggle",
    "coupon",
    params.id,
    parsed.data,
  );
  return NextResponse.json({ ok: true });
}
