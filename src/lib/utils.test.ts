import { describe, it, expect } from "vitest";
import { formatCurrency, maskPhone, maskCEP } from "./utils";

describe("formatCurrency", () => {
  it("formata em BRL", () => {
    expect(formatCurrency(29.9)).toBe("R$ 29,90");
    expect(formatCurrency(0)).toBe("R$ 0,00");
  });
});

describe("maskPhone", () => {
  it("aplica máscara de telefone brasileiro", () => {
    expect(maskPhone("11999998888")).toBe("(11) 99999-8888");
  });
  it("trunca em 11 dígitos", () => {
    expect(maskPhone("119999988889999")).toBe("(11) 99999-8888");
  });
});

describe("maskCEP", () => {
  it("aplica máscara de CEP", () => {
    expect(maskCEP("01310100")).toBe("01310-100");
  });
});
