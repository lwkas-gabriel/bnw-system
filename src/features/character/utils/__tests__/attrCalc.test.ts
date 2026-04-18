import { describe, it, expect } from "vitest";
import {
  bpn, totalPericiaPoints, totalAttributePoints,
  validateAttributes, suggestedAttributeForLevel, getZoanClassPericiaBonus,
} from "../attrCalc";
import { createCharacterFixture } from "./fixtures";

describe("bpn", () => {
  it.each([
    [1, 0], [2, 1], [3, 2], [4, 3], [5, 3],
    [8, 6], [9, 6], [10, 7], [16, 12], [17, 12],
    [40, 30],
  ] as const)("level %d → bpn %d", (level, expected) => {
    expect(bpn(level)).toBe(expected);
  });
});

describe("totalPericiaPoints", () => {
  it.each([
    [1, 3], [2, 4], [3, 4], [4, 5], [5, 5],
    [10, 8], [20, 13], [40, 23],
  ] as const)("level %d → %d points", (level, expected) => {
    expect(totalPericiaPoints(level)).toBe(expected);
  });
});

describe("totalAttributePoints", () => {
  it("equals level with no racial bonus", () => {
    expect(totalAttributePoints(10)).toBe(10);
  });

  it("adds racial bonus", () => {
    expect(totalAttributePoints(5, 2)).toBe(7);
  });
});

describe("validateAttributes", () => {
  it("accepts exactly max invested", () => {
    const char = createCharacterFixture({
      level: 10,
      investedAttributes: { power: 4, precision: 3, defense: 2, constitution: 1 }, // 10
    });
    expect(validateAttributes(char)).toHaveLength(0);
  });

  it("rejects one over limit", () => {
    const char = createCharacterFixture({
      level: 5,
      investedAttributes: { power: 3, precision: 3, defense: 0, constitution: 0 }, // 6 > 5
    });
    const errors = validateAttributes(char);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("excedem");
  });

  it("rejects negative values", () => {
    const char = createCharacterFixture({
      investedAttributes: { power: -1, precision: 0, defense: 0, constitution: 2 },
    });
    expect(validateAttributes(char).some(e => e.includes("negativo"))).toBe(true);
  });
});

describe("suggestedAttributeForLevel", () => {
  it("returns precision at PRE levels [3,8,13,18,23,28,33,38]", () => {
    [3, 8, 13, 18, 23, 28, 33, 38].forEach(lvl => {
      expect(suggestedAttributeForLevel(lvl)).toBe("precision");
    });
  });

  it("returns constitution at odd non-PRE levels", () => {
    [1, 5, 7, 9, 11].forEach(lvl => {
      expect(suggestedAttributeForLevel(lvl)).toBe("constitution");
    });
  });

  it("returns power at even non-PRE levels", () => {
    [2, 4, 6, 10, 12].forEach(lvl => {
      expect(suggestedAttributeForLevel(lvl)).toBe("power");
    });
  });
});

describe("getZoanClassPericiaBonus", () => {
  it("returns null when no akuma", () => {
    expect(getZoanClassPericiaBonus(createCharacterFixture())).toBeNull();
  });

  it("returns null for non-zoan akuma", () => {
    const char = createCharacterFixture({
      akuma: { type: "paramecia", name: "Gomu", rank: "C", parameciaClass: "corporeal", specialAdherence: "", passives: [], actives: [] },
    });
    expect(getZoanClassPericiaBonus(char)).toBeNull();
  });

  it.each([
    ["flying", "atletismo"],
    ["herbivore", "sobrevivencia"],
    ["carnivore", "furtividade"],
    ["rational", "logica"],
  ] as const)("Zoan class %s → péricia %s", (animalClass, expectedPericia) => {
    const char = createCharacterFixture({
      akuma: { type: "zoan", name: "Test", rank: "C", animalClass, isMythical: false, isAncestral: false, points: [], abilities: [], vigorAnimalBonus: 2 },
    });
    const result = getZoanClassPericiaBonus(char);
    expect(result?.pericia).toBe(expectedPericia);
    expect(result?.value).toBe(1);
  });
});
