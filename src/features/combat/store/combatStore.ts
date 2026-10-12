import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Character } from "../../../shared/types/character";
import type { TurnChoice, CombatSummary, CombatMode } from "../../../shared/types/combat";
import { simulateCombat } from "../engine/combatEngine";

interface CombatState {
  mode: CombatMode;
  charA: Character | null;
  charB: Character | null;
  /** Turn-by-turn choices, indexed by turn number */
  choices: { a: TurnChoice; b: TurnChoice }[];
  result: CombatSummary | null;
  isRunning: boolean;
  useAverage: boolean;
}

interface CombatActions {
  setMode: (mode: CombatMode) => void;
  setCharA: (char: Character | null) => void;
  setCharB: (char: Character | null) => void;
  setChoice: (turn: number, side: "a" | "b", choice: TurnChoice) => void;
  addTurn: () => void;
  removeTurn: (index: number) => void;
  toggleAverage: () => void;
  simulate: () => void;
  reset: () => void;
}

function defaultChoice(): TurnChoice {
  return {
    offensive: null,
    defensive: null,
    buffs: {
      hakiArmament: false,
      hakiObservation: false,
      hakiKing: false,
      hakiAdvanced: false,
      zoanPoint: null,
      logiaElementalDomain: false,
    },
    useElementalista: false,
  };
}

export const useCombatStore = create<CombatState & CombatActions>()(
  immer((set, get) => ({
    mode: "jxj",
    charA: null,
    charB: null,
    choices: [{ a: defaultChoice(), b: defaultChoice() }],
    result: null,
    isRunning: false,
    useAverage: false,

    setMode: (mode) => set(s => { s.mode = mode; }),
    setCharA: (char) => set(s => { s.charA = char; s.result = null; }),
    setCharB: (char) => set(s => { s.charB = char; s.result = null; }),

    setChoice: (turn, side, choice) => {
      set(s => {
        if (!s.choices[turn]) return;
        s.choices[turn][side] = choice;
      });
    },

    addTurn: () => {
      set(s => { s.choices.push({ a: defaultChoice(), b: defaultChoice() }); });
    },

    removeTurn: (index) => {
      set(s => { s.choices.splice(index, 1); });
    },

    toggleAverage: () => {
      set(s => { s.useAverage = !s.useAverage; });
    },

    simulate: () => {
      const { charA, charB, choices, mode, useAverage } = get();
      if (!charA || !charB) return;
      set(s => { s.isRunning = true; });

      // Run in a microtask to allow UI to update "running" state
      setTimeout(() => {
        const result = simulateCombat(charA, charB, choices, mode, useAverage);
        set(s => { s.result = result; s.isRunning = false; });
      }, 0);
    },

    reset: () => {
      set(s => {
        s.result = null;
        s.choices = [{ a: defaultChoice(), b: defaultChoice() }];
      });
    },
  }))
);
