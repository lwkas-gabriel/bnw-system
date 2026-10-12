import type { BaseAttributes, EquipmentQuality, EquipmentSlot } from "../shared/types/character";

export const QUALITY_LABELS: Record<EquipmentQuality, string> = {
  common:    "Comum",
  splendid:  "Esplêndido",
  legendary: "Lendário",
};

/** Bônus de atributo concedido pela qualidade do equipamento */
export const QUALITY_BONUS: Record<EquipmentQuality, number> = {
  common: 0, splendid: 1, legendary: 2,
};

/** Preço em Berries por tipo de equipamento e qualidade */
export const EQUIPMENT_PRICES: Record<"weapon" | "defensive", Record<EquipmentQuality, number>> = {
  weapon:    { common: 500_000, splendid: 10_000_000, legendary: 80_000_000 },
  defensive: { common: 500_000, splendid: 5_000_000,  legendary: 40_000_000 },
};

export const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: "Arma",
  head:   "Cabeça",
  arms:   "Braços",
  torso:  "Torso",
  legs:   "Pernas",
};

/** Atributos que cada slot pode bonificar */
export const SLOT_ATTRS: Record<EquipmentSlot, (keyof BaseAttributes)[]> = {
  weapon: ["precision", "power"],
  head:   ["precision", "constitution"],
  arms:   ["precision", "defense"],
  torso:  ["constitution", "defense"],
  legs:   ["precision", "defense"],
};
