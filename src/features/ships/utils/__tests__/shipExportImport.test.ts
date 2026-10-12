import { describe, it, expect } from "vitest";
import type { Ship } from "../../../../shared/types/ship";
import { exportShipToForumHTML, exportShipToJSONString } from "../shipExporter";
import { parseShipImport } from "../shipImporter";

function createShipFixture(overrides: Partial<Ship> = {}): Ship {
  return {
    id: "ship-1",
    name: "Going Teste",
    size: "medio",
    currentHull: 20,
    maxHull: 30,
    mechanisms: ["submarino"],
    comodoIds: ["escritorio", "biblioteca"],
    crew: [
      { id: "m1", name: "Luffy", role: "captain" },
      { id: "m2", name: "Nami", role: "navigator" },
    ],
    klabautermann: { active: false, voyageCount: 4 },
    notes: "",
    builtByEngineer: true,
    ownership: "owned",
    klabautermannUnlockedWithDiscount: false,
    ...overrides,
  };
}

describe("exportShipToForumHTML — snapshot", () => {
  it("navio com mecanismo, cômodos e tripulação", () => {
    expect(exportShipToForumHTML(createShipFixture())).toMatchSnapshot();
  });
});

describe("round-trip navio", () => {
  const ship = createShipFixture();

  it("JSON", () => {
    const result = parseShipImport(exportShipToJSONString(ship));
    expect(result.status).not.toBe("error");
    expect(result.ship).toMatchObject({
      name: ship.name, size: ship.size, mechanisms: ship.mechanisms, comodoIds: ship.comodoIds,
      builtByEngineer: true, ownership: "owned",
    });
  });

  it("fórum", () => {
    const result = parseShipImport(exportShipToForumHTML(ship));
    expect(result.status).not.toBe("error");
    expect(result.ship).toMatchObject({
      name: ship.name, size: ship.size, mechanisms: ship.mechanisms, comodoIds: ship.comodoIds,
      builtByEngineer: true, ownership: "owned",
      klabautermann: { active: false, voyageCount: 4 },
    });
    expect(result.ship?.crew.map(c => [c.name, c.role])).toEqual([["Luffy", "captain"], ["Nami", "navigator"]]);
  });
});
