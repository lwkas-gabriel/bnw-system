import type { RaceId, BaseAttributes, PericiaId } from "../shared/types/character";

export interface RaceData {
  id: RaceId;
  name: string;
  /** Grafia usada na ficha do fórum, quando difere de `name` */
  forumLabel?: string;
  description: string;
  attrBonus: Partial<BaseAttributes>;
  periciaBonus: { pericia: PericiaId; value: number } | null;
  specialAbility?: string;
}

export const RACES: Record<RaceId, RaceData> = {
  human: {
    id: "human",
    name: "Humano",
    description: "A raça mais presente do mundo. Sua capacidade de improviso é algo acima do comum.",
    attrBonus: {}, // +1 em atributo à escolha do jogador
    periciaBonus: null, // +1 perícia à escolha do jogador
    specialAbility: "Escolha livre: +1 em qualquer atributo E +1 em qualquer perícia.",
  },
  fishman: {
    id: "fishman",
    name: "Tritão",
    description: "Criaturas que vivem tanto no mar quanto em solo firme. Agressivos e resistentes.",
    attrBonus: { power: 1 },
    periciaBonus: { pericia: "sobrevivencia", value: 1 },
  },
  siren: {
    id: "siren",
    name: "Sireno",
    description: "Após os 20 anos, sua nadadeira se separa em duas pernas. Os mais rápidos na água.",
    attrBonus: { defense: 1 },
    periciaBonus: { pericia: "atletismo", value: 1 },
  },
  lunar: {
    id: "lunar",
    name: "Povo Lunar",
    forumLabel: "Lunar",
    description: "Birkans, Shandians e Skypeans — originários da Lua, com asas decorativas nas costas.",
    attrBonus: { precision: 1 },
    periciaBonus: { pericia: "logica", value: 1 },
  },
  mink: {
    id: "mink",
    name: "Mink",
    description: "Humanoides com semelhança a mamíferos. Originários de Zou, no New World.",
    attrBonus: {},
    periciaBonus: { pericia: "percepcao", value: 1 },
    specialAbility: "Forma Sulong (ver Técnicas).",
  },
  dwarf: {
    id: "dwarf",
    name: "Anão",
    description: "Tontatta — pessoas pequenas de força surpreendente, especialistas em plantio.",
    attrBonus: { defense: 1 },
    periciaBonus: { pericia: "furtividade", value: 1 },
  },
  giant: {
    id: "giant",
    name: "Gigante / Meio-gigante",
    forumLabel: "Gigante",
    description: "Imensos guerreiros de Elbaf. Meio-gigantes variam entre 5 e 7 metros.",
    attrBonus: { constitution: 1 },
    periciaBonus: { pericia: "sobrevivencia", value: 1 },
  },
  half_giant: {
    id: "half_giant",
    name: "Meio-gigante",
    forumLabel: "Meio-Gigante",
    description: "Híbrido entre gigante e humano. Usa a tabela de Gigante.",
    attrBonus: { constitution: 1 },
    periciaBonus: { pericia: "sobrevivencia", value: 1 },
  },
};

export function raceForumLabel(id: RaceId): string {
  const race = RACES[id];
  return race ? race.forumLabel ?? race.name : id;
}
