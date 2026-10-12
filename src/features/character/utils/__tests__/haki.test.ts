import { describe, it, expect } from "vitest";
import type { HakiPath } from "../../../../shared/types/character";
import { computeHakiCost, hakiStageNum } from "../haki";
import { computeGemBudget } from "../gemBudget";
import { createCharacterFixture } from "./fixtures";

function haki(overrides: Partial<HakiPath> = {}): HakiPath {
  return {
    primaryType: "armament", primaryStage: 3,
    secondaryType: "observation", secondaryStage: 1,
    hasKing: false, kingStage: null, advancedType: null,
    ...overrides,
  };
}

describe("hakiStageNum", () => {
  it("estágios avançados contam como 5", () => {
    expect(hakiStageNum(3)).toBe(3);
    expect(hakiStageNum("advanced_partial")).toBe(5);
    expect(hakiStageNum("advanced_complete", 0)).toBe(0);
  });
});

describe("computeHakiCost", () => {
  it("primário: 20g por estágio; secundário grátis", () => {
    expect(computeHakiCost(haki())).toBe(60);
  });

  it("estágio avançado do primário conta como 5 estágios", () => {
    expect(computeHakiCost(haki({ primaryStage: "advanced_partial" }))).toBe(100);
  });

  it("Rei Controlado +20, Rei Avançado +20 (via kingStage)", () => {
    expect(computeHakiCost(haki({ primaryStage: 5, hasKing: true, kingStage: "controlled" }))).toBe(120);
    expect(computeHakiCost(haki({ primaryStage: 5, hasKing: true, kingStage: "advanced" }))).toBe(140);
  });

  it("Haki Avançado (não-Rei) custa parcial + completo", () => {
    expect(computeHakiCost(haki({ primaryStage: 5, advancedType: "ryuo" }))).toBe(140);
  });

  it("bate com o total de Haki do gemBudget", () => {
    const h = haki({ primaryStage: 5, hasKing: true, kingStage: "advanced", advancedType: "ryuo" });
    const budget = computeGemBudget(createCharacterFixture({ haki: h, level: 40, location: "new_world" }));
    const hakiTotal = budget.breakdown.filter(b => b.category === "Haki").reduce((s, b) => s + b.cost, 0);
    expect(computeHakiCost(h)).toBe(hakiTotal);
  });
});
