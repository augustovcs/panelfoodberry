import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { adminConfigured } from "@/lib/admin/session";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";
import { deviceHash, coarseGeo } from "@/lib/security/device";
import { verifyOtp } from "@/lib/security/otp";
import { setAdmin2faCookie } from "@/lib/security/session";
import { getServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ code: z.string().regex(/^\d{6}$/) });

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`otp:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const supabase = createServerSupabase();
  if (!supabase || !adminConfigured()) {
    return NextResponse.json({ error: "Não configurado" }, { status: 503 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Código inválido" }, { status: 422 });
  }

  const { data: u } = await supabase.auth.getUser();
  if (!u.user) {
    return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });
  }

  const admin = createAdminSupabase();
  const { data: rec } = await admin
    .from("admin_login_codes")
    .select("id, code_hash, attempts")
    .eq("user_id", u.user.id)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!rec || rec.attempts >= 5) {
    return NextResponse.json(
      { error: "Código expirado. Faça login novamente." },
      { status: 401 },
    );
  }

  const pepper = getServerEnv().OTP_PEPPER ?? "dev-pepper-change-me";
  if (!verifyOtp(parsed.data.code, rec.code_hash, pepper)) {
    await admin
      .from("admin_login_codes")
      .update({ attempts: rec.attempts + 1 })
      .eq("id", rec.id);
    return NextResponse.json({ error: "Código incorreto." }, { status: 401 });
  }

  await admin
    .from("admin_login_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", rec.id);

  const dh = deviceHash(req.headers.get("user-agent") ?? "", ip);
  await admin.from("admin_trusted_devices").upsert(
    {
      user_id: u.user.id,
      device_hash: dh,
      last_ip: ip,
      geo: coarseGeo(ip),
      trusted_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    },
    { onConflict: "user_id,device_hash" },
  );

  setAdmin2faCookie(u.user.id);
  return NextResponse.json({ step: "done" });
}
