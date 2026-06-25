import { LRUCache } from "lru-cache";

/**
 * Rate limit em memória (token bucket) — suficiente para a instância única na
 * Hostinger. Para múltiplas instâncias, trocar por Upstash (RATE_LIMIT_REDIS_URL).
 * Ver ARCHITECTURE.md §9.2.
 */
interface Bucket {
  tokens: number;
  updated: number;
}

const store = new LRUCache<string, Bucket>({
  max: 10_000,
  ttl: 1000 * 60 * 15,
});

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // segundos
}

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const ratePerMs = opts.limit / opts.windowMs;
  const b = store.get(key) ?? { tokens: opts.limit, updated: now };

  b.tokens = Math.min(opts.limit, b.tokens + (now - b.updated) * ratePerMs);
  b.updated = now;

  if (b.tokens < 1) {
    store.set(key, b);
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((1 - b.tokens) / ratePerMs / 1000)),
    };
  }

  b.tokens -= 1;
  store.set(key, b);
  return { ok: true, remaining: Math.floor(b.tokens), retryAfter: 0 };
}

/** Primeiro IP confiável da cadeia de proxies. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}
