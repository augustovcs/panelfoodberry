import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/guard";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { audit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  price: z.number().nonnegative().max(100000),
  description: z.string().trim().max(500).optional().default(""),
});

export async function POST(req: Request) {
  const a = await assertAdmin();
  if ("response" in a) return a.response;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
  }
  const { categoryId, name, price, description } = parsed.data;

  const db = createAdminSupabase();
  const { data, error } = await db
    .from("items")
    .insert({
      category_id: categoryId,
      name,
      price,
      description,
      gradient: "linear-gradient(135deg,#d97706,#92400e)",
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Falha ao criar" }, { status: 400 });
  }
  await audit(a.session.email, "item.create", "item", data.id, { name });
  return NextResponse.json({ id: data.id });
}
