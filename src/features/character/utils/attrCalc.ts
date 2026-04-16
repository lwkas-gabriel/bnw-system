import type { Character } from "../../../shared/types/character";

/** Total points a character has to distribute: 6 + level + racial bonus slots */
export function totalAttributePoints(level: number, racialFreePoints: number = 0): number {
  return 6 + level + racialFreePoints;
}

/** BPN formula: floor(level * 3/4) */
export function bpn(level: number): number {
  return Math.floor((level * 3) / 4);
}

/** Energy formula: level * 3 + gems invested in energy */
export function energyMax(level: number, gemsInvestedInEnergy: number): number {
  return level * 3 + gemsInvestedInEnergy;
}

/** Remaining gem budget */
export function remainingGems(budget: number, spent: number): number {
  return budget - spent;
}

/**
 * Validates that the invested attribute points don't exceed the character's total.
 * Returns an array of error messages (empty if valid).
 */
export function validateAttributes(char: Character): string[] {
  const errors: string[] = [];

  const totalInvested =
    char.investedAttributes.power +
    char.investedAttributes.precision +
    char.investedAttributes.defense +
    char.investedAttributes.constitution;

  const maxPoints = totalAttributePoints(char.level);

  if (totalInvested > maxPoints) {
    errors.push(
      `Pontos investidos (${totalInvested}) excedem o máximo disponível (${maxPoints}) para o nível ${char.level}.`
    );
  }

  if (char.investedAttributes.power < 0)        errors.push("Poder não pode ser negativo.");
  if (char.investedAttributes.precision < 0)    errors.push("Precisão não pode ser negativa.");
  if (char.investedAttributes.defense < 0)      errors.push("Defesa não pode ser negativa.");
  if (char.investedAttributes.constitution < 0) errors.push("Constituição não pode ser negativa.");

  return errors;
}

/** Validates the gem budget doesn't exceed total available */
export function validateGems(char: Character): string[] {
  const errors: string[] = [];
  if (char.gemsSpent > char.gemBudget) {
    errors.push(
      `Gemas gastas (${char.gemsSpent}) excedem o orçamento disponível (${char.gemBudget}).`
    );
  }
  return errors;
}

/** Validates Haki path progression requirements */
export function validateHaki(char: Character): string[] {
  const errors: string[] = [];
  if (!char.haki) return errors;

  // King Haki requires stage 5 of Armament or Observation
  if (char.haki.hasKing) {
    const hasStage5 =
      char.haki.primaryStage === 5 ||
      (typeof char.haki.secondaryStage === "number" && char.haki.secondaryStage === 5);
    if (!hasStage5) {
      errors.push("Haki do Rei requer estágio 5 no Haki do Armamento ou da Observação.");
    }
  }

  // Advanced Haki requires New World
  if (char.haki.kingStage === "advanced" && char.location !== "new_world") {
    errors.push("Haki do Rei Avançado requer estar no New World.");
  }

  return errors;
}

/**
 * Returns a full validation report for a character.
 * Used by the Character Builder to show inline errors.
 */
export function validateCharacter(char: Character): Record<string, string[]> {
  return {
    attributes: validateAttributes(char),
    gems:       validateGems(char),
    haki:       validateHaki(char),
  };
}

/**
 * Suggested attribute investment order for a given turn count
 * (used by the optimizer in the builder).
 *
 * Priority based on combat analysis:
 * - CON and POD alternate as primary
 * - PRE every ~5 levels
 * - DEF last (Haki Observation and AM already provide flat DEF)
 */
export function suggestedAttributeForLevel(level: number): keyof Character["investedAttributes"] {
  const preLevels = new Set([3, 8, 13, 18, 23, 28, 33, 38]);
  if (preLevels.has(level)) return "precision";
  return level % 2 === 1 ? "constitution" : "power";
}
