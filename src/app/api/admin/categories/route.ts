import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/guard";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { audit } from "@/lib/admin/audit";
import { isDemoMode, demoNoop } from "@/lib/admin/demo"; // ⚠️ DEMO — remover em produção

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1).max(60),
  icon: z.string().trim().max(40).optional().default("UtensilsCrossed"),
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
    .from("categories")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Falha ao criar" }, { status: 400 });
  }
  await audit(
    a.session.email,
    "category.create",
    "category",
    data.id,
    parsed.data,
  );
  return NextResponse.json({ id: data.id });
}
