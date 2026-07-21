import { describe, expect, it } from "vitest";
import { validatePasswordStrength } from "./password-policy";

describe("password-policy", () => {
  it("TC-PWD-01: password memenuhi semua kriteria -> true", () => {
    expect(validatePasswordStrength("Passw0rd!")).toBe(true);
  });

  it("TC-PWD-02: tanpa huruf besar -> false", () => {
    expect(validatePasswordStrength("passw0rd!")).toBe(false);
  });

  it("TC-PWD-03: tanpa huruf kecil -> false", () => {
    expect(validatePasswordStrength("PASSW0RD!")).toBe(false);
  });

  it("TC-PWD-04: tanpa angka -> false", () => {
    expect(validatePasswordStrength("Password!")).toBe(false);
  });

  it("TC-PWD-05: tanpa simbol -> false", () => {
    expect(validatePasswordStrength("Passw0rd")).toBe(false);
  });

  it("TC-PWD-06: kurang dari 8 karakter -> false", () => {
    expect(validatePasswordStrength("Pw0!aaa")).toBe(false);
  });

  it("TC-PWD-07: string kosong -> false", () => {
    expect(validatePasswordStrength("")).toBe(false);
  });

  it("TC-PWD-08: tepat 8 karakter valid -> true", () => {
    expect(validatePasswordStrength("Aa1!bbbb")).toBe(true);
  });
});
