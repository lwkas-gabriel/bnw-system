import { describe, it, expect } from "vitest";
import { AM_FAIXAS, faixaIndex, faixaStatBonuses, faixasUpTo, hasReachedFaixa, isFaixaAvailable } from "../artesMarciais";
import { cyborgBonusLabel, CYBORG_LOCATIONS } from "../cyborg";

describe("Artes Marciais (data)", () => {
  it("14 faixas em ordem", () => {
    expect(AM_FAIXAS).toHaveLength(14);
    expect(faixaIndex("branca")).toBe(0);
    expect(faixaIndex("grao_mestre")).toBe(13);
    expect(faixaIndex(null)).toBe(-1);
  });

  it("faixasUpTo e hasReachedFaixa", () => {
    expect(faixasUpTo("amarela").map(f => f.id)).toEqual(["branca", "cinza", "azul_clara", "azul_escura", "amarela"]);
    expect(hasReachedFaixa("verde", "laranja")).toBe(true);
    expect(hasReachedFaixa("amarela", "laranja")).toBe(false);
    expect(hasReachedFaixa(null, "branca")).toBe(false);
  });

  it("faixaStatBonuses acumula +2 por atributo até a Amarela", () => {
    expect(faixaStatBonuses("branca")).toEqual({});
    expect(faixaStatBonuses("azul_clara")).toEqual({ precision: 2, defense: 2 });
    expect(faixaStatBonuses("grao_mestre")).toEqual({ precision: 2, defense: 2, power: 2, constitution: 2 });
  });

  it("isFaixaAvailable respeita a região", () => {
    expect(isFaixaAvailable("amarela", "blues")).toBe(true);
    expect(isFaixaAvailable("laranja", "blues")).toBe(false);
    expect(isFaixaAvailable("laranja", "new_world")).toBe(true);
    expect(isFaixaAvailable("preta", "grand_line")).toBe(false);
  });
});

describe("Ciborgue (data)", () => {
  it("rótulo de bônus por local", () => {
    expect(CYBORG_LOCATIONS).toHaveLength(6);
    expect(cyborgBonusLabel("head")).toBe("+4 PRE");
    expect(cyborgBonusLabel("torso")).toBe("+4 CON");
  });
});
