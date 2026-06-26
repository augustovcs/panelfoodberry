import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/guard";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { audit } from "@/lib/admin/audit";
import { isDemoMode, demoNoop } from "@/lib/admin/demo"; // ⚠️ DEMO — remover em produção

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const a = await assertAdmin();
  if ("response" in a) return a.response;
  if (isDemoMode()) return demoNoop(); // ⚠️ DEMO — remover em produção

  const db = createAdminSupabase();
  const { error } = await db.from("options").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "Falha" }, { status: 400 });
  await audit(a.session.email, "option.delete", "option", params.id);
  return NextResponse.json({ ok: true });
}
