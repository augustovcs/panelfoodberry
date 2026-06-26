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
  required: z.boolean().optional().default(false),
  min_select: z.number().int().min(0).max(20).optional().default(0),
  max_select: z.number().int().min(1).max(20).optional().default(1),
});

export async function POST(
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
  const { data, error } = await db
    .from("option_groups")
    .insert({ item_id: params.id, ...parsed.data })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Falha ao criar" }, { status: 400 });
  }
  await audit(
    a.session.email,
    "optiongroup.create",
    "item",
    params.id,
    parsed.data,
  );
  return NextResponse.json({ id: data.id });
}
