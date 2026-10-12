import { describe, it, expect } from "vitest";
import {
  absorbDamage, resolveAttributes, buildTempConStack,
  resolveTechniqueBonus, resolveDamage, hitProbability,
  initialCombatantState, processTurn,
} from "../combatEngine";
import { createCharacterFixture } from "../../../character/utils/__tests__/fixtures";
import type { ActiveBuffs, CombatantState, TurnChoice } from "../../../../shared/types/combat";

const NO_BUFFS: ActiveBuffs = {
  hakiArmament: false, hakiObservation: false,
  hakiKing: false, hakiAdvanced: false,
  zoanPoint: null, logiaElementalDomain: false,
};

function makeChoice(overrides: Partial<TurnChoice> = {}): TurnChoice {
  return { offensive: null, defensive: null, buffs: { ...NO_BUFFS }, useElementalista: false, ...overrides };
}

function makeState(overrides: Partial<CombatantState> = {}): CombatantState {
  return {
    character: createCharacterFixture(),
    currentCon: 10,
    currentEnergy: 30,
    retemUsed: false,
    tempConStack: [],
    statusEffects: [],
    ...overrides,
  };
}

// ─── Dice utils ───────────────────────────────────────────────────────────────

describe("initialCombatantState", () => {
  it("energia inicial = nível×3 + gemas investidas", () => {
    const char = createCharacterFixture({ level: 10, energy: { bpn: 7, energy: 35, energyInvested: 5 } });
    expect(initialCombatantState(char).currentEnergy).toBe(35);
  });

  it("energia inicial inclui o +20 do Shift 3 do Ciborgue", () => {
    const char = createCharacterFixture({
      level: 10,
      cyborg: { shifts: [], shift3Bonus: "energy", gear: null, usesFuel: true },
    });
    expect(initialCombatantState(char).currentEnergy).toBe(50);
  });
});

// ─── absorbDamage ─────────────────────────────────────────────────────────────

describe("absorbDamage", () => {
  it("absorbs fully when stack exceeds damage", () => {
    const result = absorbDamage(3, [{ source: "haki", value: 5 }]);
    expect(result.absorbed).toBe(3);
    expect(result.remaining).toBe(0);
    expect(result.stackAfter).toEqual([{ source: "haki", value: 2 }]);
  });

  it("absorbs partially when damage exceeds stack", () => {
    const result = absorbDamage(10, [{ source: "haki", value: 4 }]);
    expect(result.absorbed).toBe(4);
    expect(result.remaining).toBe(6);
    expect(result.stackAfter).toHaveLength(0); // exhausted
  });

  it("drains first stack entry before second", () => {
    const result = absorbDamage(5, [
      { source: "haki", value: 3 },
      { source: "tech", value: 4 },
    ]);
    expect(result.absorbed).toBe(5);
    expect(result.remaining).toBe(0);
    expect(result.stackAfter).toEqual([{ source: "tech", value: 2 }]);
  });

  it("returns all damage remaining when stack is empty", () => {
    const result = absorbDamage(7, []);
    expect(result.absorbed).toBe(0);
    expect(result.remaining).toBe(7);
  });

  it("removes exhausted stack entries from stackAfter", () => {
    const result = absorbDamage(10, [{ source: "haki", value: 10 }]);
    expect(result.stackAfter).toHaveLength(0);
  });
});

// ─── resolveAttributes ────────────────────────────────────────────────────────

