import { z } from "zod";

export function digitsOnly(v: string): string {
  return v.replace(/\D/g, "");
}

/**
 * Normaliza telefone brasileiro para E.164 sem '+': `5511999998888`.
 * Aceita com/sem DDI 55, com 10 (fixo) ou 11 (celular) dígitos. `null` se inválido.
 */
export function toE164BR(input: string): string | null {
  const d = digitsOnly(input);
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) return d;
  if (d.length === 10 || d.length === 11) return "55" + d;
  return null;
}

export const phoneSchema = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const e164 = toE164BR(v);
    if (!e164) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Telefone inválido",
      });
      return z.NEVER;
    }
    return e164;
  });

export const cepSchema = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const d = digitsOnly(v);
    if (d.length !== 8) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CEP inválido" });
      return z.NEVER;
    }
    return d;
  });

export const nameSchema = z.string().trim().min(2, "Nome muito curto").max(80);
