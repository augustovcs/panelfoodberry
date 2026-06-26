import "server-only";
import { z } from "zod";
import { parseEnv } from "./env";

/**
 * Variáveis de ambiente de SERVIDOR. Isolado num módulo `server-only` para que
 * nem o schema (nomes dos segredos) chegue ao bundle do browser. Ver §9.5.
 */
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

export function getServerEnv() {
  return parseEnv(serverSchema, process.env);
}
