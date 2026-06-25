import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/guard";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { audit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  price: z.number().nonnegative().max(100000).optional(),
  old_price: z.number().nonnegative().max(100000).nullable().optional(),
  badge: z.string().trim().max(30).nullable().optional(),
  description: z.string().trim().max(500).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const a = await assertAdmin();
  if ("response" in a) return a.response;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 422 });
  }

  const db = createAdminSupabase();
  const { error } = await db
    .from("items")
    .update(parsed.data)
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: "Falha" }, { status: 400 });

  await audit(a.session.email, "item.update", "item", params.id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const a = await assertAdmin();
  if ("response" in a) return a.response;

  const db = createAdminSupabase();
  const { error } = await db.from("items").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "Falha" }, { status: 400 });

  await audit(a.session.email, "item.delete", "item", params.id);
  return NextResponse.json({ ok: true });
}