describe("resolveAttributes", () => {
  it("computes base attributes from level-1 character", () => {
    const char = createCharacterFixture();
    const attrs = resolveAttributes(char, NO_BUFFS);
    expect(attrs.power).toBe(1);
    expect(attrs.precision).toBe(1);
    expect(attrs.defense).toBe(1);
    expect(attrs.constitution).toBe(4); // 3 base + 1 invested
  });

  it("includes racial and invested bonuses", () => {
    const char = createCharacterFixture({
      investedAttributes: { power: 2, precision: 1, defense: 0, constitution: 0 },
      racialBonus: { power: 1 },
    });
    const attrs = resolveAttributes(char, NO_BUFFS);
    expect(attrs.power).toBe(4); // 1 base + 2 invested + 1 racial
    expect(attrs.precision).toBe(2); // 1 base + 1 invested
  });

  // ── Murakumogiri ─────────────────────────────────────────────────────────────

  it("Murakumogiri triples base CON", () => {
    const char = createCharacterFixture({
      investedAttributes: { power: 0, precision: 0, defense: 0, constitution: 2 },
      equippedWeapon: {
        id: "mura", name: "Murakumogiri", uniqueName: "Murakumogiri",
        description: "", slot: "weapon", quality: "legendary",
        bonusAttr: "constitution", bonusValue: 2, characteristic: "murakumogiri",
      },
    });
    const attrs = resolveAttributes(char, NO_BUFFS);
    // base = 3 + 2 = 5; +5*2 = 15 total
    expect(attrs.constitution).toBe(15);
  });

  it("Murakumogiri ×3 applies before Zoan Vigor Animal", () => {
    const char = createCharacterFixture({
      investedAttributes: { power: 0, precision: 0, defense: 0, constitution: 0 },
      akuma: { type: "zoan", name: "Inu Inu", rank: "C", animalClass: "carnivore", isMythical: false, isAncestral: false, points: [], abilities: [], vigorAnimalBonus: 2 },
      equippedWeapon: {
        id: "mura", name: "Murakumogiri", uniqueName: "Murakumogiri",
        description: "", slot: "weapon", quality: "legendary",
        bonusAttr: "constitution", bonusValue: 2, characteristic: "murakumogiri",
      },
    });
    const attrs = resolveAttributes(char, NO_BUFFS);
    // base = 3; ×3 = 9; +vigor 2 = 11
    expect(attrs.constitution).toBe(11);
  });

  // ── Haki Armament ─────────────────────────────────────────────────────────────

  it("Haki Armament adds primary stage to POD and energyCostPerTurn", () => {
    const char = createCharacterFixture({
      haki: { primaryType: "armament", primaryStage: 3, secondaryType: "observation", secondaryStage: 0, hasKing: false, kingStage: null, advancedType: null },
    });
    const attrs = resolveAttributes(char, { ...NO_BUFFS, hakiArmament: true });
    expect(attrs.power).toBe(4); // 1 base + 3 stage
    expect(attrs.energyCostPerTurn).toBe(3);
  });

  it("Haki Armament uses secondary stage when secondary is armament", () => {
    const char = createCharacterFixture({
      haki: { primaryType: "observation", primaryStage: 5, secondaryType: "armament", secondaryStage: 2, hasKing: false, kingStage: null, advancedType: null },
    });
    const attrs = resolveAttributes(char, { ...NO_BUFFS, hakiArmament: true });
    expect(attrs.power).toBe(3); // 1 + 2 secondary stage
  });

  // ── Enma ─────────────────────────────────────────────────────────────────────

  it("Enma doubles Haki Armament POD bonus", () => {
    const char = createCharacterFixture({
      haki: { primaryType: "armament", primaryStage: 3, secondaryType: "observation", secondaryStage: 0, hasKing: false, kingStage: null, advancedType: null },
      equippedWeapon: {
        id: "enma", name: "Enma", uniqueName: "Enma",
        description: "", slot: "weapon", quality: "legendary",
        bonusAttr: "power", bonusValue: 2, characteristic: "enma",
      },
    });
    const attrs = resolveAttributes(char, { ...NO_BUFFS, hakiArmament: true });
    // 1 base + 3 stage + 3 Enma (doubles) = 7
    expect(attrs.power).toBe(7);
  });

  // ── Haki Observation ─────────────────────────────────────────────────────────

  it("Haki Observation adds stage to PRE and DEF", () => {
    const char = createCharacterFixture({
      haki: { primaryType: "observation", primaryStage: 4, secondaryType: "armament", secondaryStage: 0, hasKing: false, kingStage: null, advancedType: null },
    });
    const attrs = resolveAttributes(char, { ...NO_BUFFS, hakiObservation: true });
    expect(attrs.precision).toBe(5); // 1 + 4
    expect(attrs.defense).toBe(5);   // 1 + 4
    expect(attrs.energyCostPerTurn).toBe(4);
  });

  // ── Logia ────────────────────────────────────────────────────────────────────

  it("Logia applies elemental +5 and intangibility +4 DEF +4 CON passively", () => {
    const char = createCharacterFixture({
      akuma: { type: "logia", name: "Mera Mera", rank: "A", elementalNatureAttr: "power", statusEnhanced: { name: "Burn", description: "", combination: ["burn"] }, intangibilityBonus: { defense: 4, constitution: 4 } },
    });
    const attrs = resolveAttributes(char, NO_BUFFS);
    expect(attrs.power).toBe(6);       // 1 base + 5 elemental
    expect(attrs.defense).toBe(5);     // 1 + 4 intangibility
    expect(attrs.constitution).toBe(8); // 4 + 4 intangibility (fixture: 3 base + 1 invested)
  });

  // ── Zoan ─────────────────────────────────────────────────────────────────────

  it("Zoan Vigor Animal adds flat CON", () => {
    const char = createCharacterFixture({
      akuma: { type: "zoan", name: "Inu Inu", rank: "B", animalClass: "carnivore", isMythical: false, isAncestral: false, points: [], abilities: [], vigorAnimalBonus: 4 },
    });
    const attrs = resolveAttributes(char, NO_BUFFS);
    expect(attrs.constitution).toBe(8); // 4 (fixture: 3+1) + 4 vigor
  });

  it("active Zoan point adds bonus to primary and complementary attr", () => {
    const char = createCharacterFixture({
      akuma: {
        type: "zoan", name: "Inu Inu", rank: "B", animalClass: "carnivore",
        isMythical: false, isAncestral: false, vigorAnimalBonus: 4,
        points: [{ id: "hybrid", primaryAttr: "power", complementaryAttr: "constitution", bonus: 3 }],
        abilities: [],
      },
    });
    const attrs = resolveAttributes(char, { ...NO_BUFFS, zoanPoint: "hybrid" });
    expect(attrs.power).toBe(4);         // 1 + 3 point
    expect(attrs.constitution).toBe(11); // 4 (base+invested) + 4 vigor + 3 point
  });
});

