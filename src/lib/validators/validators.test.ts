import { describe, it, expect } from "vitest";
import { toE164BR, phoneSchema, cepSchema } from "./common";
import { createOrderSchema } from "./order";
import { formatAddress } from "./address";

describe("toE164BR", () => {
  it("adiciona DDI 55 a celular de 11 dígitos", () => {
    expect(toE164BR("(11) 99999-8888")).toBe("5511999998888");
  });
  it("mantém número já com 55", () => {
    expect(toE164BR("5511999998888")).toBe("5511999998888");
  });
  it("rejeita número curto", () => {
    expect(toE164BR("99999")).toBeNull();
  });
});

describe("phoneSchema / cepSchema", () => {
  it("normaliza telefone", () => {
    expect(phoneSchema.parse(" 11 99999-8888 ")).toBe("5511999998888");
  });
  it("rejeita telefone inválido", () => {
    expect(phoneSchema.safeParse("123").success).toBe(false);
  });
  it("normaliza CEP para dígitos", () => {
    expect(cepSchema.parse("01310-100")).toBe("01310100");
  });
});

describe("createOrderSchema", () => {
  const base = {
    customerName: "João",
    customerPhone: "11999998888",
    paymentMethod: "pix_entrega" as const,
    items: [{ itemId: "smash-classico", quantity: 1 }],
  };

  it("aceita retirada sem endereço", () => {
    const r = createOrderSchema.safeParse({ ...base, deliveryType: "pickup" });
    expect(r.success).toBe(true);
  });
  it("exige endereço quando entrega", () => {
    const r = createOrderSchema.safeParse({
      ...base,
      deliveryType: "delivery",
    });
    expect(r.success).toBe(false);
  });
  it("aplica defaults (notes, optionIds)", () => {
    const r = createOrderSchema.parse({ ...base, deliveryType: "pickup" });
    expect(r.items[0]!.optionIds).toEqual([]);
    expect(r.notes).toBe("");
  });
});

describe("formatAddress", () => {
  it("formata em uma linha", () => {
    expect(
      formatAddress({
        street: "Rua Augusta",
        number: "1402",
        complement: "Ap 5",
        neighborhood: "Consolação",
        city: "São Paulo",
      }),
    ).toBe("Rua Augusta, 1402 - Ap 5 — Consolação, São Paulo");
  });
});
