import type { CyborgShiftLocation } from "../shared/types/character";
import { ATTR_SHORT_LABELS, type AttrKey } from "./attributes";

/** Bônus fixo de atributo concedido por cada shift, conforme o local */
export const CYBORG_SHIFT_BONUS = 4;

export interface CyborgLocationData {
  id: CyborgShiftLocation;
  label: string;
  /** Atributo que recebe +CYBORG_SHIFT_BONUS */
  attr: AttrKey;
}

export const CYBORG_LOCATIONS: CyborgLocationData[] = [
  { id: "head",      label: "Cabeça",         attr: "precision" },
  { id: "right_arm", label: "Braço Direito",  attr: "power" },
  { id: "left_arm",  label: "Braço Esquerdo", attr: "power" },
  { id: "right_leg", label: "Perna Direita",  attr: "defense" },
  { id: "left_leg",  label: "Perna Esquerda", attr: "defense" },
  { id: "torso",     label: "Tronco",         attr: "constitution" },
];

export const CYBORG_LOCATIONS_BY_ID = Object.fromEntries(
  CYBORG_LOCATIONS.map(l => [l.id, l]),
) as Record<CyborgShiftLocation, CyborgLocationData>;

/** Ex.: "+4 PRE" */
export function cyborgBonusLabel(location: CyborgShiftLocation): string {
  return `+${CYBORG_SHIFT_BONUS} ${ATTR_SHORT_LABELS[CYBORG_LOCATIONS_BY_ID[location].attr]}`;
}
