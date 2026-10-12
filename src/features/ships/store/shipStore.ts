import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Ship, ShipSize, ShipOwnership, CrewMember } from "../../../shared/types/ship";
import { KLABAUTERMANN_VOYAGES, SHIP_COMODOS_BY_ID, SHIP_SIZES, SHIP_SIZES_ORDERED } from "../../../data/ships";
import { COMMISSIONED_SHIP_PRESET } from "../../../data/factions";
import { usedComodoSlots } from "../utils/shipCalc";

// ─── State shape ──────────────────────────────────────────────────────────────

interface ShipState {
  ships: Ship[];
  activeShipId: string | null;
}

interface ShipActions {
  addShip: (name: string, size: ShipSize, builtByEngineer?: boolean) => void;
  deleteShip: (id: string) => void;
  updateShip: (id: string, updater: (ship: Ship) => void) => void;
  setActiveShip: (id: string | null) => void;

  // Crew
  addCrewMember: (shipId: string, member: Omit<CrewMember, "id">) => void;
  removeCrewMember: (shipId: string, memberId: string) => void;

  // Mechanisms (max 2)
  addMechanism: (shipId: string, mechanismId: string) => void;
  removeMechanism: (shipId: string, mechanismId: string) => void;

  // Cômodos (slot-limited per size)
  addComodo: (shipId: string, comodoId: string) => void;
  removeComodo: (shipId: string, comodoId: string) => void;

  // Hull
  updateHull: (shipId: string, delta: number) => void;

  // Klabautermann
  incrementVoyage: (shipId: string) => void;
  unlockKlabautermannWithDiscount: (shipId: string) => void;

  // Ownership
  updateOwnership: (shipId: string, ownership: ShipOwnership) => void;

  // Commissioned ships (created via faction rank in Character Builder)
  addCommissionedShip: (
    name: string,
    ownership: Exclude<ShipOwnership, "owned">,
    characterOwnerId: string,
  ) => string;

  // Size upgrade (cost = new price − old price, keeps all improvements)
  upgradeShipSize: (shipId: string, newSize: ShipSize) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createBlankShip(name: string, size: ShipSize, builtByEngineer = false): Ship {
  const maxHull = SHIP_SIZES[size].maxHull;
  return {
    id: crypto.randomUUID(),
    name,
    size,
    currentHull: maxHull,
    maxHull,
    mechanisms: [],
    comodoIds: [],
    crew: [],
    klabautermann: { active: false, voyageCount: 0 },
    notes: "",
    builtByEngineer,
    ownership: "owned",
    klabautermannUnlockedWithDiscount: false,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useShipStore = create<ShipState & ShipActions>()(
  persist(
    immer((set) => {
      /** Aplica `fn` ao navio `shipId` (no-op se não existir) */
      const withShip = (shipId: string, fn: (ship: Ship) => void) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (ship) fn(ship);
        });
      };

      return {
        ships: [],
        activeShipId: null,

        addShip: (name, size, builtByEngineer = false) => {
          const ship = createBlankShip(name, size, builtByEngineer);
          set(state => { state.ships.push(ship); state.activeShipId = ship.id; });
        },

        deleteShip: (id) => {
          set(state => {
            state.ships = state.ships.filter(s => s.id !== id);
            if (state.activeShipId === id) state.activeShipId = null;
          });
        },

        updateShip: (id, updater) => withShip(id, updater),

        setActiveShip: (id) => {
          set(state => { state.activeShipId = id; });
        },

        addCrewMember: (shipId, member) => withShip(shipId, ship => {
          ship.crew.push({ ...member, id: crypto.randomUUID() });
        }),

        removeCrewMember: (shipId, memberId) => withShip(shipId, ship => {
          ship.crew = ship.crew.filter(m => m.id !== memberId);
        }),

        addMechanism: (shipId, mechanismId) => withShip(shipId, ship => {
          if (ship.mechanisms.length >= SHIP_SIZES[ship.size].maxMechanisms) return;
          if (ship.mechanisms.includes(mechanismId)) return;
          ship.mechanisms.push(mechanismId);
        }),

        removeMechanism: (shipId, mechanismId) => withShip(shipId, ship => {
          ship.mechanisms = ship.mechanisms.filter(m => m !== mechanismId);
        }),

        addComodo: (shipId, comodoId) => withShip(shipId, ship => {
          if (ship.comodoIds.includes(comodoId)) return;
          const comodo = SHIP_COMODOS_BY_ID[comodoId];
          if (!comodo) return;
          if (usedComodoSlots(ship.comodoIds) + comodo.size > SHIP_SIZES[ship.size].comodoSlots) return;
          ship.comodoIds.push(comodoId);
        }),

        removeComodo: (shipId, comodoId) => withShip(shipId, ship => {
          ship.comodoIds = ship.comodoIds.filter(c => c !== comodoId);
        }),

        updateHull: (shipId, delta) => withShip(shipId, ship => {
          ship.currentHull = Math.max(0, Math.min(ship.maxHull, ship.currentHull + delta));
        }),

        incrementVoyage: (shipId) => withShip(shipId, ship => {
          ship.klabautermann.voyageCount += 1;
          if (!ship.klabautermann.active && ship.klabautermann.voyageCount >= KLABAUTERMANN_VOYAGES) {
            ship.klabautermann.active = true;
          }
        }),

        unlockKlabautermannWithDiscount: (shipId) => withShip(shipId, ship => {
          if (ship.klabautermann.active) return;
          ship.klabautermann.active = true;
          ship.klabautermannUnlockedWithDiscount = true;
        }),

        updateOwnership: (shipId, ownership) => withShip(shipId, ship => {
          ship.ownership = ownership;
        }),

        addCommissionedShip: (name, ownership, characterOwnerId) => {
          const id = crypto.randomUUID();
          const base = createBlankShip(name, COMMISSIONED_SHIP_PRESET.size, false);
          const ship: Ship = {
            ...base,
            id,
            mechanisms: [...COMMISSIONED_SHIP_PRESET.mechanisms],
            comodoIds:  [...COMMISSIONED_SHIP_PRESET.comodoIds],
            ownership,
            characterOwnerId,
          };
          set(state => { state.ships.push(ship); state.activeShipId = id; });
          return id;
        },

        upgradeShipSize: (shipId, newSize) => withShip(shipId, ship => {
          const currentIdx = SHIP_SIZES_ORDERED.indexOf(ship.size);
          const newIdx     = SHIP_SIZES_ORDERED.indexOf(newSize);
          if (newIdx <= currentIdx) return;
          ship.size    = newSize;
          ship.maxHull = SHIP_SIZES[newSize].maxHull;
          // currentHull kept as-is; mechanisms and comodoIds preserved
        }),
      };
    }),
    {
      name: "bnw-ships",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ships: state.ships }),
    }
  )
);
