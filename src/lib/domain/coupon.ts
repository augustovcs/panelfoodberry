import type { CouponKind } from "@/lib/types";
import { round2 } from "./money";

export interface CouponRule {
  kind: CouponKind;
  value: number;
  minOrder?: number;
}

export interface CouponApplication {
  discount: number;
  freeDelivery: boolean;
}

/**
 * Calcula o efeito de um cupom sobre o subtotal. Não aplica nada se o subtotal
 * for menor que `minOrder`. `free_delivery` não gera desconto direto — sinaliza
 * `freeDelivery` para a taxa ser zerada em `computeOrderPricing`.
 */
export function applyCoupon(
  rule: CouponRule,
  subtotal: number,
): CouponApplication {
  if (rule.minOrder && subtotal < rule.minOrder) {
    return { discount: 0, freeDelivery: false };
  }
  switch (rule.kind) {
    case "percent":
      return {
        discount: round2((subtotal * rule.value) / 100),
        freeDelivery: false,
      };
    case "fixed":
      return {
        discount: round2(Math.min(rule.value, subtotal)),
        freeDelivery: false,
      };
    case "free_delivery":
      return { discount: 0, freeDelivery: true };
  }
}

export interface OrderPricingInput {
  subtotal: number;
  /** Taxa base da modalidade escolhida (0 para retirada). */
  deliveryFee: number;
  coupon?: CouponRule | null;
}

export interface OrderPricing {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

/** Junta subtotal + frete + cupom no total final (nunca negativo). */
export function computeOrderPricing({
  subtotal,
  deliveryFee,
  coupon,
}: OrderPricingInput): OrderPricing {
  let discount = 0;
  let fee = deliveryFee;

  if (coupon) {
    const app = applyCoupon(coupon, subtotal);
    discount = app.discount;
    if (app.freeDelivery) fee = 0;
  }

  const total = round2(Math.max(0, subtotal + fee - discount));
  return {
    subtotal: round2(subtotal),
    deliveryFee: round2(fee),
    discount: round2(discount),
    total,
  };
}
