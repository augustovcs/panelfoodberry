import { z } from "zod";

/**
 * Validação centralizada de variáveis de ambiente (fail-fast no boot).
 * Ver ARCHITECTURE §14. Segredos de servidor NUNCA usam o prefixo NEXT_PUBLIC_.
 *
 * Este módulo é client-safe (só schema/valores públicos). As envs de servidor
 * ficam em `env.server.ts` (`import "server-only"`) para não vazarem nem o NOME
 * delas para o bundle do browser.
 */

// ── Públicas (expostas ao browser) ──
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  // Só preencher quando o admin tiver subdomínio próprio (ex.: Hostinger).
  // Vazio = admin no mesmo domínio, em /login (caso da Vercel).
  NEXT_PUBLIC_ADMIN_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

export function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  source: Record<string, string | undefined>,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    console.error(
      "❌ Variáveis de ambiente inválidas:",
      result.error.flatten().fieldErrors,
    );
    throw new Error("Configuração de ambiente inválida — ver .env.example");
  }
  return result.data;
}

/**
 * Variáveis públicas (seguras no client e no server). Cada `NEXT_PUBLIC_*` é
 * referenciada explicitamente para que o Next as inline no bundle do browser
 * (acessar `process.env` inteiro no client não funciona).
 */
export const clientEnv = parseEnv(clientSchema, {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
