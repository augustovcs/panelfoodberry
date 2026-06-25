import { z } from "zod";
import { cepSchema } from "./common";

export const addressSchema = z.object({
  cep: cepSchema.optional(),
  street: z.string().trim().min(2, "Informe a rua").max(120),
  number: z.string().trim().min(1, "Informe o número").max(12),
  complement: z.string().trim().max(60).optional().default(""),
  neighborhood: z.string().trim().min(2, "Informe o bairro").max(80),
  city: z.string().trim().min(2, "Informe a cidade").max(80),
});

export type AddressInput = z.infer<typeof addressSchema>;

/** Endereço formatado em uma linha (para snapshot/WhatsApp). */
export function formatAddress(a: AddressInput): string {
  const head = `${a.street}, ${a.number}${a.complement ? " - " + a.complement : ""}`;
  return `${head} — ${a.neighborhood}, ${a.city}`;
}
