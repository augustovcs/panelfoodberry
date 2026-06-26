import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { adminConfigured } from "@/lib/admin/session";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";
import { deviceHash, coarseGeo } from "@/lib/security/device";
import { generateOtp, hashOtp } from "@/lib/security/otp";
import { setAdmin2faCookie } from "@/lib/security/session";
import { sendOtpEmail } from "@/lib/security/email";
import { getServerEnv } from "@/lib/env";
// ⚠️ DEMO — remover em produção
import { isDemoMode, DEMO_USER, DEMO_PASSWORD } from "@/lib/admin/demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

const TRUST_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um momento." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  // ⚠️ DEMO — remover em produção: login fictício sem Supabase nem 2FA.
  if (isDemoMode()) {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
    }
    if (parsed.data.password !== DEMO_PASSWORD) {
      return NextResponse.json(
        { error: "Senha demo incorreta (demo1234)." },
        { status: 401 },
      );
    }
    setAdmin2faCookie(DEMO_USER.userId);
    return NextResponse.json({ step: "done", demo: true });
  }

  const supabase = createServerSupabase();
  if (!supabase || !adminConfigured()) {
    return NextResponse.json(
      { error: "Autenticação não configurada (Supabase ausente)." },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
  }
  const { email, password } = parsed.data;
  const admin = createAdminSupabase();

  const { data: auth, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  await admin
    .from("admin_login_attempts")
    .insert({ email, ip, success: !error && !!auth?.user });

  if (error || !auth.user) {
    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  }

  const user = auth.user;
  const ua = req.headers.get("user-agent") ?? "";
  const dh = deviceHash(ua, ip);
  const geo = coarseGeo(ip);

  const { data: device } = await admin
    .from("admin_trusted_devices")
    .select("last_seen")
    .eq("user_id", user.id)
    .eq("device_hash", dh)
    .maybeSingle();

  const trusted =
    device &&
    Date.now() - new Date(device.last_seen).getTime() < TRUST_WINDOW_MS;

  if (trusted) {
    await admin
      .from("admin_trusted_devices")
      .update({ last_seen: new Date().toISOString(), last_ip: ip, geo })
      .eq("user_id", user.id)
      .eq("device_hash", dh);
    setAdmin2faCookie(user.id);
    return NextResponse.json({ step: "done" });
  }

  // Dispositivo/geo novo (ou 1º acesso) → exige OTP por e-mail.
  const code = generateOtp();
  const pepper = getServerEnv().OTP_PEPPER ?? "dev-pepper-change-me";
  await admin
    .from("admin_login_codes")
    .delete()
    .eq("user_id", user.id)
    .is("consumed_at", null);
  await admin.from("admin_login_codes").insert({
    user_id: user.id,
    code_hash: hashOtp(code, pepper),
    expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
  });
  await sendOtpEmail(email, code).catch((e) =>
    console.error("[auth] envio de OTP falhou:", e),
  );

  return NextResponse.json({ step: "otp" });
}
