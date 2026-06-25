import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/** Gera um OTP numérico de 6 dígitos. */
export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Hash HMAC-SHA256 do OTP com pepper (nunca guardamos o código em claro). */
export function hashOtp(code: string, pepper: string): string {
  return createHmac("sha256", pepper).update(code).digest("hex");
}

/** Compara código x hash em tempo constante. */
export function verifyOtp(code: string, hash: string, pepper: string): boolean {
  const computed = Buffer.from(hashOtp(code, pepper));
  const expected = Buffer.from(hash);
  return (
    computed.length === expected.length && timingSafeEqual(computed, expected)
  );
}
