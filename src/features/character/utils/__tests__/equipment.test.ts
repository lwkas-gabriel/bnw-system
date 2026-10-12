import { describe, it, expect } from "vitest";
import { hasWeaponTrait, isUniqueWeapon } from "../equipment";
import { isUniqueWeaponFromLaranja } from "../artesMarciais";
import { createRichCharacterFixture } from "./fixtures";

describe("Arma Única", () => {
  const char = createRichCharacterFixture(); // Shusui equipada, faixa Verde, escolha Laranja = arma

  it("isUniqueWeapon / hasWeaponTrait", () => {
    expect(isUniqueWeapon(char.equippedWeapon)).toBe(true);
    expect(isUniqueWeapon(char.equippedDefensive[0])).toBe(false);
    expect(isUniqueWeapon(null)).toBe(false);
    expect(hasWeaponTrait(char, "shusui")).toBe(true);
    expect(hasWeaponTrait(char, "kitetsu")).toBe(false);
  });

  it("isUniqueWeaponFromLaranja", () => {
    expect(isUniqueWeaponFromLaranja(char)).toBe(true);
    expect(isUniqueWeaponFromLaranja({ ...char, artesMarciais: { currentFaixa: "verde", laranjaChoice: null } })).toBe(true);
    expect(isUniqueWeaponFromLaranja({ ...char, artesMarciais: { currentFaixa: "verde", laranjaChoice: "techniques" } })).toBe(false);
    expect(isUniqueWeaponFromLaranja({ ...char, artesMarciais: { currentFaixa: "amarela", laranjaChoice: null } })).toBe(false);
  });
});
