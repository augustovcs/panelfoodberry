import { z } from "zod";
import { nameSchema, phoneSchema } from "./common";
import { addressSchema } from "./address";
import { couponCodeSchema } from "./coupon";

/**
 * Linha enviada pelo cliente no checkout. O servidor NUNCA confia no preço:
 * recalcula tudo a partir do cardápio (ver ARCHITECTURE.md §9.4). Por isso só
 * trafegam `itemId`, opções escolhidas, quantidade e observação.
 */
export const orderItemInputSchema = z.object({
  itemId: z.string().min(1),
  optionIds: z.array(z.string().min(1)).max(20).default([]),
  quantity: z.number().int().min(1).max(50),
  notes: z.string().trim().max(200).default(""),
});

export const createOrderSchema = z
  .object({
    customerName: nameSchema,
    customerPhone: phoneSchema,
    deliveryType: z.enum(["delivery", "pickup"]),
    address: addressSchema.optional(),
    paymentMethod: z.enum(["pix_entrega", "dinheiro", "cartao_maquina"]),
    changeFor: z.number().nonnegative().max(100000).optional(),
    couponCode: couponCodeSchema.optional(),
    notes: z.string().trim().max(300).default(""),
    items: z.array(orderItemInputSchema).min(1, "Carrinho vazio").max(60),
  })
  .refine((d) => d.deliveryType !== "delivery" || !!d.address, {
    message: "Endereço é obrigatório para entrega",
    path: ["address"],
  });

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
