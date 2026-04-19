import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Character } from "../../../shared/types/character";
import { validateCharacter, blankPericias } from "../utils/attrCalc";
import { computeGemBudget, type GemBudgetResult } from "../utils/gemBudget";

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
}

// ─── Default character factory ────────────────────────────────────────────────

function createBlankCharacter(name: string, gemBudget = 20, level = 1): Character {
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

      newCharacter: (name, gemBudget = 20, level = 1) => {
        const char = createBlankCharacter(name, gemBudget, level);
        set(state => {
          state.draft = char;
          state.errors = validateCharacter(char);
          state.budget = computeGemBudget(char);
        });
      },

      loadCharacter: (id) => {
        let found = get().saved.find(c => c.id === id) ?? null;
        if (!found) return;
        // Backward compat: migrate pre-pericias characters saved in localStorage
        if (!(found as any).pericias) {
          const legacy = found as any;
          found = {
            ...found,
            pericias: { ...blankPericias(), ambicao: Number(legacy.ambition) || 0 },
            humanPericiaChoice: null,
            professions: [],
          };
        }
        set(state => {
          state.draft = found;
          state.errors = validateCharacter(found!);
          state.budget = computeGemBudget(found!);
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
          state.errors = validateCharacter(state.draft);
          state.budget = computeGemBudget(state.draft);
        });
      },

      revalidate: () => {
        const draft = get().draft;
        if (!draft) return;
        set(state => {
          state.errors = validateCharacter(draft);
          state.budget = computeGemBudget(draft);
        });
      },
    })),
    {
      name: "bnw-characters",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ saved: state.saved }),
    }
  )
);
