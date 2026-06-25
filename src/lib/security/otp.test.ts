import { describe, it, expect } from "vitest";
import { generateOtp, hashOtp, verifyOtp } from "./otp";

describe("otp", () => {
  it("gera 6 dígitos", () => {
    expect(generateOtp()).toMatch(/^\d{6}$/);
  });
  it("hash é determinístico com o mesmo pepper", () => {
    expect(hashOtp("123456", "pep")).toBe(hashOtp("123456", "pep"));
  });
  it("hash muda com pepper diferente", () => {
    expect(hashOtp("123456", "a")).not.toBe(hashOtp("123456", "b"));
  });
  it("verify aceita o código certo e rejeita o errado", () => {
    const h = hashOtp("654321", "pep");
    expect(verifyOtp("654321", h, "pep")).toBe(true);
    expect(verifyOtp("000000", h, "pep")).toBe(false);
  });
});
