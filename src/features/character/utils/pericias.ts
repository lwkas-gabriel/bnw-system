import type { Character, PericiaId } from "../../../shared/types/character";
import { BUGIGANGAS_BY_ID } from "../../../data/bugigangas";
import { RACE_PERICIA_BONUS, ZOAN_CLASS_PERICIA_BONUS } from "../../../data/pericias";
import { raceForumLabel } from "../../../data/races";

export interface PericiaBonus {
  /** Origem do bônus, como aparece na ficha ("Raça: Humano", "Zoan", "Bugiganga: X") */
  label: string;
  value: number;
}

/**
 * Bônus de perícia fora da graduação investida: raça (ou escolha do Humano),
 * classe Zoan e bugigangas (shifts de Ciborgue e equipamentos).
 */
export function computePericiaBonuses(char: Character): Partial<Record<PericiaId, PericiaBonus[]>> {
  const result: Partial<Record<PericiaId, PericiaBonus[]>> = {};

  function add(pericia: PericiaId | undefined | null, label: string, value: number) {
    if (!pericia) return;
    (result[pericia] ??= []).push({ label, value });
  }

  // Racial / human choice
  if (char.race === "human") {
    add(char.humanPericiaChoice, "Raça: Humano", 1);
  } else {
    add(RACE_PERICIA_BONUS[char.race], `Raça: ${raceForumLabel(char.race)}`, 1);
  }

  // Zoan class bonus
  if (char.akuma?.type === "zoan") {
    add(ZOAN_CLASS_PERICIA_BONUS[char.akuma.animalClass], "Zoan", 1);
  }

  // Cyborg shift bugigangas (referenced by ID)
  for (const shift of char.cyborg?.shifts ?? []) {
    const bug = shift.bugigangaId ? BUGIGANGAS_BY_ID[shift.bugigangaId] : undefined;
    if (bug?.periciaBonus) add(bug.periciaBonus.pericia, `Bugiganga: ${bug.name}`, bug.periciaBonus.value);
  }

  // Equipment bugigangas (embedded)
  for (const eq of [char.equippedWeapon, ...char.equippedDefensive]) {
    const bug = eq?.bugiganga;
    if (bug?.periciaBonus) add(bug.periciaBonus.pericia, `Bugiganga: ${bug.name}`, bug.periciaBonus.value);
  }

  return result;
}

/** Valor efetivo da perícia: graduação investida + todos os bônus (raça, Zoan, bugigangas) */
export function periciaTotal(char: Character, id: PericiaId): number {
  const bonuses = computePericiaBonuses(char)[id] ?? [];
  return (char.pericias?.[id] ?? 0) + bonuses.reduce((sum, b) => sum + b.value, 0);
}
