import type { Character, Technique, BaseAttributes, ZoanPoint } from "./character";

// ─── Combat Setup ─────────────────────────────────────────────────────────────

export type CombatMode = "jxj" | "vs_npc";

export interface ActiveBuffs {
  /** Haki Armament active: +POD, +CON temp */
  hakiArmament: boolean;
  /** Haki Observation active: +PRE, +DEF */
  hakiObservation: boolean;
  /** King Haki active */
  hakiKing: boolean;
  /** Advanced Haki active (additional layer) */
  hakiAdvanced: boolean;
  /** Which Zoan point is active (null = none / human form) */
  zoanPoint: ZoanPoint["id"] | null;
  /** Logia Elemental Domain active (Rank S) */
  logiaElementalDomain: boolean;
}

export interface TurnChoice {
  offensive: Technique | null;
  defensive: Technique | null;
  buffs: ActiveBuffs;
  /** Whether to use Elementalista (+1 EN, applies Status Enhanced to every attack) */
  useElementalista: boolean;
}

// ─── Combat State ─────────────────────────────────────────────────────────────

export interface CombatantState {
  character: Character;
  currentCon: number;
  currentEnergy: number;
  /** Whether Retém 1 CON has already been used this adventure */
  retemUsed: boolean;
  /** Active temporary CON bonuses (Haki temp, technique CON) */
  tempConStack: { source: string; value: number }[];
  /** Active status effects received */
  statusEffects: ActiveStatus[];
}

export interface ActiveStatus {
  type: string;
  penaltyAttr: keyof BaseAttributes | null;
  penaltyValue: number;
  directDamage: number;
  turnsRemaining: number;
  source: "status_enhanced" | "adherence";
}

// ─── Roll Results ──────────────────────────────────────────────────────────────

export interface DiceRoll {
  dice: [number, number, number]; // 3d6
  total: number;
  isCriticalSuccess: boolean; // all 6s
  isCriticalFail: boolean;    // all 1s
}

export interface AttackRollResult {
  roll: DiceRoll;
  attackerTotal: number; // PRE + BPN + modifiers + roll
  defenderThreshold: number; // DEF + BPN + 10 + modifiers
  hit: boolean;
}

export interface DamageResult {
  rawDamage: number;        // POD + modifiers
  tempConAbsorbed: number;  // Haki temp CON consumed
  baseConDamage: number;    // damage to actual CON
  directConDamage: number;  // damage bypassing temp CON (Kitetsu, Ryuo etc.)
  isKnockout: boolean;
  retemActivated: boolean;  // true if Retém 1 CON saved the character
}

// ─── Turn Log ─────────────────────────────────────────────────────────────────

export type TurnEventType =
  | "attack" | "defense" | "damage" | "status" | "buff_activate"
  | "buff_deactivate" | "knockout" | "retem" | "energy_cost"
  | "system" | "critical";

export interface TurnEvent {
  type: TurnEventType;
  actorId: string;
  targetId?: string;
  description: string;
  numerics?: Record<string, number>;
  roll?: DiceRoll;
}

export interface TurnResult {
  turnNumber: number;
  events: TurnEvent[];
  stateAfter: [CombatantState, CombatantState];
  /** Who acts first in the NEXT turn (most wounded) */
  nextActorId: string | null;
  combatEnded: boolean;
  winner: string | null; // character id
}

// ─── Combat Summary ───────────────────────────────────────────────────────────

export interface CombatSummary {
  mode: CombatMode;
  turns: TurnResult[];
  winner: string | null;
  turnsCount: number;
  finalStates: [CombatantState, CombatantState];
  /** Narration-ready text for posting in the forum */
  narration: string;
}

// ─── Probability Matrix ───────────────────────────────────────────────────────

export type TechChoiceKey = "pre_def" | "pre_con" | "pod_def" | "pod_con";

export interface ProbabilityCell {
  a1Choice: TechChoiceKey;
  a2Choice: TechChoiceKey;
  /** "a1" | "a2" | "draw" */
  outcome: "a1" | "a2" | "draw";
  probability: number; // 0–1
  summary: string;
}

export interface ProbabilityMatrix {
  cells: ProbabilityCell[];
  nashEquilibrium: {
    a1Strategy: Record<TechChoiceKey, number>; // probability mix
    a2Strategy: Record<TechChoiceKey, number>;
    expectedOutcome: { a1WinRate: number; a2WinRate: number; drawRate: number };
  };
}
