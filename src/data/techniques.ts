import type { TechniqueRank } from "../shared/types/character";

export interface TechniqueRankData {
  rank: TechniqueRank;
  baseBonus: number;
  gemCost: number;
  energyCost: number;
  canHaveAdherences: boolean;
  canHaveSpecial: boolean; // only Rank A
}

export const TECHNIQUE_RANKS: Record<TechniqueRank, TechniqueRankData> = {
  E: { rank: "E", baseBonus: 1, gemCost: 6,  energyCost: 1, canHaveAdherences: false, canHaveSpecial: false },
  D: { rank: "D", baseBonus: 2, gemCost: 7,  energyCost: 2, canHaveAdherences: true,  canHaveSpecial: false },
  C: { rank: "C", baseBonus: 3, gemCost: 8,  energyCost: 3, canHaveAdherences: true,  canHaveSpecial: false },
  B: { rank: "B", baseBonus: 4, gemCost: 9,  energyCost: 4, canHaveAdherences: true,  canHaveSpecial: false },
  A: { rank: "A", baseBonus: 5, gemCost: 10, energyCost: 5, canHaveAdherences: true,  canHaveSpecial: true  },
};

/** Cost to upgrade a technique: difference between new and current rank */
export function techniqueUpgradeCost(from: TechniqueRank, to: TechniqueRank): number {
  return TECHNIQUE_RANKS[to].gemCost - TECHNIQUE_RANKS[from].gemCost;
}

export interface AdherenceData {
  id: string;
  name: string;
  type: "attack" | "defense";
  rankRequired: TechniqueRank | null; // null = any rank from D; "A" = rank A only
  description: string;
  /** Bonus per application if applicable */
  bonusPerStack?: number;
  penaltyPerStack?: number;
  duration?: number; // turns
}

export const ADHERENCES: AdherenceData[] = [
  // ── General Attack ──────────────────────────────────────────────
  { id: "multiple_hit",    name: "Acerto Múltiplo",   type: "attack",  rankRequired: "D",
    description: "O atacante acerta mais um alvo. Pode ser colocado várias vezes." },
  { id: "anti_air",        name: "Anti Aéreo",         type: "attack",  rankRequired: "D",
    description: "Contra alvos voando: +2 ao bônus por aplicação." },
  { id: "anti_aquatic",    name: "Anti Aquático",      type: "attack",  rankRequired: "D",
    description: "Contra alvos se locomovendo na água: +2 ao bônus por aplicação." },
  { id: "ally_bonus_atk",  name: "Bônus para Aliado",  type: "attack",  rankRequired: "D",
    description: "Fornece o bônus da técnica para um aliado por aplicação." },
  { id: "confusion",       name: "Confusão",           type: "attack",  rankRequired: "D",
    description: "-1 em Precisão do alvo por 2 turnos por aplicação.", penaltyPerStack: 1, duration: 2 },
  { id: "double_edge",     name: "Dois Gumes",         type: "attack",  rankRequired: "D",
    description: "+2 ao bônus, mas 1 de dano direto na CON base do usuário.", bonusPerStack: 2 },
  { id: "fragility",       name: "Fragilidade",        type: "attack",  rankRequired: "D",
    description: "-1 em CON temporária do alvo por 2 turnos por aplicação.", penaltyPerStack: 1, duration: 2 },
  { id: "weakness",        name: "Fraqueza",           type: "attack",  rankRequired: "D",
    description: "-1 em Poder do alvo por 2 turnos por aplicação.", penaltyPerStack: 1, duration: 2 },
  { id: "safety",          name: "Segurança",          type: "attack",  rankRequired: "D",
    description: "Não sofre efeito de falha crítica. Dados 3 garantem o acerto." },
  { id: "vulnerability",   name: "Vulnerabilidade",    type: "attack",  rankRequired: "D",
    description: "-1 em Defesa do alvo por 2 turnos por aplicação.", penaltyPerStack: 1, duration: 2 },
  // ── General Defense ─────────────────────────────────────────────
  { id: "aerial",          name: "Aérea",              type: "defense", rankRequired: "D",
    description: "+1 DEF enquanto no ar por 2 turnos. +1 turno por aplicação extra." },
  { id: "ally_bonus_def",  name: "Bônus para Aliado",  type: "defense", rankRequired: "D",
    description: "Fornece o bônus da técnica para um aliado por aplicação." },
  // ── Rank A Attack ────────────────────────────────────────────────
  { id: "area_controlled", name: "Ataque em Área Controlado", type: "attack",  rankRequired: "A",
    description: "Todos os inimigos a 1 ação de movimento são atingidos." },
  { id: "consecutive_atk", name: "Consecutiva",        type: "attack",  rankRequired: "A",
    description: "+1 ao bônus a cada turno consecutivo de uso." },
  { id: "exhaustion",      name: "Exaustão",           type: "attack",  rankRequired: "A",
    description: "+1 ao custo de energia em técnicas do oponente por 2 turnos.", duration: 2 },
  { id: "wound",           name: "Ferimento",          type: "attack",  rankRequired: "A",
    description: "1 dano direto na CON base por 2 turnos por aplicação.", penaltyPerStack: 1, duration: 2 },
  // ── Rank A Defense ───────────────────────────────────────────────
  { id: "consecutive_def", name: "Consecutiva",        type: "defense", rankRequired: "A",
    description: "+1 ao bônus a cada turno consecutivo de uso." },
  { id: "defensive_posture", name: "Postura Defensiva", type: "defense", rankRequired: "A",
    description: "+2 ao bônus defensivo, mas -1 em Poder e Precisão.", bonusPerStack: 2 },
];

