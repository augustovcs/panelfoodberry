import { z } from "zod";

export const couponCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, "Cupom muito curto")
  .max(24)
  .regex(/^[A-Z0-9]+$/, "Cupom contém caracteres inválidos");

export type CouponCode = z.infer<typeof couponCodeSchema>;
