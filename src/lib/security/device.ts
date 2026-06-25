import "server-only";
import { createHmac } from "node:crypto";
import { getServerEnv } from "@/lib/env";

function secret(): string {
  return (
    getServerEnv().SESSION_SECRET ?? "dev-insecure-secret-change-me-please"
  );
}

/** Fingerprint estável do dispositivo (user-agent + IP), hasheado. */
export function deviceHash(userAgent: string, ip: string): string {
  return createHmac("sha256", secret())
    .update(`${userAgent}|${ip}`)
    .digest("hex");
}

/**
 * Geo grosseira a partir do IP (prefixo). Placeholder — em produção, plugar um
 * provedor de GeoIP (GEOIP_PROVIDER) para país/região reais. Ver ARCHITECTURE §9.1.
 */
export function coarseGeo(ip: string): string {
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.x.x`;
  return ip.slice(0, 8);
}
