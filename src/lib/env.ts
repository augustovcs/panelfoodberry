import { z } from "zod";

/**
 * Validação centralizada de variáveis de ambiente (fail-fast no boot).
 * Ver ARCHITECTURE §14. Segredos de servidor NUNCA usam o prefixo NEXT_PUBLIC_.
 *
 * Na Fase 0 as integrações ainda não existem, então os campos de Supabase/OTP
 * são opcionais. Eles passam a `min(1)`/obrigatórios nas Fases 1 e 5.
 */

// ── Públicas (expostas ao browser) ──
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_ADMIN_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

// ── Servidor (nunca enviadas ao browser) ──
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(16).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  OTP_PEPPER: z.string().min(8).optional(),
  WHATSAPP_PHONE: z
    .string()
    .regex(/^\d{10,15}$/, "E.164 sem '+', ex: 5511999999999")
    .optional(),
  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
});

function parse<T extends z.ZodTypeAny>(
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
export const clientEnv = parse(clientSchema, {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

/**
 * Variáveis de servidor. Só pode ser importado em código server-side.
 * O guard abaixo evita vazamento acidental para o bundle do browser.
 */
export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() não pode ser chamado no client");
  }
  return parse(serverSchema, process.env);
}
