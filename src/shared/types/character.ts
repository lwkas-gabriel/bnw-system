// ─── Enums ────────────────────────────────────────────────────────────────────

export type RaceId =
  | "human" | "fishman" | "siren" | "lunar"
  | "mink" | "dwarf" | "giant" | "half_giant";

export type HakiType = "armament" | "observation" | "king";

export type HakiStage = 0 | 1 | 2 | 3 | 4 | 5 | "advanced_partial" | "advanced_complete";

export type AdvancedHakiVariant =
  | "ryuo" | "repulsion"          // Armament Advanced
  | "future_vision" | "mantra"    // Observation Advanced
  | "king_advanced";              // King Advanced

export type AkumaType = "zoan" | "logia" | "paramecia";

export type AkumaRank = "C" | "B" | "A" | "S";

export type ZoanClass = "flying" | "herbivore" | "carnivore" | "rational";

export type ParameciaClass = "corporeal" | "substantial" | "surreal";

export type AMFaixaId =
  | "branca" | "cinza" | "azul_clara" | "azul_escura" | "amarela"
  | "laranja" | "verde" | "roxa" | "marrom"
  | "preta" | "coral" | "rajada" | "vermelha" | "grao_mestre";

export type UniqueWeaponCharacteristic =
  | "ace" | "ame_no_habakiri" | "daisenso" | "durandal" | "eisen"
  | "enma" | "gryphon" | "haissaikai" | "kabuto" | "kirisama"
  | "kitetsu" | "lassoo" | "murakumogiri" | "mogura" | "nanashaku"
  | "napoleon" | "nonosama" | "oto_kogarashi" | "pretzel" | "raid_suit"
  | "shusui" | "tsuji_shibai" | "yakuza_kasen" | "yoru" | "wado_ichimonji"
  | "warabide";

// ─── Perícias ─────────────────────────────────────────────────────────────────

export type PericiaId =
  | "ambicao" | "atletismo" | "destreza" | "erudicao"
  | "expressao" | "furtividade" | "investigacao" | "logica"
  | "percepcao" | "persuasao" | "sobrevivencia";

export type CharacterPericias = Record<PericiaId, number>; // 0–5 each

export interface CharacterProfession {
  id: string;
  name: string;
  linkedPericias: PericiaId[];
}

// ─── Ciborgue ─────────────────────────────────────────────────────────────────

export type CyborgShift = 1 | 2 | 3 | 4 | 5 | 6;

export type CyborgShiftLocation =
  | "head" | "right_arm" | "left_arm"
  | "right_leg" | "left_leg" | "torso";

export type CyborgGear = "overclock" | "laser" | "drone" | "mecha" | "stealth";

export type TechniqueRank = "E" | "D" | "C" | "B" | "A";

export type TechniqueType = "offensive" | "defensive";

export type EquipmentSlot = "head" | "arms" | "torso" | "legs" | "weapon";

export type EquipmentQuality = "common" | "splendid" | "legendary";

// ─── Attributes ───────────────────────────────────────────────────────────────

export interface BaseAttributes {
  power: number;       // POD
  precision: number;   // PRE
  defense: number;     // DEF
  constitution: number; // CON
}

export interface DerivedAttributes {
  bpn: number;          // floor(level * 3/4)
  energy: number;       // level * 3 + investedGems
  energyInvested: number;
}

// ─── Technique ────────────────────────────────────────────────────────────────

export type AdherenceEffect =
  | "multiple_hit" | "anti_air" | "anti_aquatic" | "ally_bonus"
  | "confusion" | "double_edge" | "fragility" | "weakness"
  | "safety" | "vulnerability" | "aerial"
  | "area_controlled" | "consecutive_atk" | "consecutive_def" | "exhaustion"
  | "wound" | "defensive_posture";

export interface TechniqueAdherence {
  effect: AdherenceEffect;
  times: number; // how many times this effect was added
}

export interface Technique {
  id: string;
  name: string;
  description: string;
  rank: TechniqueRank;
  type: TechniqueType;
  /** Which attribute this technique boosts: power/precision (offensive) or defense/constitution (defensive) */
  targetAttr: keyof BaseAttributes;
  baseBonus: number;    // 1–5 based on rank
  energyCost: number;   // 1–5 based on rank
  adherences: TechniqueAdherence[];
  /** Source path that granted this technique for free */
  source?: "akuma" | "haki" | "artes_marciais" | "ciborgue" | "purchased";
}

// ─── Haki ─────────────────────────────────────────────────────────────────────

export interface HakiPath {
  primaryType: "armament" | "observation";
  primaryStage: HakiStage;
  secondaryType: "armament" | "observation";
  secondaryStage: HakiStage;
  hasKing: boolean;
  kingStage: "dormant" | "controlled" | "advanced" | null;
  advancedType: AdvancedHakiVariant | null;
}