// ─── buildTempConStack ────────────────────────────────────────────────────────

describe("buildTempConStack", () => {
  it("adds Haki Armament stage to stack when active", () => {
    const char = createCharacterFixture({
      haki: { primaryType: "armament", primaryStage: 3, secondaryType: "observation", secondaryStage: 0, hasKing: false, kingStage: null, advancedType: null },
    });
    const choice = makeChoice({ buffs: { ...NO_BUFFS, hakiArmament: true } });
    const stack = buildTempConStack(char, makeState({ character: char }), choice);
    expect(stack).toHaveLength(1);
    expect(stack[0]).toEqual({ source: "haki_armament", value: 3 });
  });

  it("adds defensive technique targeting CON to stack", () => {
    const char = createCharacterFixture();
    const defTech = { id: "t1", name: "Iron Body", description: "", rank: "B" as const, type: "defensive" as const, targetAttr: "constitution" as const, baseBonus: 3, energyCost: 3, adherences: [], source: "purchased" as const };
    const choice = makeChoice({ defensive: defTech });
    const stack = buildTempConStack(char, makeState({ character: char }), choice);
    const techEntry = stack.find(s => s.source === "tech_defensive");
    expect(techEntry?.value).toBe(3);
  });

  it("returns empty stack with no buffs and no defensive tech", () => {
    const stack = buildTempConStack(createCharacterFixture(), makeState(), makeChoice());
    expect(stack).toHaveLength(0);
  });
});

// ─── resolveTechniqueBonus ────────────────────────────────────────────────────

