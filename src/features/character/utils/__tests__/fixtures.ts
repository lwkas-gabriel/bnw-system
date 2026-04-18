import type { Character, CharacterPericias } from "../../../../shared/types/character";

export function blankPericias(): CharacterPericias {
  return {
    ambicao: 0, atletismo: 0, destreza: 0, erudicao: 0,
    expressao: 0, furtividade: 0, investigacao: 0, logica: 0,
    percepcao: 0, persuasao: 0, sobrevivencia: 0,
  };
}

/** Returns a minimum valid Character (level 1, no paths, no errors). */
export function createCharacterFixture(overrides: Partial<Character> = {}): Character {
  const base: Character = {
    id: "test-char",
    name: "Test Character",
    level: 1,
    race: "human",
    investedAttributes: { power: 0, precision: 0, defense: 0, constitution: 1 },
    racialBonus: {},
    pericias: blankPericias(),
    humanPericiaChoice: null,
    professions: [],
    energy: { bpn: 0, energy: 3, energyInvested: 0 },
    haki: null,
    akuma: null,
    artesMarciais: null,
    cyborg: null,
    techniques: [],
    equippedWeapon: null,
    equippedDefensive: [null, null],
    gemsSpent: 0,
    gemBudget: 20,
    location: "blues",
  };
  return { ...base, ...overrides };
}
