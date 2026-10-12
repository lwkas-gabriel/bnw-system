import type { Equipment, EquipmentSlot } from "../../../../shared/types/character";
import { SLOT_ATTRS } from "../../../../data/equipment";

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFENSIVE_SLOTS: EquipmentSlot[] = ["head", "arms", "torso", "legs"];

// ─── Blank Equipment Factory ──────────────────────────────────────────────────

export function blankEquipment(slot: EquipmentSlot): Equipment {
  const attrs = SLOT_ATTRS[slot];
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    slot,
    quality: "common",
    bonusAttr: attrs[0],
    bonusValue: 0,
  };
}
