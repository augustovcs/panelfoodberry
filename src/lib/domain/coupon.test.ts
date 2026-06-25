import { describe, it, expect } from "vitest";
import { applyCoupon, computeOrderPricing } from "./coupon";

describe("applyCoupon", () => {
  it("percentual", () => {
    expect(applyCoupon({ kind: "percent", value: 10 }, 100)).toEqual({
      discount: 10,
      freeDelivery: false,
    });
  });
  it("fixo nunca passa do subtotal", () => {
    expect(applyCoupon({ kind: "fixed", value: 50 }, 30)).toEqual({
      discount: 30,
      freeDelivery: false,
    });
  });
  it("frete grátis sinaliza freeDelivery", () => {
    expect(applyCoupon({ kind: "free_delivery", value: 0 }, 80)).toEqual({
      discount: 0,
      freeDelivery: true,
    });
  });
  it("ignora cupom abaixo do mínimo", () => {
    expect(
      applyCoupon({ kind: "percent", value: 10, minOrder: 50 }, 40),
    ).toEqual({ discount: 0, freeDelivery: false });
  });
});

describe("computeOrderPricing", () => {
  it("soma frete e desconto", () => {
    expect(
      computeOrderPricing({
        subtotal: 100,
        deliveryFee: 6.9,
        coupon: { kind: "percent", value: 10 },
      }),
    ).toEqual({ subtotal: 100, deliveryFee: 6.9, discount: 10, total: 96.9 });
  });
  it("frete grátis zera a taxa", () => {
    expect(
      computeOrderPricing({
        subtotal: 80,
        deliveryFee: 6.9,
        coupon: { kind: "free_delivery", value: 0 },
      }),
    ).toEqual({ subtotal: 80, deliveryFee: 0, discount: 0, total: 80 });
  });
  it("total nunca é negativo", () => {
    expect(
      computeOrderPricing({
        subtotal: 10,
        deliveryFee: 0,
        coupon: { kind: "fixed", value: 10 },
      }).total,
    ).toBe(0);
  });
});
