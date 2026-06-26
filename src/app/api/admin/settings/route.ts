import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/guard";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { audit } from "@/lib/admin/audit";
import { isDemoMode, demoNoop } from "@/lib/admin/demo"; // ⚠️ DEMO — remover em produção

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  is_open: z.boolean().optional(),
  delivery_fee: z.number().nonnegative().max(1000).optional(),
  min_order: z.number().nonnegative().max(10000).optional(),
  delivery_time: z.string().trim().max(40).optional(),
  phone_whatsapp: z
    .string()
    .regex(/^\d{10,15}$/)
    .optional(),
});

export async function PATCH(req: Request) {
  const a = await assertAdmin();
  if ("response" in a) return a.response;
  if (isDemoMode()) return demoNoop(); // ⚠️ DEMO — remover em produção

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
  }

  const db = createAdminSupabase();
  const { error } = await db
    .from("business_settings")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) return NextResponse.json({ error: "Falha" }, { status: 400 });

  await audit(
    a.session.email,
    "settings.update",
    "business_settings",
    "1",
    parsed.data,
  );
  return NextResponse.json({ ok: true });
}
