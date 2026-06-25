import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/guard";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { audit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["queue", "production", "sent", "done", "cancelled"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: { code: string } },
) {
  const a = await assertAdmin();
  if ("response" in a) return a.response;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Status inválido" }, { status: 422 });
  }

  const db = createAdminSupabase();
  const { error } = await db
    .from("orders")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("code", params.code.toUpperCase());

  if (error) return NextResponse.json({ error: "Falha" }, { status: 400 });

  await audit(a.session.email, "order.status", "order", params.code, {
    status: parsed.data.status,
  });
  return NextResponse.json({ ok: true });
}