describe("resolveTechniqueBonus", () => {
  const baseTech = { id: "t1", name: "Punch", description: "", rank: "B" as const, type: "offensive" as const, targetAttr: "power" as const, baseBonus: 3, energyCost: 3, adherences: [], source: "purchased" as const };

  it("returns baseBonus with no modifiers", () => {
    const char = createCharacterFixture();
    const choice = makeChoice({ offensive: baseTech });
    expect(resolveTechniqueBonus(char, choice, true)).toBe(3);
  });

  it("Kitetsu doubles baseBonus", () => {
    const char = createCharacterFixture({
      equippedWeapon: { id: "k", name: "Kitetsu", uniqueName: "Kitetsu", description: "", slot: "weapon", quality: "legendary", bonusAttr: "precision", bonusValue: 2, characteristic: "kitetsu" },
    });
    const choice = makeChoice({ offensive: baseTech });
    expect(resolveTechniqueBonus(char, choice, true)).toBe(6); // 3 × 2
  });

  it("AM Roxa adds +2 to offensive techniques", () => {
    const char = createCharacterFixture({
      artesMarciais: { currentFaixa: "roxa", laranjaChoice: "techniques" },
    });
    const choice = makeChoice({ offensive: baseTech });
    expect(resolveTechniqueBonus(char, choice, true)).toBe(5); // 3 + 2
  });

  it("AM Verde adds +2 to defensive techniques", () => {
    const defTech = { ...baseTech, type: "defensive" as const, targetAttr: "defense" as const };
    const char = createCharacterFixture({
      artesMarciais: { currentFaixa: "verde", laranjaChoice: "techniques" },
    });
    const choice = makeChoice({ defensive: defTech });
    expect(resolveTechniqueBonus(char, choice, false)).toBe(5); // 3 + 2
  });

  it("AM Roxa still carries Verde bonus to defensive techniques (+2 cumulative)", () => {
    // Verde bonus (defensive +2) applies to any faixa >= verde, including roxa
    const defTech = { ...baseTech, type: "defensive" as const, targetAttr: "defense" as const };
    const char = createCharacterFixture({
      artesMarciais: { currentFaixa: "roxa", laranjaChoice: "techniques" },
    });
    const choice = makeChoice({ defensive: defTech });
    expect(resolveTechniqueBonus(char, choice, false)).toBe(5); // 3 + 2 from Verde
  });

  it("Rei Avançado adds Ambição to bonus when King+Advanced active", () => {
    const char = createCharacterFixture({
      haki: { primaryType: "armament", primaryStage: 5, secondaryType: "observation", secondaryStage: 0, hasKing: true, kingStage: "advanced", advancedType: "king_advanced" },
      pericias: { ambicao: 2, atletismo: 0, destreza: 0, erudicao: 0, expressao: 0, furtividade: 0, investigacao: 0, logica: 0, percepcao: 0, persuasao: 0, sobrevivencia: 0 },
      location: "new_world",
    });
    const choice = makeChoice({ offensive: baseTech, buffs: { ...NO_BUFFS, hakiKing: true, hakiAdvanced: true } });
    expect(resolveTechniqueBonus(char, choice, true)).toBe(5); // 3 + 2 ambição
  });
});

// ─── resolveDamage ────────────────────────────────────────────────────────────

describe("resolveDamage", () => {
  it("deals base POD as rawDamage with no buffs", () => {
    const attacker = createCharacterFixture({
      investedAttributes: { power: 4, precision: 0, defense: 0, constitution: 0 },
    });
    const defender = makeState({ currentCon: 20 });
    const result = resolveDamage(attacker, makeChoice(), defender, makeChoice());
    expect(result.rawDamage).toBe(5); // 1 base + 4 invested
    expect(result.tempConAbsorbed).toBe(0);
    expect(result.baseConDamage).toBe(5);
    expect(result.isKnockout).toBe(false);
  });

  it("temp CON from defender Haki absorbs damage before base", () => {
    const attacker = createCharacterFixture({
      investedAttributes: { power: 4, precision: 0, defense: 0, constitution: 0 },
    });
    const defChar = createCharacterFixture({
      haki: { primaryType: "armament", primaryStage: 4, secondaryType: "observation", secondaryStage: 0, hasKing: false, kingStage: null, advancedType: null },
    });
    const defChoice = makeChoice({ buffs: { ...NO_BUFFS, hakiArmament: true } });
    const defender = makeState({ character: defChar, currentCon: 20 });
    const result = resolveDamage(attacker, makeChoice(), defender, defChoice);
    expect(result.tempConAbsorbed).toBe(4); // stage 4 absorbs 4
    expect(result.baseConDamage).toBe(1);   // 5 rawDamage - 4 absorbed
  });

  // ── Retém 1 CON ──────────────────────────────────────────────────────────────

  it("Zoan Mitológico activates Retém when hit would be lethal", () => {
    const attacker = createCharacterFixture({
      investedAttributes: { power: 9, precision: 0, defense: 0, constitution: 0 },
    });
    const defChar = createCharacterFixture({
      akuma: { type: "zoan", name: "Hito Hito", rank: "A", animalClass: "rational", isMythical: true, isAncestral: false, points: [], abilities: [], vigorAnimalBonus: 6 },
    });
    const defender = makeState({ character: defChar, currentCon: 2, retemUsed: false });
    const result = resolveDamage(attacker, makeChoice(), defender, makeChoice());
    // rawDamage = 10, currentCon = 2 → would KO, but Retém saves it
    expect(result.retemActivated).toBe(true);
    expect(result.isKnockout).toBe(false);
  });

  it("Murakumogiri also activates Retém when lethal", () => {
    const attacker = createCharacterFixture({
      investedAttributes: { power: 9, precision: 0, defense: 0, constitution: 0 },
    });
    const defChar = createCharacterFixture({
      equippedWeapon: {
        id: "mura", name: "Murakumogiri", uniqueName: "Murakumogiri",
        description: "", slot: "weapon", quality: "legendary",
        bonusAttr: "constitution", bonusValue: 2, characteristic: "murakumogiri",
      },
    });
    const defender = makeState({ character: defChar, currentCon: 2, retemUsed: false });
    const result = resolveDamage(attacker, makeChoice(), defender, makeChoice());
    expect(result.retemActivated).toBe(true);
    expect(result.isKnockout).toBe(false);
  });

  it("Retém does NOT activate if already used", () => {
    const attacker = createCharacterFixture({
      investedAttributes: { power: 9, precision: 0, defense: 0, constitution: 0 },
    });
    const defChar = createCharacterFixture({
      akuma: { type: "zoan", name: "Hito Hito", rank: "A", animalClass: "rational", isMythical: true, isAncestral: false, points: [], abilities: [], vigorAnimalBonus: 6 },
    });
    const defender = makeState({ character: defChar, currentCon: 2, retemUsed: true }); // already used
    const result = resolveDamage(attacker, makeChoice(), defender, makeChoice());
    expect(result.retemActivated).toBe(false);
    expect(result.isKnockout).toBe(true);
  });

  it("Retém does NOT activate for non-lethal hits", () => {
    const attacker = createCharacterFixture(); // power 1
    const defChar = createCharacterFixture({
      akuma: { type: "zoan", name: "Hito Hito", rank: "A", animalClass: "rational", isMythical: true, isAncestral: false, points: [], abilities: [], vigorAnimalBonus: 6 },
    });
    const defender = makeState({ character: defChar, currentCon: 10, retemUsed: false });
    const result = resolveDamage(attacker, makeChoice(), defender, makeChoice());
    expect(result.retemActivated).toBe(false);
    expect(result.isKnockout).toBe(false);
  });
});

