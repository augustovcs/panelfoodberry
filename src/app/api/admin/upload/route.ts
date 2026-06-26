import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/guard";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { audit } from "@/lib/admin/audit";
import { isDemoMode } from "@/lib/admin/demo"; // ⚠️ DEMO — remover em produção

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const a = await assertAdmin();
  if ("response" in a) return a.response;
  // ⚠️ DEMO — remover em produção: sem Storage, devolve sem alterar.
  if (isDemoMode()) {
    return NextResponse.json({ url: null, demo: true });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const itemId = form?.get("itemId");
  if (!(file instanceof File) || typeof itemId !== "string") {
    return NextResponse.json({ error: "Arquivo ausente" }, { status: 422 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Use JPG, PNG ou WebP" },
      { status: 422 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Imagem acima de 5 MB" },
      { status: 422 },
    );
  }

  const db = createAdminSupabase();
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const path = `items/${itemId}-${Date.now()}.${ext}`;

  const { error: upErr } = await db.storage
    .from("menu")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) {
    return NextResponse.json({ error: "Falha no upload" }, { status: 400 });
  }

  const {
    data: { publicUrl },
  } = db.storage.from("menu").getPublicUrl(path);

  await db.from("items").update({ image_url: publicUrl }).eq("id", itemId);
  await audit(a.session.email, "item.photo", "item", itemId, { path });
  return NextResponse.json({ url: publicUrl });
}
