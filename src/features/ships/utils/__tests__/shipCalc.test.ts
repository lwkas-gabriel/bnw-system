import { describe, it, expect } from "vitest";
import { computeShipTotalPrice, engineerDiscount, shipHullPrice, usedComodoSlots } from "../shipCalc";
import { SHIP_COMODOS_BY_ID, SHIP_MECHANISMS_BY_ID, SHIP_SIZES } from "../../../../data/ships";
import type { Ship } from "../../../../shared/types/ship";

const ship: Ship = {
  id: "s", name: "S", size: "medio", currentHull: 40, maxHull: 40,
  mechanisms: ["submarino"], comodoIds: ["escritorio", "biblioteca"], crew: [],
  klabautermann: { active: false, voyageCount: 0 }, notes: "",
  builtByEngineer: true, ownership: "owned", klabautermannUnlockedWithDiscount: false,
};

describe("shipCalc", () => {
  it("usedComodoSlots soma o tamanho dos cômodos", () => {
    expect(usedComodoSlots(ship.comodoIds)).toBe(SHIP_COMODOS_BY_ID.escritorio.size + SHIP_COMODOS_BY_ID.biblioteca.size);
    expect(usedComodoSlots(["inexistente"])).toBe(0);
  });

  it("desconto de Engenheiro é 30% do casco", () => {
    expect(engineerDiscount(15_000_000)).toBe(4_500_000);
    expect(shipHullPrice(ship)).toBe(10_500_000);
    expect(shipHullPrice({ ...ship, builtByEngineer: false })).toBe(SHIP_SIZES.medio.price);
  });

  it("preço total = casco + mecanismos + cômodos", () => {
    const expected = 10_500_000 + SHIP_MECHANISMS_BY_ID.submarino.price
      + SHIP_COMODOS_BY_ID.escritorio.price + SHIP_COMODOS_BY_ID.biblioteca.price;
    expect(computeShipTotalPrice(ship)).toBe(expected);
  });
});