// ─── hitProbability ───────────────────────────────────────────────────────────

describe("hitProbability", () => {
  it("returns 1.0 when hit is guaranteed (needed ≤ 3)", () => {
    expect(hitProbability(10, 0)).toBe(1); // needed = 0+10-10 = 0 ≤ 3
    expect(hitProbability(8, 1)).toBe(1);  // needed = 1+10-8 = 3
  });

  it("returns 0 when hit is impossible (needed > 18)", () => {
    expect(hitProbability(1, 10)).toBe(0); // needed = 10+10-1 = 19
  });

  it("returns correct probability for needed = 11 (average roll)", () => {
    // 3d6 ≥ 11: count outcomes from brute force → 108/216 = 0.5
    const prob = hitProbability(0, 1); // needed = 1+10-0 = 11
    expect(Math.round(prob * 216)).toBe(108); // exactly 108 out of 216
  });

  it("is between 0 and 1 for typical values", () => {
    const prob = hitProbability(5, 3);
    expect(prob).toBeGreaterThan(0);
    expect(prob).toBeLessThanOrEqual(1);
  });
});

// ─── processTurn ──────────────────────────────────────────────────────────────

describe("processTurn", () => {
  const choice: TurnChoice = {
    offensive: null, defensive: null, useElementalista: false,
    buffs: { ...NO_BUFFS, zoanPoint: null, logiaElementalDomain: false },
  };
  const strong = createCharacterFixture({ id: "a", name: "A", level: 40, investedAttributes: { power: 30, precision: 30, defense: 0, constitution: 1 } });
  const weak   = createCharacterFixture({ id: "b", name: "B", level: 1 });

  it("A ataca primeiro; em JxJ turno 1 ambos atacam mesmo após nocaute", () => {
    const result = processTurn(initialCombatantState(strong), initialCombatantState(weak), choice, choice, 1, "jxj", true);
    const attacks = result.events.filter(e => e.type === "attack");
    expect(attacks.map(e => e.actorId)).toEqual(["a", "b"]);
    expect(result.combatEnded).toBe(true);
    expect(result.winner).toBe("a");
  });

  it("fora do turno 1, B nocauteado não contra-ataca", () => {
    const result = processTurn(initialCombatantState(strong), initialCombatantState(weak), choice, choice, 2, "jxj", true);
    expect(result.events.filter(e => e.type === "attack").map(e => e.actorId)).toEqual(["a"]);
  });

  it("eventos de dano trazem CON antes/depois coerentes com o estado final", () => {
    const result = processTurn(initialCombatantState(strong), initialCombatantState(weak), choice, choice, 2, "jxj", true);
    const dmg = result.events.find(e => e.type === "damage" && e.targetId === "b");
    expect(dmg?.numerics?.conAfter).toBe(result.stateAfter[1].currentCon);
  });
});

