import { describe, it, expect } from "vitest";
import { validateCharacterFull } from "../validator";
import { createCharacterFixture } from "./fixtures";

const hasError = (report: ReturnType<typeof validateCharacterFull>, id: string) =>
  report.issues.some(i => i.id === id && i.severity === "error");

describe("validateCharacterFull", () => {
  it("valid minimum character has no errors", () => {
    const report = validateCharacterFull(createCharacterFixture());
    expect(report.isValid).toBe(true);
    expect(report.errorCount).toBe(0);
  });

  // ── Atributos ─────────────────────────────────────────────────────────────────

  describe("atributos", () => {
    it("rejects over-invested attributes", () => {
      const char = createCharacterFixture({
        level: 5,
        investedAttributes: { power: 3, precision: 3, defense: 0, constitution: 0 }, // 6 > 5
      });
      expect(hasError(validateCharacterFull(char), "attrs_over_limit")).toBe(true);
    });

    it("accepts exactly max invested", () => {
      const char = createCharacterFixture({
        level: 5,
        investedAttributes: { power: 2, precision: 2, defense: 1, constitution: 0 }, // 5 = 5
      });
      expect(hasError(validateCharacterFull(char), "attrs_over_limit")).toBe(false);
    });
  });

  // ── Haki ─────────────────────────────────────────────────────────────────────

  describe("Haki", () => {
    it("rejects secondary stage ahead of primary", () => {
      const char = createCharacterFixture({
        haki: { primaryType: "armament", primaryStage: 2, secondaryType: "observation", secondaryStage: 4, hasKing: false, kingStage: null, advancedType: null },
        location: "grand_line",
      });
      expect(hasError(validateCharacterFull(char), "haki_secondary_ahead")).toBe(true);
    });

    it("allows secondary equal to primary", () => {
      const char = createCharacterFixture({
        haki: { primaryType: "armament", primaryStage: 3, secondaryType: "observation", secondaryStage: 3, hasKing: false, kingStage: null, advancedType: null },
        location: "grand_line",
      });
      expect(hasError(validateCharacterFull(char), "haki_secondary_ahead")).toBe(false);
    });

    it("rejects King Haki without stage 5", () => {
      const char = createCharacterFixture({
        haki: { primaryType: "armament", primaryStage: 4, secondaryType: "observation", secondaryStage: 0, hasKing: true, kingStage: "controlled", advancedType: null },
        location: "grand_line",
      });
      expect(hasError(validateCharacterFull(char), "haki_king_requires_5")).toBe(true);
    });

    it("accepts King Haki with primary stage 5", () => {
      const char = createCharacterFixture({
        haki: { primaryType: "armament", primaryStage: 5, secondaryType: "observation", secondaryStage: 0, hasKing: true, kingStage: "controlled", advancedType: null },
        location: "new_world",
        gemBudget: 200,
      });
      expect(hasError(validateCharacterFull(char), "haki_king_requires_5")).toBe(false);
    });

    it("rejects stage 3+ in Blues", () => {
      const char = createCharacterFixture({
        haki: { primaryType: "armament", primaryStage: 3, secondaryType: "observation", secondaryStage: 0, hasKing: false, kingStage: null, advancedType: null },
        location: "blues",
      });
      expect(hasError(validateCharacterFull(char), "haki_stage3_location")).toBe(true);
    });

    it("rejects Advanced Haki outside New World", () => {
      const char = createCharacterFixture({
        haki: { primaryType: "armament", primaryStage: 5, secondaryType: "observation", secondaryStage: 0, hasKing: true, kingStage: "controlled", advancedType: "ryuo" },
        location: "grand_line",
        gemBudget: 200,
      });
      expect(hasError(validateCharacterFull(char), "haki_advanced_location")).toBe(true);
    });
  });

  // ── Artes Marciais ────────────────────────────────────────────────────────────

  describe("Artes Marciais", () => {
    it("rejects advanced faixas outside New World", () => {
      const char = createCharacterFixture({
        artesMarciais: { currentFaixa: "preta", laranjaChoice: "techniques" },
        location: "blues",
      });
      expect(hasError(validateCharacterFull(char), "am_advanced_location")).toBe(true);
    });

    it("rejects intermediate faixas in Blues", () => {
      const char = createCharacterFixture({
        artesMarciais: { currentFaixa: "laranja", laranjaChoice: "techniques" },
        location: "blues",
      });
      expect(hasError(validateCharacterFull(char), "am_intermediate_location")).toBe(true);
    });

    it("accepts advanced faixas in New World", () => {
      const char = createCharacterFixture({
        artesMarciais: { currentFaixa: "preta", laranjaChoice: "techniques" },
        location: "new_world",
        gemBudget: 200,
      });
      expect(hasError(validateCharacterFull(char), "am_advanced_location")).toBe(false);
    });
  });

  // ── Ciborgue ──────────────────────────────────────────────────────────────────

  describe("Ciborgue", () => {
    const fiveShifts = [
      { shiftNumber: 1 as const, location: "right_arm" as const, name: "", description: "" },
      { shiftNumber: 2 as const, location: "left_arm" as const, name: "", description: "" },
      { shiftNumber: 3 as const, location: "right_leg" as const, name: "", description: "" },
      { shiftNumber: 4 as const, location: "left_leg" as const, name: "", description: "" },
      { shiftNumber: 5 as const, location: "torso" as const, name: "", description: "" },
    ];

    it("rejects Gear with less than 6 shifts", () => {
      const char = createCharacterFixture({
        cyborg: { shifts: fiveShifts, shift3Bonus: null, gear: "overclock", usesFuel: true },
        location: "new_world",
        gemBudget: 200,
      });
      expect(hasError(validateCharacterFull(char), "cyborg_gear_needs_6")).toBe(true);
    });

    it("rejects Gear outside New World", () => {
      const char = createCharacterFixture({
        cyborg: { shifts: [...fiveShifts, { shiftNumber: 6 as const, location: "head" as const, name: "", description: "" }], shift3Bonus: null, gear: "overclock", usesFuel: true },
        location: "grand_line",
        gemBudget: 200,
      });
      expect(hasError(validateCharacterFull(char), "cyborg_gear_location")).toBe(true);
    });

    it("rejects duplicate shift locations", () => {
      const char = createCharacterFixture({
        cyborg: {
          shifts: [
            { shiftNumber: 1 as const, location: "right_arm" as const, name: "", description: "" },
            { shiftNumber: 2 as const, location: "right_arm" as const, name: "", description: "" }, // duplicate
          ],
          shift3Bonus: null, gear: null, usesFuel: false,
        },
      });
      expect(hasError(validateCharacterFull(char), "cyborg_duplicate_locations")).toBe(true);
    });
  });

  // ── Técnicas ─────────────────────────────────────────────────────────────────

  describe("Técnicas", () => {
    it("rejects Rank A adherence on non-A technique", () => {
      const char = createCharacterFixture({
        techniques: [{
          id: "t1", name: "Punch", description: "", rank: "C", type: "offensive",
          targetAttr: "power", baseBonus: 2, energyCost: 2, adherences: [{ effect: "area_controlled", times: 1 }], source: "purchased",
        }],
        gemBudget: 50,
      });
      expect(hasError(validateCharacterFull(char), "tech_rank_a_adherence_t1")).toBe(true);
    });

    it("rejects consecutive_atk on defensive technique", () => {
      const char = createCharacterFixture({
        techniques: [{
          id: "t2", name: "Shield", description: "", rank: "A", type: "defensive",
          targetAttr: "defense", baseBonus: 5, energyCost: 5, adherences: [{ effect: "consecutive_atk", times: 1 }], source: "purchased",
        }],
        gemBudget: 50,
      });
      expect(hasError(validateCharacterFull(char), "tech_consec_atk_wrong_t2")).toBe(true);
    });

    it("rejects consecutive_def on offensive technique", () => {
      const char = createCharacterFixture({
        techniques: [{
          id: "t3", name: "Slash", description: "", rank: "A", type: "offensive",
          targetAttr: "power", baseBonus: 5, energyCost: 5, adherences: [{ effect: "consecutive_def", times: 1 }], source: "purchased",
        }],
        gemBudget: 50,
      });
      expect(hasError(validateCharacterFull(char), "tech_consec_def_wrong_t3")).toBe(true);
    });

    it("rejects attack-only effect on defensive technique", () => {
      const char = createCharacterFixture({
        techniques: [{
          id: "t4", name: "Guard", description: "", rank: "B", type: "defensive",
          targetAttr: "defense", baseBonus: 3, energyCost: 3, adherences: [{ effect: "safety", times: 1 }], source: "purchased",
        }],
        gemBudget: 50,
      });
      expect(hasError(validateCharacterFull(char), "tech_wrong_adherence_atk_t4")).toBe(true);
    });

    it("allows consecutive_atk on offensive technique", () => {
      const char = createCharacterFixture({
        techniques: [{
          id: "t5", name: "Combo", description: "", rank: "A", type: "offensive",
          targetAttr: "power", baseBonus: 5, energyCost: 5, adherences: [{ effect: "consecutive_atk", times: 1 }], source: "purchased",
        }],
        gemBudget: 50,
      });
      expect(hasError(validateCharacterFull(char), "tech_consec_atk_wrong_t5")).toBe(false);
    });
  });

  // ── Gemas ─────────────────────────────────────────────────────────────────────

  describe("Gemas", () => {
    it("rejects over-budget spending", () => {
      const char = createCharacterFixture({
        akuma: { type: "paramecia", name: "Gomu Gomu", rank: "A", parameciaClass: "corporeal", specialAdherence: "", passives: [], actives: [] },
        gemBudget: 50, // 90g > 50g
      });
      expect(hasError(validateCharacterFull(char), "gems_over_budget")).toBe(true);
    });
  });

  // ── Akuma no Mi ───────────────────────────────────────────────────────────────

  describe("Akuma no Mi", () => {
    it("rejects Rank S outside New World", () => {
      const char = createCharacterFixture({
        akuma: { type: "paramecia", name: "Gomu Gomu", rank: "S", parameciaClass: "corporeal", specialAdherence: "", passives: [], actives: [] },
        location: "grand_line",
        gemBudget: 200,
      });
      expect(hasError(validateCharacterFull(char), "akuma_s_location")).toBe(true);
    });
  });
});
