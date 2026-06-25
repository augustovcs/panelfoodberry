import { describe, it, expect } from "vitest";
import { fixtureMenu } from "@/lib/menu/fixtures";
import { buildOrderDraft } from "./build";
import type { CreateOrderInput } from "@/lib/validators/order";

const base: CreateOrderInput = {
  customerName: "João",
  customerPhone: "5511999998888",
  deliveryType: "pickup",
  paymentMethod: "pix_entrega",
  notes: "",
  items: [
    { itemId: "smash-classico", optionIds: ["bacon"], quantity: 2, notes: "" },
  ],
};

describe("buildOrderDraft", () => {
  it("recalcula preço a partir do cardápio (ignora o cliente)", () => {
    const draft = buildOrderDraft(base, fixtureMenu, null);
    // 29.90 (menu) + 5.00 (bacon) = 34.90 × 2 = 69.80
    expect(draft.items[0]!.unitPrice).toBe(34.9);
    expect(draft.subtotal).toBe(69.8);
    expect(draft.total).toBe(69.8);
    expect(draft.code).toMatch(/^[A-Z0-9]{5}$/);
  });

  it("descarta opções que não pertencem ao item", () => {
    const draft = buildOrderDraft(
      {
        ...base,
        items: [
          {
            itemId: "smash-classico",
            optionIds: ["borda"],
            quantity: 1,
            notes: "",
          },
        ],
      },
      fixtureMenu,
      null,
    );
    expect(draft.items[0]!.options).toHaveLength(0);
    expect(draft.subtotal).toBe(29.9);
  });

  it("aplica cupom percentual", () => {
    const draft = buildOrderDraft(base, fixtureMenu, {
      kind: "percent",
      value: 10,
    });
    expect(draft.discount).toBe(6.98);
    expect(draft.total).toBe(62.82);
  });

  it("soma frete na entrega", () => {
    const draft = buildOrderDraft(
      {
        ...base,
        deliveryType: "delivery",
        address: {
          street: "Rua A",
          number: "1",
          neighborhood: "Centro",
          city: "SP",
          complement: "",
        },
      },
      fixtureMenu,
      null,
    );
    expect(draft.deliveryFee).toBe(6.9);
    expect(draft.total).toBe(76.7);
    expect(draft.addressLine).toContain("Rua A, 1");
  });

  it("rejeita item inexistente", () => {
    expect(() =>
      buildOrderDraft(
        {
          ...base,
          items: [
            { itemId: "nao-existe", optionIds: [], quantity: 1, notes: "" },
          ],
        },
        fixtureMenu,
        null,
      ),
    ).toThrow();
  });
});
