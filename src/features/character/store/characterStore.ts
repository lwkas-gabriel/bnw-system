import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Character } from "../../../shared/types/character";
import { validateCharacter, blankPericias } from "../utils/attrCalc";
import { computeGemBudget, type GemBudgetResult } from "../utils/gemBudget";
import { GEM_BUDGET_MIN } from "../../../data/gemCosts";

// ─── State shape ──────────────────────────────────────────────────────────────

interface CharacterState {
  /** The character currently being edited */
  draft: Character | null;
  /** All saved characters */
  saved: Character[];
  /** Validation errors for the current draft */
  errors: Record<string, string[]>;
  /** Gem budget snapshot */
  budget: GemBudgetResult | null;
}

interface CharacterActions {
  /** Start a new blank character */
  newCharacter: (name: string, gemBudget?: number, level?: number) => void;
  /** Load a saved character into the draft */
  loadCharacter: (id: string) => void;
  /** Save (or overwrite) the current draft */
  saveDraft: () => void;
  /** Delete a saved character */
  deleteCharacter: (id: string) => void;
  /** Apply a partial update to the draft and re-validate */
  updateDraft: (updater: (char: Character) => void) => void;
  /** Recompute validation and budget */
  revalidate: () => void;
  /** Link or unlink a commissioned ship to the current draft */
  setCommissionedShip: (shipId: string | undefined) => void;
}

// ─── Default character factory ────────────────────────────────────────────────

function createBlankCharacter(name: string, gemBudget = GEM_BUDGET_MIN, level = 1): Character {
  return {
    id: crypto.randomUUID(),
    name,
    level,
    race: "human",
    investedAttributes: { power: 0, precision: 0, defense: 0, constitution: 0 },
    racialBonus: {},
    pericias: blankPericias(),
    humanPericiaChoice: null,
    professions: [],
    energy: { bpn: 0, energy: 3, energyInvested: 0 },
    haki: null,
    akuma: null,
    artesMarciais: null,
    cyborg: null,
    techniques: [],
    equippedWeapon: null,
    equippedDefensive: [null, null],
    gemsSpent: 0,
    gemBudget,
    location: "blues",
    companions: [],
  };
}

/** Estado derivado do draft: erros de validação e orçamento de gemas */
function derivedState(char: Character): Pick<CharacterState, "errors" | "budget"> {
  return { errors: validateCharacter(char), budget: computeGemBudget(char) };
}

/** Compat: personagens salvos antes das perícias tinham só `ambition` */
function migrateLegacyCharacter(char: Character): Character {
  if (char.pericias) return char;
  const legacy = char as Character & { ambition?: number };
  return {
    ...char,
    pericias: { ...blankPericias(), ambicao: Number(legacy.ambition) || 0 },
    humanPericiaChoice: null,
    professions: [],
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCharacterStore = create<CharacterState & CharacterActions>()(
  persist(
    immer((set, get) => ({
      draft: null,
      saved: [],
      errors: {},
      budget: null,

      newCharacter: (name, gemBudget = GEM_BUDGET_MIN, level = 1) => {
        const char = createBlankCharacter(name, gemBudget, level);
        set(state => {
          state.draft = char;
          Object.assign(state, derivedState(char));
        });
      },

      loadCharacter: (id) => {
        const saved = get().saved.find(c => c.id === id);
        if (!saved) return;
        const char = migrateLegacyCharacter(saved);
        set(state => {
          state.draft = char;
          Object.assign(state, derivedState(char));
        });
      },

      saveDraft: () => {
        const draft = get().draft;
        if (!draft) return;
        set(state => {
          const idx = state.saved.findIndex(c => c.id === draft.id);
          if (idx >= 0) state.saved[idx] = draft;
          else state.saved.push(draft);
        });
      },

      deleteCharacter: (id) => {
        set(state => {
          state.saved = state.saved.filter(c => c.id !== id);
          if (state.draft?.id === id) state.draft = null;
        });
      },

      updateDraft: (updater) => {
        set(state => {
          if (!state.draft) return;
          updater(state.draft);
          Object.assign(state, derivedState(state.draft));
        });
      },

      setCommissionedShip: (shipId) => {
        set(state => {
          if (!state.draft) return;
          state.draft.commissionedShipId = shipId;
        });
      },

      revalidate: () => {
        const draft = get().draft;
        if (!draft) return;
        set(state => { Object.assign(state, derivedState(draft)); });
      },
    })),
    {
      name: "bnw-characters",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ saved: state.saved }),
    }
  )
);
