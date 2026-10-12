import { describe, it, expect, beforeEach } from "vitest";
import { useShipStore } from "../shipStore";
import { SHIP_SIZES } from "../../../../data/ships";

const store = () => useShipStore.getState();

describe("shipStore", () => {
  beforeEach(() => useShipStore.setState({ ships: [], activeShipId: null }));

  it("cria navio com casco do tamanho e o torna ativo", () => {
    store().addShip("Going", "medio");
    const ship = store().ships[0];
    expect(ship.maxHull).toBe(SHIP_SIZES.medio.maxHull);
    expect(store().activeShipId).toBe(ship.id);
  });

  it("respeita limite de mecanismos e não duplica", () => {
    store().addShip("Going", "medio");
    const id = store().ships[0].id;
    store().addMechanism(id, "submarino");
    store().addMechanism(id, "submarino");
    store().addMechanism(id, "aeronave");
    store().addMechanism(id, "tanque");
    expect(store().ships[0].mechanisms).toEqual(["submarino", "aeronave"]);
  });

  it("respeita slots de cômodo do tamanho", () => {
    store().addShip("Bote", "individual"); // 0 slots
    const id = store().ships[0].id;
    store().addComodo(id, "escritorio");
    expect(store().ships[0].comodoIds).toEqual([]);
  });

  it("casco fica entre 0 e o máximo; Klabautermann desperta após as viagens", () => {
    store().addShip("Going", "pequeno");
    const id = store().ships[0].id;
    store().updateHull(id, -999);
    expect(store().ships[0].currentHull).toBe(0);
    store().updateHull(id, 999);
    expect(store().ships[0].currentHull).toBe(SHIP_SIZES.pequeno.maxHull);
    for (let i = 0; i < 10; i++) store().incrementVoyage(id);
    expect(store().ships[0].klabautermann.active).toBe(true);
  });

  it("upgrade só aumenta de tamanho e preserva melhorias", () => {
    store().addShip("Going", "medio");
    const id = store().ships[0].id;
    store().addMechanism(id, "submarino");
    store().upgradeShipSize(id, "pequeno");
    expect(store().ships[0].size).toBe("medio");
    store().upgradeShipSize(id, "grande");
    expect(store().ships[0]).toMatchObject({ size: "grande", maxHull: SHIP_SIZES.grande.maxHull, mechanisms: ["submarino"] });
  });

  it("ações em navio inexistente não quebram", () => {
    expect(() => store().addCrewMember("nope", { name: "X", role: "crew" })).not.toThrow();
  });
});