// ─── Rokushiki ────────────────────────────────────────────────────────────────

export interface RokushikiTechnique {
  id: string;
  name: string;
  description: string;
  gemCost: number;
  energyCost: number;
  effect: string;
  baseBonus: number;
  bonusAttr: "power" | "precision" | "defense" | "constitution";
  adherence?: string;
}

export const ROKUSHIKI: RokushikiTechnique[] = [
  { id: "shigan",    name: "Shigan",    gemCost: 5, energyCost: 3, baseBonus: 2, bonusAttr: "power",
    description: "Dedo indicador tão potente quanto um projétil.",
    effect: "+2 de Poder, Consecutiva", adherence: "consecutive_atk" },
  { id: "tekkai",    name: "Tekkai",    gemCost: 5, energyCost: 3, baseBonus: 2, bonusAttr: "constitution",
    description: "Músculos endurecem como metal.",
    effect: "+2 de Constituição; Postura Defensiva", adherence: "defensive_posture" },
  { id: "soru",      name: "Soru",      gemCost: 5, energyCost: 3, baseBonus: 3, bonusAttr: "precision",
    description: "Dez chutes no solo para velocidade extrema.",
    effect: "+3 de Precisão" },
  { id: "kamie",     name: "Kami-e",    gemCost: 5, energyCost: 3, baseBonus: 3, bonusAttr: "defense",
    description: "Corpo relaxado como folha de papel.",
    effect: "+3 de Defesa" },
  { id: "rankyaku",  name: "Rankyaku",  gemCost: 5, energyCost: 3, baseBonus: 2, bonusAttr: "precision",
    description: "Rajada cortante de vento com o chute.",
    effect: "+2 de Precisão; Acerto Múltiplo", adherence: "multiple_hit" },
  { id: "geppo",     name: "Geppo",     gemCost: 5, energyCost: 3, baseBonus: 2, bonusAttr: "defense",
    description: "Chuta o ar para praticamente voar.",
    effect: "+2 de Defesa; Aérea", adherence: "aerial" },
];

export const ROKOUGAN: RokushikiTechnique = {
  id: "rokougan", name: "Rokougan", gemCost: 10, energyCost: 5, baseBonus: 4, bonusAttr: "power",
  description: "Dois punhos para desferir onda de choque a curta distância.",
  effect: "+4 de Poder; 1 de dano direto na CON base (ignora CON temporária)",
};