// ─── Akuma no Mi ──────────────────────────────────────────────────────────────

export interface ZoanPoint {
  id: "hybrid" | "animal" | "awakened";
  primaryAttr: keyof BaseAttributes;
  complementaryAttr: keyof BaseAttributes;
  bonus: number; // per attribute
}

export interface ZoanAbility {
  id: string;
  name: string;
  description: string;
  module: string;
  energyCost: number;
  condition?: string;
  isAwakened?: boolean;
}

export interface ZoanAkuma {
  type: "zoan";
  name: string;
  rank: AkumaRank;
  animalClass: ZoanClass;
  isMythical: boolean;
  isAncestral: boolean;
  points: ZoanPoint[];
  abilities: ZoanAbility[];
  /** Fixed CON bonus from Vigor Animal */
  vigorAnimalBonus: number;
}

export interface LogiaStatusEnhanced {
  name: string;
  description: string;
  combination: [string, string] | [string]; // 1 (doubled) or 2 effects combined
}

export interface LogiaAkuma {
  type: "logia";
  name: string;
  rank: AkumaRank;
  /** +5 to one chosen attribute */
  elementalNatureAttr: keyof BaseAttributes;
  statusEnhanced: LogiaStatusEnhanced;
  /** From Intangibility: +4 DEF, +4 CON, always active */
  intangibilityBonus: { defense: 4; constitution: 4 };
}

export interface ParameciaHabilityPassive {
  id: string;
  name: string;
  description: string;
  slots: number;
  modules: string[];
  condition?: string;
}

export interface ParameciaHabilityActive {
  id: string;
  name: string;
  description: string;
  slots: number;
  energyCost: number;
  modules: string[];
  condition?: string;
  isAwakened?: boolean;
}

export interface ParameciaAkuma {
  type: "paramecia";
  name: string;
  rank: AkumaRank;
  parameciaClass: ParameciaClass;
  specialAdherence: string;
  passives: ParameciaHabilityPassive[];
  actives: ParameciaHabilityActive[];
}

export type AkumaNoMi = ZoanAkuma | LogiaAkuma | ParameciaAkuma;

// ─── Artes Marciais ───────────────────────────────────────────────────────────

export interface ArtesMarciais {
  currentFaixa: AMFaixaId | null;
  /** Unique weapon obtained via Faixa Laranja */
  laranjaChoice: "techniques" | "unique_weapon" | null;
}

// ─── Ciborgue ─────────────────────────────────────────────────────────────────

export interface CyborgShiftData {
  shiftNumber: CyborgShift;
  location: CyborgShiftLocation;
  name: string;
  description: string;
}

export interface CyborgPath {
  shifts: CyborgShiftData[];
  /** Bonus chosen at shift 3 */
  shift3Bonus: "techniques" | "energy" | null;
  gear: CyborgGear | null;
  usesFuel: boolean; // true when shifts >= 3
}

// ─── Equipment ────────────────────────────────────────────────────────────────

export interface Equipment {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  quality: EquipmentQuality;
  bonusAttr: keyof BaseAttributes;
  bonusValue: number; // 0, 1, or 2
  bugiganga?: {
    name: string;
    quality: EquipmentQuality;
    periciaBonus?: { pericia: string; value: number };
    interpretive?: string;
  };
}

export interface UniqueWeapon extends Equipment {
  uniqueName: string;
  characteristic: UniqueWeaponCharacteristic;
}

// ─── Character ────────────────────────────────────────────────────────────────

export interface Character {
  id: string;
  name: string;
  level: number;
  race: RaceId;
  /** Points invested by the player (excludes base values and racial bonuses) */
  investedAttributes: BaseAttributes;
  /** Racial bonus (not counted in invested total) */
  racialBonus: Partial<BaseAttributes>;
  /** Perícias (11 skills, 0–5 each). Pool = 3 + floor(level/2). No gem cost. */
  pericias: CharacterPericias;
  /** Human race: one free péricia +1 bonus of player's choice */
  humanPericiaChoice: PericiaId | null;
  professions: CharacterProfession[];
  energy: DerivedAttributes;
  haki: HakiPath | null;
  akuma: AkumaNoMi | null;
  artesMarciais: ArtesMarciais | null;
  cyborg: CyborgPath | null;
  techniques: Technique[];
  equippedWeapon: Equipment | UniqueWeapon | null;
  equippedDefensive: [Equipment | null, Equipment | null];
  gemsSpent: number;
  gemBudget: number;
  location: "blues" | "grand_line" | "new_world";
}
