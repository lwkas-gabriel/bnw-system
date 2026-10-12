import type { BaseAttributes } from "../shared/types/character";

export type AttrKey = keyof BaseAttributes;

export const ATTR_KEYS: readonly AttrKey[] = ["power", "precision", "defense", "constitution"];

/** Atributos usados por técnicas ofensivas / defensivas */
export const OFFENSIVE_ATTRS: readonly AttrKey[] = ["power", "precision"];
export const DEFENSIVE_ATTRS: readonly AttrKey[] = ["defense", "constitution"];

export const ATTR_SHORT_LABELS: Record<AttrKey, string> = {
  power: "POD", precision: "PRE", defense: "DEF", constitution: "CON",
};

export const ATTR_LABELS: Record<AttrKey, string> = {
  power: "Poder", precision: "Precisão", defense: "Defesa", constitution: "Constituição",
};

/** Valores iniciais de todo personagem, antes de pontos investidos e bônus raciais */
export const BASE_ATTRIBUTES: Readonly<BaseAttributes> = {
  power: 1, precision: 1, defense: 1, constitution: 3,
};
