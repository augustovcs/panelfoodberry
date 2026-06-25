import { describe, it, expect } from "vitest";
import { round2, lineUnitPrice, lineTotal, cartSubtotal } from "./money";

describe("round2", () => {
  it("arredonda a 2 casas sem erro de ponto flutuante", () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(29.905)).toBe(29.91);
  });
});

describe("lineUnitPrice / lineTotal", () => {
  it("soma opções ao preço base", () => {
    expect(lineUnitPrice(29.9, [{ price: 5 }, { price: 3 }])).toBe(37.9);
  });
  it("multiplica pela quantidade", () => {
    expect(lineTotal(29.9, [{ price: 5 }], 2)).toBe(69.8);
  });
});

describe("cartSubtotal", () => {
  it("soma todas as linhas", () => {
    const subtotal = cartSubtotal([
      { basePrice: 29.9, options: [{ price: 5 }], quantity: 2 }, // 69.80
      { basePrice: 6.9, options: [], quantity: 2 }, // 13.80
    ]);
    expect(subtotal).toBe(83.6);
  });
});
