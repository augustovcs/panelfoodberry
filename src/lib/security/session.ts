import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env";

const COOKIE = "ab_admin_2fa";
const TTL_MS = 8 * 60 * 60 * 1000; // 8h

function secret(): string {
  return (
    getServerEnv().SESSION_SECRET ?? "dev-insecure-secret-change-me-please"
  );
}

/** Assina `valor.assinatura` com HMAC-SHA256. */
export function signValue(value: string): string {
  const sig = createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${sig}`;
}

export function verifySigned(signed: string): string | null {
  const i = signed.lastIndexOf(".");
  if (i < 0) return null;
  const value = signed.slice(0, i);
  const sig = Buffer.from(signed.slice(i + 1));
  const expected = Buffer.from(
    createHmac("sha256", secret()).update(value).digest("hex"),
  );
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected))
    return null;
  return value;
}

/** Marca este dispositivo como 2FA-aprovado (cookie httpOnly assinado, 8h). */
export function setAdmin2faCookie(userId: string): void {
  const payload = `${userId}:${Date.now() + TTL_MS}`;
  cookies().set(COOKIE, signValue(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export function readAdmin2fa(): { userId: string } | null {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  const value = verifySigned(raw);
  if (!value) return null;
  const [userId, expStr] = value.split(":");
  if (!userId || !expStr || Date.now() > Number(expStr)) return null;
  return { userId };
}

export function clearAdmin2fa(): void {
  cookies().delete(COOKIE);
}
