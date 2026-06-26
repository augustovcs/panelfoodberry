import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";

/**
 * Middleware: rate limit global (coarse) + roteamento por subdomínio.
 * - admin.<dominio> serve o painel (raiz → /dashboard).
 * - <dominio> bloqueia rotas de admin (redireciona p/ o subdomínio admin).
 * Em localhost (dev) tudo passa direto. Limites finos por rota ficam nos handlers.
 * Ver ARCHITECTURE.md §4 e §9.2.
 */

const ADMIN_PATHS = ["/login", "/dashboard", "/cozinha", "/cardapio"];

function isAdminPath(path: string): boolean {
  if (path.startsWith("/api/admin")) return true;
  return ADMIN_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const path = req.nextUrl.pathname;

  // ── Rate limit global ──
  const ip =
    req.ip ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "0.0.0.0";
  const isApi = path.startsWith("/api/");
  const rl = rateLimit(`mw:${ip}:${isApi ? "api" : "page"}`, {
    limit: isApi ? 100 : 200,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfter) },
    });
  }

  // ── Roteamento por subdomínio (OPT-IN) ──
  // Por padrão DESLIGADO: o admin fica no mesmo domínio, em /login (caso Vercel).
  // Para usar admin.<dominio> (ex.: Hostinger), defina ADMIN_SUBDOMAIN_ENABLED=1.
  const subdomainEnabled = process.env.ADMIN_SUBDOMAIN_ENABLED === "1";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");

  if (subdomainEnabled && !isLocal && host.includes(".")) {
    const isAdminHost = host.startsWith("admin.");

    if (isAdminHost && path === "/") {
      return NextResponse.rewrite(new URL("/dashboard", req.url));
    }
    if (!isAdminHost && isAdminPath(path) && !isApi) {
      const url = req.nextUrl.clone();
      url.host = "admin." + host;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Aplica a tudo exceto assets estáticos do Next.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
