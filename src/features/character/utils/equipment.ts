import type { Character, Equipment, UniqueWeapon, UniqueWeaponCharacteristic } from "../../../shared/types/character";

/** Type guard: o equipamento é uma Arma Única (tem característica)? */
export function isUniqueWeapon(eq: Equipment | UniqueWeapon | null | undefined): eq is UniqueWeapon {
  return !!eq && "characteristic" in eq;
}

/** O personagem tem equipada a Arma Única com a característica `trait`? */
export function hasWeaponTrait(char: Pick<Character, "equippedWeapon">, trait: UniqueWeaponCharacteristic): boolean {
  return isUniqueWeapon(char.equippedWeapon) && char.equippedWeapon.characteristic === trait;
}
