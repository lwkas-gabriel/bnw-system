import { describe, it, expect } from "vitest";
import { computeGemBudget } from "../gemBudget";
import { GEM_COSTS } from "../../../../data/gemCosts";
import { createCharacterFixture } from "./fixtures";

describe("GEM_COSTS", () => {
  it("secondary Haki is free", () => {
    expect(GEM_COSTS.haki.secondary).toBe(0);
  });

  it("Akuma Rank S is 50g over A (140g total)", () => {
    expect(GEM_COSTS.akuma.A + GEM_COSTS.akuma.S).toBe(140);
  });
});

describe("computeGemBudget", () => {
  it("empty character spends 0g", () => {
    const budget = computeGemBudget(createCharacterFixture());
    expect(budget.spent).toBe(0);
    expect(budget.remaining).toBe(20);
    expect(budget.isOverBudget).toBe(false);
    expect(budget.breakdown).toHaveLength(0);
  });

  // ── Akuma no Mi ───────────────────────────────────────────────────────────────

  describe("Akuma no Mi", () => {
    it.each([
      ["C", 30],
      ["B", 60],
      ["A", 90],
      ["S", 140],
    ] as const)("Rank %s costs %dg", (rank, expected) => {
      const char = createCharacterFixture({
        akuma: { type: "paramecia", name: "Gomu Gomu", rank, parameciaClass: "corporeal", specialAdherence: "", passives: [], actives: [] },
        gemBudget: 200,
      });
      const budget = computeGemBudget(char);
      expect(budget.breakdown.find(b => b.category === "Akuma no Mi")?.cost).toBe(expected);
    });
  });

  // ── Haki ─────────────────────────────────────────────────────────────────────

  describe("Haki", () => {
    it("primary Armament costs 20g per stage", () => {
      const char = createCharacterFixture({
        haki: { primaryType: "armament", primaryStage: 3, secondaryType: "observation", secondaryStage: 0, hasKing: false, kingStage: null, advancedType: null },
        gemBudget: 100,
      });
      const budget = computeGemBudget(char);
      const primary = budget.breakdown.find(b => b.category === "Haki" && b.detail.includes("primário"));
      expect(primary?.cost).toBe(60); // 3 × 20
    });

    it("primary Observation also costs 20g per stage", () => {
      const char = createCharacterFixture({
        haki: { primaryType: "observation", primaryStage: 5, secondaryType: "armament", secondaryStage: 0, hasKing: false, kingStage: null, advancedType: null },
        gemBudget: 200,
      });
      const budget = computeGemBudget(char);
      const primary = budget.breakdown.find(b => b.category === "Haki" && b.detail.includes("primário"));
      expect(primary?.cost).toBe(100); // 5 × 20
    });

    it("secondary Haki generates no entry in breakdown", () => {
      const char = createCharacterFixture({
        haki: { primaryType: "armament", primaryStage: 3, secondaryType: "observation", secondaryStage: 3, hasKing: false, kingStage: null, advancedType: null },
        gemBudget: 100,
      });
      const budget = computeGemBudget(char);
      const hakiItems = budget.breakdown.filter(b => b.category === "Haki");
      expect(hakiItems).toHaveLength(1);
      expect(hakiItems[0].cost).toBe(60); // only primary × 3
    });

    it("King Haki costs 20g", () => {
      const char = createCharacterFixture({
        haki: { primaryType: "armament", primaryStage: 5, secondaryType: "observation", secondaryStage: 0, hasKing: true, kingStage: "controlled", advancedType: null },
        gemBudget: 200,
      });
      const budget = computeGemBudget(char);
      const king = budget.breakdown.find(b => b.detail.includes("Rei") && b.detail.includes("Dormente"));
      expect(king?.cost).toBe(20);
    });

    it("Advanced Haki (non-king) costs 40g (partial + complete)", () => {
      const char = createCharacterFixture({
        haki: { primaryType: "armament", primaryStage: 5, secondaryType: "observation", secondaryStage: 0, hasKing: true, kingStage: "controlled", advancedType: "ryuo" },
        gemBudget: 200,
        location: "new_world",
      });
      const budget = computeGemBudget(char);
      const advanced = budget.breakdown.find(b => b.detail.includes("Haki Avançado") && !b.detail.includes("Rei"));
      expect(advanced?.cost).toBe(40); // 20 + 20
    });
  });

  // ── Artes Marciais ────────────────────────────────────────────────────────────

  describe("Artes Marciais", () => {
    it("branca costs 10g", () => {
      const char = createCharacterFixture({
        artesMarciais: { currentFaixa: "branca", laranjaChoice: null },
        gemBudget: 50,
      });
      expect(computeGemBudget(char).breakdown.find(b => b.category === "Artes Marciais")?.cost).toBe(10);
    });

    it("roxa costs cumulative 80g (branca through roxa, 8 belts)", () => {
      const char = createCharacterFixture({
        artesMarciais: { currentFaixa: "roxa", laranjaChoice: "techniques" },
        gemBudget: 200,
      });
      expect(computeGemBudget(char).breakdown.find(b => b.category === "Artes Marciais")?.cost).toBe(80);
    });

    it("grao_mestre costs 140g (all 14 belts)", () => {
      const char = createCharacterFixture({
        artesMarciais: { currentFaixa: "grao_mestre", laranjaChoice: "techniques" },
        gemBudget: 200,
        location: "new_world",
      });
      expect(computeGemBudget(char).breakdown.find(b => b.category === "Artes Marciais")?.cost).toBe(140);
    });
  });

  // ── Arma Única ────────────────────────────────────────────────────────────────

  describe("Arma Única", () => {
    const uniqueWeapon = {
      id: "uw1", name: "Sandai Kitetsu", uniqueName: "Sandai Kitetsu",
      description: "", slot: "weapon" as const, quality: "legendary" as const,
      bonusAttr: "precision" as const, bonusValue: 2, characteristic: "kitetsu" as const,
    };

    it("costs 20g when purchased independently", () => {
      const char = createCharacterFixture({ equippedWeapon: uniqueWeapon, gemBudget: 100 });
      expect(computeGemBudget(char).breakdown.find(b => b.category === "Arma Única")?.cost).toBe(20);
    });

    it("is free (no entry) when obtained via Faixa Laranja", () => {
      const char = createCharacterFixture({
        equippedWeapon: uniqueWeapon,
        artesMarciais: { currentFaixa: "laranja", laranjaChoice: "unique_weapon" },
        gemBudget: 100,
      });
      expect(computeGemBudget(char).breakdown.find(b => b.category === "Arma Única")).toBeUndefined();
    });
  });

  // ── Técnicas ─────────────────────────────────────────────────────────────────

  describe("Técnicas", () => {
    it.each([
      ["E", 6], ["D", 7], ["C", 8], ["B", 9], ["A", 10],
    ] as const)("Rank %s costs %dg", (rank, expected) => {
      const char = createCharacterFixture({
        techniques: [{ id: "t1", name: "Punch", description: "", rank, type: "offensive", targetAttr: "power", baseBonus: 1, energyCost: 1, adherences: [], source: "purchased" }],
        gemBudget: 50,
      });
      expect(computeGemBudget(char).breakdown.find(b => b.category === "Técnica")?.cost).toBe(expected);
    });

    it("only counts purchased techniques, ignoring free ones", () => {
      const char = createCharacterFixture({
        techniques: [
          { id: "t1", name: "Bought", description: "", rank: "C", type: "offensive", targetAttr: "power", baseBonus: 2, energyCost: 2, adherences: [], source: "purchased" },
          { id: "t2", name: "Free A", description: "", rank: "A", type: "offensive", targetAttr: "power", baseBonus: 5, energyCost: 5, adherences: [], source: "artes_marciais" },
        ],
        gemBudget: 50,
      });
      const techs = computeGemBudget(char).breakdown.filter(b => b.category === "Técnica");
      expect(techs).toHaveLength(1);
      expect(techs[0].cost).toBe(8);
    });
  });

  // ── Energia ───────────────────────────────────────────────────────────────────

  describe("Energia", () => {
    it("costs 1g per EN invested", () => {
      const char = createCharacterFixture({
        energy: { bpn: 0, energy: 12, energyInvested: 9 },
        gemBudget: 50,
      });
      expect(computeGemBudget(char).breakdown.find(b => b.category === "Energia")?.cost).toBe(9);
    });

    it("generates no entry when energyInvested is 0", () => {
      const char = createCharacterFixture({ energy: { bpn: 0, energy: 3, energyInvested: 0 } });
      expect(computeGemBudget(char).breakdown.find(b => b.category === "Energia")).toBeUndefined();
    });
  });

  // ── Profissões ────────────────────────────────────────────────────────────────

  describe("Profissões", () => {
    it("costs 10g per profession", () => {
      const char = createCharacterFixture({
        professions: [
          { id: "ferreiro", name: "Ferreiro", linkedPericias: ["destreza"] },
          { id: "medico", name: "Médico", linkedPericias: ["erudicao"] },
        ],
        gemBudget: 50,
      });
      const profCosts = computeGemBudget(char).breakdown.filter(b => b.category === "Profissão");
      expect(profCosts).toHaveLength(2);
      expect(profCosts.reduce((s, b) => s + b.cost, 0)).toBe(20);
    });
  });

  // ── Over budget ───────────────────────────────────────────────────────────────

  it("detects over-budget", () => {
    const char = createCharacterFixture({
      akuma: { type: "paramecia", name: "Gomu Gomu", rank: "A", parameciaClass: "corporeal", specialAdherence: "", passives: [], actives: [] },
      gemBudget: 50, // 90g > 50g
    });
    const budget = computeGemBudget(char);
    expect(budget.isOverBudget).toBe(true);
    expect(budget.spent).toBe(90);
    expect(budget.remaining).toBe(-40);
  });
});
