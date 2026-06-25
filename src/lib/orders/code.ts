import { customAlphabet } from "nanoid";

// Alfabeto sem caracteres ambíguos (0/O, 1/I) — código curto e legível no WhatsApp.
const nano = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);

export function generateOrderCode(): string {
  return nano();
}
