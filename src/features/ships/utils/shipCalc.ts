import type { Ship } from "../../../shared/types/ship";
import {
  ENGINEER_DISCOUNT, KLABAUTERMANN_DISCOUNT_PRICE,
  SHIP_COMODOS_BY_ID, SHIP_MECHANISMS_BY_ID, SHIP_SIZES,
} from "../../../data/ships";

/** Slots de cômodo ocupados pelos cômodos instalados */
export function usedComodoSlots(comodoIds: string[]): number {
  return comodoIds.reduce((sum, id) => sum + (SHIP_COMODOS_BY_ID[id]?.size ?? 0), 0);
}

/** Desconto (Berries) do Engenheiro sobre o preço do casco */
export function engineerDiscount(hullPrice: number): number {
  return Math.floor(hullPrice * ENGINEER_DISCOUNT);
}

/** Preço do casco já com o desconto de Engenheiro, se aplicável */
export function shipHullPrice(ship: Pick<Ship, "size" | "builtByEngineer">): number {
  const price = SHIP_SIZES[ship.size].price;
  return ship.builtByEngineer ? price - engineerDiscount(price) : price;
}

/** Valor total do navio: casco + mecanismos + cômodos + Klabautermann via desconto */
export function computeShipTotalPrice(ship: Ship): number {
  let total = shipHullPrice(ship);
  for (const id of ship.mechanisms) total += SHIP_MECHANISMS_BY_ID[id]?.price ?? 0;
  for (const id of ship.comodoIds) total += SHIP_COMODOS_BY_ID[id]?.price ?? 0;
  if (ship.klabautermannUnlockedWithDiscount) total += KLABAUTERMANN_DISCOUNT_PRICE;
  return total;
}
