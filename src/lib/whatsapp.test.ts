import { describe, it, expect } from "vitest";
import {
  buildOrderMessage,
  buildWhatsappLink,
  type WhatsappOrder,
} from "./whatsapp";

const order: WhatsappOrder = {
  code: "A7K2P",
  customerName: "João",
  items: [
    {
      name: "Smash Clássico",
      qty: 2,
      unitPrice: 34.9,
      options: [{ name: "Bacon crocante", price: 5 }],
      notes: "Sem cebola",
      lineTotal: 69.8,
    },
  ],
  deliveryType: "delivery",
  address: "Rua Augusta, 1402 — Consolação, São Paulo",
  paymentMethod: "dinheiro",
  changeFor: 100,
  subtotal: 69.8,
  deliveryFee: 6.9,
  discount: 0,
  total: 76.7,
};

describe("buildOrderMessage", () => {
  const msg = buildOrderMessage(order);
  it("inclui código, item, opção e observação", () => {
    expect(msg).toContain("Novo pedido A7K2P");
    expect(msg).toContain("2x Smash Clássico");
    expect(msg).toContain("Bacon crocante");
    expect(msg).toContain("obs: Sem cebola");
  });
  it("inclui total e troco", () => {
    expect(msg).toContain("Total:");
    expect(msg).toContain("troco");
  });
});

describe("buildWhatsappLink", () => {
  it("monta wa.me com mensagem codificada", () => {
    const link = buildWhatsappLink("5511999998888", "olá mundo");
    expect(link.startsWith("https://wa.me/5511999998888?text=")).toBe(true);
    expect(link).toContain(encodeURIComponent("olá mundo"));
  });
});
