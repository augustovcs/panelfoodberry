import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/guard";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { audit } from "@/lib/admin/audit";
import { isDemoMode, demoNoop } from "@/lib/admin/demo"; // ⚠️ DEMO — remover em produção

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  price: z.number().nonnegative().max(100000),
  oldPrice: z.number().nonnegative().max(100000).nullable().optional(),
  componentIds: z.array(z.string().uuid()).min(1).max(20),
});

export async function POST(req: Request) {
  const a = await assertAdmin();
  if ("response" in a) return a.response;
  if (isDemoMode()) return demoNoop(); // ⚠️ DEMO — remover em produção

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
  }
  const { categoryId, name, price, oldPrice, componentIds } = parsed.data;

  const db = createAdminSupabase();
  const { data: combo, error } = await db
    .from("items")
    .insert({
      category_id: categoryId,
      name,
      price,
      old_price: oldPrice ?? null,
      type: "combo",
      gradient: "linear-gradient(135deg,#ea580c,#9a3412)",
    })
    .select("id")
    .single();

  if (error || !combo) {
    return NextResponse.json(
      { error: "Falha ao criar combo" },
      { status: 400 },
    );
  }

  const { error: linkErr } = await db
    .from("combo_items")
    .insert(
      componentIds.map((id) => ({
        combo_id: combo.id,
        component_id: id,
        qty: 1,
      })),
    );
  if (linkErr) {
    return NextResponse.json(
      { error: "Falha ao vincular itens" },
      { status: 400 },
    );
  }

  await audit(a.session.email, "combo.create", "item", combo.id, { name });
  return NextResponse.json({ id: combo.id });
}
