// ─── Ship types ───────────────────────────────────────────────────────────────

export type ShipSize =
  | "individual" | "pequeno" | "medio" | "grande" | "gigante" | "colossal";

export type ShipRole =
  | "captain" | "first_mate" | "navigator" | "doctor"
  | "cook" | "shipwright" | "musician" | "sniper" | "archaeologist" | "crew";

// ─── Static data interfaces (used in data/ships.ts) ──────────────────────────

export interface ShipSizeData {
  id: ShipSize;
  name: string;
  price: number;              // Berries
  percepaoRequired: number;   // 0–5 navigator Percepção requirement
  maxCrew: number;
  maxMechanisms: number;      // always 2
  comodoSlots: number;        // total slot capacity for cômodos
}

export interface ShipMechanismData {
  id: string;
  name: string;
  description: string;
  /** Price in Berries */
  price: number;
}

export interface ShipComodoData {
  id: string;
  name: string;
  description: string;
  size: 1 | 2 | 3;           // cômodo slot cost
  /** Price in Berries */
  price: number;
  /** In-game mechanical bonus */
  bonus: string;
}

// ─── Character/instance interfaces ───────────────────────────────────────────

export interface CrewMember {
  id: string;
  name: string;
  role: ShipRole;
  /** Character ID if linked to a builder character */
  characterId?: string;
}

export interface KlabautermannData {
  active: boolean;
  voyageCount: number;        // awakens at 10
}

export interface Ship {
  id: string;
  name: string;
  size: ShipSize;
  /** Current hull points */
  currentHull: number;
  /** Maximum hull points (derived from size at creation) */
  maxHull: number;
  /** Selected mechanism IDs (max 2) */
  mechanisms: string[];
  /** Selected cômodo IDs (total slot cost ≤ comodoSlots for the ship's size) */
  comodoIds: string[];
  crew: CrewMember[];
  klabautermann: KlabautermannData;
  notes: string;
  /** Whether the ship was built by an Engenheiro (30% cheaper) */
  builtByEngineer: boolean;
}
