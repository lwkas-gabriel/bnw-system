import type { Character } from "../../../shared/types/character";
import { hasReachedFaixa } from "../../../data/artesMarciais";
import { isUniqueWeapon } from "./equipment";

/**
 * A Arma Única equipada foi obtida (gratuitamente) pela Faixa Laranja?
 * Regra: Laranja ou superior e a escolha da Laranja não foi "techniques"
 * (escolha ainda nula conta como Arma Única).
 */
export function isUniqueWeaponFromLaranja(char: Pick<Character, "equippedWeapon" | "artesMarciais">): boolean {
  return isUniqueWeapon(char.equippedWeapon)
    && hasReachedFaixa(char.artesMarciais?.currentFaixa, "laranja")
    && char.artesMarciais?.laranjaChoice !== "techniques";
}
