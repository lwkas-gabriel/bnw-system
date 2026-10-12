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

/**
 * Personagem "completo" para testes de export/import: Zoan, Haki, AM Laranja com
 * Arma Única, Ciborgue com bônus de energia, técnicas, equipamentos, facção e companheiros.
 */
export function createRichCharacterFixture(overrides: Partial<Character> = {}): Character {
  return createCharacterFixture({
    id: "rich-char",
    name: "Roronoa Teste",
    level: 20,
    race: "mink",
    location: "grand_line",
    investedAttributes: { power: 6, precision: 5, defense: 4, constitution: 5 },
    racialBonus: { precision: 2 },
    pericias: { ...blankPericias(), atletismo: 3, percepcao: 2, ambicao: 1 },
    energy: { bpn: 15, energy: 66, energyInvested: 6 },
    haki: {
      primaryType: "armament", primaryStage: 3,
      secondaryType: "observation", secondaryStage: 2,
      hasKing: false, kingStage: null, advancedType: null,
    },
    akuma: {
      type: "zoan", name: "Neko Neko no Mi", rank: "B", animalClass: "carnivore",
      isMythical: false, isAncestral: false, vigorAnimalBonus: 2,
      points: [{ id: "hybrid", primaryAttr: "power", complementaryAttr: "precision", bonus: 2 }],
      abilities: [],
    },
    artesMarciais: { currentFaixa: "verde", laranjaChoice: "unique_weapon" },
    cyborg: {
      shifts: [
        { shiftNumber: 1, location: "right_arm", name: "Braço Canhão", description: "Canhão no braço" },
        { shiftNumber: 2, location: "left_leg", name: "Perna Mola", description: "Salto" },
        { shiftNumber: 3, location: "torso", name: "Núcleo", description: "Reator" },
      ],
      shift3Bonus: "energy", gear: null, usesFuel: true,
    },
    techniques: [
      {
        id: "t1", name: "Golpe Tigre", description: "Corte duplo", rank: "C", type: "offensive",
        targetAttr: "power", baseBonus: 3, energyCost: 3, adherences: [], source: "purchased",
      },
      {
        id: "t2", name: "Guarda de Ferro", description: "Bloqueio", rank: "D", type: "defensive",
        targetAttr: "defense", baseBonus: 2, energyCost: 2, adherences: [], source: "purchased",
      },
    ],
    equippedWeapon: {
      id: "w1", name: "Katana", description: "Lâmina negra", slot: "weapon", quality: "common",
      bonusAttr: "power", bonusValue: 1, uniqueName: "Shusui", characteristic: "shusui",
    },
    equippedDefensive: [
      { id: "d1", name: "Elmo", description: "", slot: "head", quality: "splendid", bonusAttr: "defense", bonusValue: 1 },
      null,
    ],
    gemBudget: 400,
    faction: { type: "marinha", rank: "capitao", prestige: 12, discountUsed: false },
    companions: [{ id: "c1", name: "Usopp Jr.", rank: "C", type: "companion" }],
    ...overrides,
  });
}
