import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Ship, ShipSize, ShipOwnership, CrewMember } from "../../../shared/types/ship";
import { SHIP_MAX_HULL, SHIP_SIZES, SHIP_SIZES_ORDERED } from "../../../data/ships";
import { COMMISSIONED_SHIP_PRESET } from "../../../data/factions";
import { SHIP_COMODOS_BY_ID } from "../../../data/ships";

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

function usedComodoSlots(comodoIds: string[]): number {
  return comodoIds.reduce((sum, id) => {
    const comodo = SHIP_COMODOS_BY_ID[id];
    return sum + (comodo?.size ?? 0);
  }, 0);
}

function createBlankShip(name: string, size: ShipSize, builtByEngineer = false): Ship {
  const maxHull = SHIP_MAX_HULL[size];
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
    immer((set) => ({
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

      updateShip: (id, updater) => {
        set(state => {
          const ship = state.ships.find(s => s.id === id);
          if (ship) updater(ship);
        });
      },

      setActiveShip: (id) => {
        set(state => { state.activeShipId = id; });
      },

      addCrewMember: (shipId, member) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (ship) ship.crew.push({ ...member, id: crypto.randomUUID() });
        });
      },

      removeCrewMember: (shipId, memberId) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (ship) ship.crew = ship.crew.filter(m => m.id !== memberId);
        });
      },

      addMechanism: (shipId, mechanismId) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (!ship) return;
          const sizeData = SHIP_SIZES[ship.size];
          if (ship.mechanisms.length >= sizeData.maxMechanisms) return;
          if (ship.mechanisms.includes(mechanismId)) return;
          ship.mechanisms.push(mechanismId);
        });
      },

      removeMechanism: (shipId, mechanismId) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (ship) ship.mechanisms = ship.mechanisms.filter(m => m !== mechanismId);
        });
      },

      addComodo: (shipId, comodoId) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (!ship) return;
          if (ship.comodoIds.includes(comodoId)) return;
          const sizeData = SHIP_SIZES[ship.size];
          const comodo = SHIP_COMODOS_BY_ID[comodoId];
          if (!comodo) return;
          const usedSlots = usedComodoSlots(ship.comodoIds);
          if (usedSlots + comodo.size > sizeData.comodoSlots) return;
          ship.comodoIds.push(comodoId);
        });
      },

      removeComodo: (shipId, comodoId) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (ship) ship.comodoIds = ship.comodoIds.filter(c => c !== comodoId);
        });
      },

      updateHull: (shipId, delta) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (ship) {
            ship.currentHull = Math.max(0, Math.min(ship.maxHull, ship.currentHull + delta));
          }
        });
      },

      incrementVoyage: (shipId) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (!ship) return;
          ship.klabautermann.voyageCount += 1;
          if (!ship.klabautermann.active && ship.klabautermann.voyageCount >= 10) {
            ship.klabautermann.active = true;
          }
        });
      },

      unlockKlabautermannWithDiscount: (shipId) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (!ship || ship.klabautermann.active) return;
          ship.klabautermann.active = true;
          ship.klabautermannUnlockedWithDiscount = true;
        });
      },

      updateOwnership: (shipId, ownership) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (ship) ship.ownership = ownership;
        });
      },

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

      upgradeShipSize: (shipId, newSize) => {
        set(state => {
          const ship = state.ships.find(s => s.id === shipId);
          if (!ship) return;
          const currentIdx = SHIP_SIZES_ORDERED.indexOf(ship.size);
          const newIdx     = SHIP_SIZES_ORDERED.indexOf(newSize);
          if (newIdx <= currentIdx) return;
          ship.size    = newSize;
          ship.maxHull = SHIP_MAX_HULL[newSize];
          // currentHull kept as-is; mechanisms and comodoIds preserved
        });
      },
    })),
    {
      name: "bnw-ships",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ships: state.ships }),
    }
  )
);
