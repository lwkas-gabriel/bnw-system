import type { FactionType } from "../shared/types/character";
import type { ShipOwnership } from "../shared/types/ship";

// ─── Rank data ────────────────────────────────────────────────────────────────

export interface FactionRankData {
  id: string;
  label: string;
  requiredLevel: number;
  requiredPrestige: number;
  prestigePerAdventure: number;
  /** True for the rank at Nível 12 + Prestígio 20 — grants 20g Faction Discount */
  grantsDiscount: boolean;
  // Pirate-specific
  shipCrewBonus?: number;    // extra crew capacity (only commander's rank counts in groups)
  followerBonus?: number;    // land followers recruitable per adventure
  bountyMax?: number;        // bounty ceiling in berries
  // Navy / CP
  salary?: number;           // berries per adventure
  shipCommission?: Exclude<ShipOwnership, "owned"> | null;
  // Bounty Hunter
  contractMax?: number;      // max contract value in berries
  // Revolutionary
  missionIncome?: number;    // berries per adventure
}

export interface FactionLateralRank extends FactionRankData {
  /** Lateral ranks don't replace main hierarchy (Shichibukai, Corregedor, etc.) */
  isLateral: true;
}

export interface FactionDefinition {
  type: FactionType;
  name: string;
  /** Nome no singular, usado na ficha do fórum ("Facção: Pirata") */
  singularName: string;
  icon: string;
  colorClass: string;   // Tailwind text color
  borderClass: string;  // Tailwind border color
  bgClass: string;      // Tailwind bg color
  ranks: FactionRankData[];
  lateralRank?: FactionLateralRank;
}

// ─── Pirate ship preset (commissioned navy/cp) ───────────────────────────────

export const COMMISSIONED_SHIP_PRESET = {
  size: "medio" as const,
  mechanisms: ["revestimento_de_kairoseki"],
  // 1 Canhão (regra de unicidade prevalece sobre "dois canhões" nas regras brutas)
  comodoIds: ["cabine_do_capitao", "canhao", "arsenal", "brigue"],
};

// ─── Faction definitions ─────────────────────────────────────────────────────

export const FACTIONS: Record<FactionType, FactionDefinition> = {

  // ── Piratas ──────────────────────────────────────────────────────────────────
  pirata: {
    type: "pirata",
    name: "Piratas",
    singularName: "Pirata",
    icon: "☠️",
    colorClass: "text-red-400",
    borderClass: "border-red-800/50",
    bgClass: "bg-red-900/20",
    ranks: [
      { id: "marujo",          label: "Marujo",              requiredLevel: 1,  requiredPrestige: 0,   prestigePerAdventure: 2,  grantsDiscount: false, shipCrewBonus: 10,  followerBonus: 5,  bountyMax: 20_000_000 },
      { id: "fora_da_lei",     label: "Fora da Lei",         requiredLevel: 4,  requiredPrestige: 4,   prestigePerAdventure: 3,  grantsDiscount: false, shipCrewBonus: 20,  followerBonus: 10, bountyMax: 50_000_000 },
      { id: "inimigo_publico", label: "Inimigo Público",     requiredLevel: 8,  requiredPrestige: 10,  prestigePerAdventure: 5,  grantsDiscount: false, shipCrewBonus: 30,  followerBonus: 15, bountyMax: 100_000_000 },
      { id: "supernova",       label: "Supernova",           requiredLevel: 12, requiredPrestige: 20,  prestigePerAdventure: 7,  grantsDiscount: true,  shipCrewBonus: 40,  followerBonus: 20, bountyMax: 300_000_000 },
      { id: "astro_principal", label: "Astro Principal",     requiredLevel: 16, requiredPrestige: 40,  prestigePerAdventure: 9,  grantsDiscount: false, shipCrewBonus: 50,  followerBonus: 30, bountyMax: 700_000_000 },
      { id: "magnanimo",       label: "Magnânimo",           requiredLevel: 20, requiredPrestige: 60,  prestigePerAdventure: 11, grantsDiscount: false, shipCrewBonus: 60,  followerBonus: 45, bountyMax: 1_500_000_000 },
      { id: "calamidade",      label: "Calamidade",          requiredLevel: 30, requiredPrestige: 85,  prestigePerAdventure: 13, grantsDiscount: false, shipCrewBonus: 70,  followerBonus: 70, bountyMax: 3_000_000_000 },
      { id: "yonkou",          label: "Imperador dos Mares", requiredLevel: 40, requiredPrestige: 100, prestigePerAdventure: 0,  grantsDiscount: false, shipCrewBonus: 0,   followerBonus: 0,  bountyMax: 0 },
    ],
    lateralRank: {
      id: "shichibukai", label: "Lorde do Mar (Shichibukai)",
      requiredLevel: 18, requiredPrestige: 50, prestigePerAdventure: 4,
      grantsDiscount: false, isLateral: true,
    },
  },

  // ── Marinha ──────────────────────────────────────────────────────────────────
  marinha: {
    type: "marinha",
    name: "Marinha",
    singularName: "Marinha",
    icon: "⚓",
    colorClass: "text-blue-400",
    borderClass: "border-blue-800/50",
    bgClass: "bg-blue-900/20",
    ranks: [
      { id: "grumete",           label: "Grumete (Rank 11)",         requiredLevel: 1,  requiredPrestige: 0,   prestigePerAdventure: 2,  grantsDiscount: false, salary: 100_000,     shipCommission: null },
      { id: "cabo",              label: "Cabo (Rank 10)",             requiredLevel: 2,  requiredPrestige: 2,   prestigePerAdventure: 2,  grantsDiscount: false, salary: 250_000,     shipCommission: null },
      { id: "sargento",          label: "Sargento (Rank 9)",          requiredLevel: 4,  requiredPrestige: 4,   prestigePerAdventure: 3,  grantsDiscount: false, salary: 500_000,     shipCommission: null },
      { id: "tenente",           label: "Tenente (Rank 8)",           requiredLevel: 8,  requiredPrestige: 10,  prestigePerAdventure: 5,  grantsDiscount: false, salary: 1_500_000,   shipCommission: null },
      { id: "comandante",        label: "Comandante (Rank 7)",        requiredLevel: 10, requiredPrestige: 15,  prestigePerAdventure: 5,  grantsDiscount: false, salary: 2_000_000,   shipCommission: null },
      { id: "capitao",           label: "Capitão (Rank 6)",           requiredLevel: 12, requiredPrestige: 20,  prestigePerAdventure: 7,  grantsDiscount: true,  salary: 3_000_000,   shipCommission: "navy_permanent" },
      { id: "comodoro",          label: "Comodoro (Rank 5)",          requiredLevel: 16, requiredPrestige: 40,  prestigePerAdventure: 9,  grantsDiscount: false, salary: 4_000_000,   shipCommission: "navy_permanent" },
      { id: "contra_almirante",  label: "Contra-almirante (Rank 4)",  requiredLevel: 20, requiredPrestige: 60,  prestigePerAdventure: 11, grantsDiscount: false, salary: 7_000_000,   shipCommission: "navy_permanent" },
      { id: "vice_almirante",    label: "Vice-almirante (Rank 3)",    requiredLevel: 30, requiredPrestige: 85,  prestigePerAdventure: 13, grantsDiscount: false, salary: 15_000_000,  shipCommission: "navy_permanent" },
      { id: "almirante",         label: "Almirante (Rank 2)",         requiredLevel: 40, requiredPrestige: 100, prestigePerAdventure: 0,  grantsDiscount: false, salary: 20_000_000,  shipCommission: "navy_permanent" },
      { id: "almirante_de_frota",label: "Almirante de Frota (Rank 1)",requiredLevel: 40, requiredPrestige: 100, prestigePerAdventure: 0,  grantsDiscount: false, salary: 30_000_000,  shipCommission: "navy_permanent" },
    ],
    lateralRank: {
      id: "corregedor", label: "Corregedor",
      requiredLevel: 18, requiredPrestige: 50, prestigePerAdventure: 4,
      grantsDiscount: false, isLateral: true,
    },
  },

  // ── Caçadores de Recompensa ───────────────────────────────────────────────────
  cacador: {
    type: "cacador",
    name: "Caçadores de Recompensa",
    singularName: "Caçador de Recompensas",
    icon: "🎯",
    colorClass: "text-yellow-400",
    borderClass: "border-yellow-800/50",
    bgClass: "bg-yellow-900/20",
    ranks: [
      { id: "latao",            label: "Colar de Latão (Rank E)",       requiredLevel: 1,  requiredPrestige: 0,   prestigePerAdventure: 2,  grantsDiscount: false, contractMax: 15_000_000 },
      { id: "bronze",           label: "Colar de Bronze (Rank D)",      requiredLevel: 4,  requiredPrestige: 4,   prestigePerAdventure: 3,  grantsDiscount: false, contractMax: 30_000_000 },
      { id: "prata",            label: "Colar de Prata (Rank C)",       requiredLevel: 8,  requiredPrestige: 10,  prestigePerAdventure: 5,  grantsDiscount: false, contractMax: 75_000_000 },
      { id: "ouro_b",           label: "Colar de Ouro (Rank B)",        requiredLevel: 12, requiredPrestige: 20,  prestigePerAdventure: 7,  grantsDiscount: true,  contractMax: 200_000_000 },
      { id: "platina",          label: "Colar de Platina (Rank A)",     requiredLevel: 16, requiredPrestige: 40,  prestigePerAdventure: 9,  grantsDiscount: false, contractMax: 750_000_000 },
      { id: "paladio",          label: "Colar de Paládio (Rank S)",     requiredLevel: 20, requiredPrestige: 60,  prestigePerAdventure: 11, grantsDiscount: false, contractMax: 1_500_000_000 },
      { id: "diamante",         label: "Colar de Diamante (Rank SS)",   requiredLevel: 30, requiredPrestige: 85,  prestigePerAdventure: 13, grantsDiscount: false, contractMax: 4_000_000_000 },
      { id: "imperador_submundo",label: "Imperador do Submundo",        requiredLevel: 40, requiredPrestige: 100, prestigePerAdventure: 0,  grantsDiscount: false, contractMax: 0 },
    ],
    lateralRank: {
      id: "agente_submundo", label: "Agente do Submundo",
      requiredLevel: 18, requiredPrestige: 50, prestigePerAdventure: 4,
      grantsDiscount: false, isLateral: true,
    },
  },

  // ── Agentes do Governo (Cipher Pol) ─────────────────────────────────────────
  governo: {
    type: "governo",
    name: "Agentes do Governo",
    singularName: "Governo",
    icon: "🕵️",
    colorClass: "text-slate-300",
    borderClass: "border-slate-600/50",
    bgClass: "bg-slate-800/40",
    ranks: [
      { id: "aspirante",    label: "Aspirante",           requiredLevel: 1,  requiredPrestige: 0,   prestigePerAdventure: 2,  grantsDiscount: false, salary: 150_000,    shipCommission: null },
      { id: "recruta",      label: "Recruta",             requiredLevel: 4,  requiredPrestige: 4,   prestigePerAdventure: 3,  grantsDiscount: false, salary: 500_000,    shipCommission: null },
      { id: "cp1_4",        label: "Agente CP 1–4",       requiredLevel: 8,  requiredPrestige: 10,  prestigePerAdventure: 5,  grantsDiscount: false, salary: 1_500_000,  shipCommission: "cp_temporary" },
      { id: "cp5_6",        label: "Agente CP 5–6",       requiredLevel: 12, requiredPrestige: 20,  prestigePerAdventure: 7,  grantsDiscount: true,  salary: 3_000_000,  shipCommission: "cp_temporary" },
      { id: "cp7_8",        label: "Agente CP 7–8",       requiredLevel: 16, requiredPrestige: 40,  prestigePerAdventure: 9,  grantsDiscount: false, salary: 4_000_000,  shipCommission: "cp_temporary" },
      { id: "cp9",          label: "Agente CP 9",         requiredLevel: 20, requiredPrestige: 60,  prestigePerAdventure: 11, grantsDiscount: false, salary: 10_000_000, shipCommission: "cp_temporary" },
      { id: "cp0",          label: "Agente CP 0",         requiredLevel: 30, requiredPrestige: 85,  prestigePerAdventure: 13, grantsDiscount: false, salary: 25_000_000, shipCommission: "cp_temporary" },
      { id: "comandante_cp",label: "Comandante CP",       requiredLevel: 40, requiredPrestige: 100, prestigePerAdventure: 0,  grantsDiscount: false, salary: 45_000_000, shipCommission: "cp_galeon" },
    ],
    lateralRank: {
      id: "agente_duplo", label: "Agente Duplo",
      requiredLevel: 18, requiredPrestige: 50, prestigePerAdventure: 4,
      grantsDiscount: false, isLateral: true,
    },
  },

  // ── Revolucionários ──────────────────────────────────────────────────────────
  revolucionario: {
    type: "revolucionario",
    name: "Revolucionários",
    singularName: "Revolucionário",
    icon: "✊",
    colorClass: "text-green-400",
    borderClass: "border-green-800/50",
    bgClass: "bg-green-900/20",
    ranks: [
      { id: "voluntario",         label: "Voluntário",          requiredLevel: 1,  requiredPrestige: 0,   prestigePerAdventure: 2,  grantsDiscount: false, missionIncome: 100_000 },
      { id: "companheiro",        label: "Companheiro",         requiredLevel: 2,  requiredPrestige: 2,   prestigePerAdventure: 3,  grantsDiscount: false, missionIncome: 500_000 },
      { id: "informante",         label: "Informante",          requiredLevel: 8,  requiredPrestige: 10,  prestigePerAdventure: 5,  grantsDiscount: false, missionIncome: 1_900_000 },
      { id: "heroi",              label: "Herói",               requiredLevel: 12, requiredPrestige: 20,  prestigePerAdventure: 7,  grantsDiscount: true,  missionIncome: 4_000_000 },
      { id: "veterano",           label: "Veterano",            requiredLevel: 16, requiredPrestige: 40,  prestigePerAdventure: 9,  grantsDiscount: false, missionIncome: 6_000_000 },
      { id: "vice_comandante",    label: "Vice-Comandante",     requiredLevel: 20, requiredPrestige: 60,  prestigePerAdventure: 11, grantsDiscount: false, missionIncome: 10_000_000 },
      { id: "mobilizador",        label: "Mobilizador",         requiredLevel: 30, requiredPrestige: 85,  prestigePerAdventure: 13, grantsDiscount: false, missionIncome: 20_000_000 },
      { id: "comandante",         label: "Comandante",          requiredLevel: 40, requiredPrestige: 100, prestigePerAdventure: 0,  grantsDiscount: false, missionIncome: 0 },
      { id: "comandante_supremo", label: "Comandante Supremo",  requiredLevel: 40, requiredPrestige: 100, prestigePerAdventure: 0,  grantsDiscount: false, missionIncome: 0 },
    ],
    lateralRank: {
      id: "radical", label: "Radical",
      requiredLevel: 18, requiredPrestige: 50, prestigePerAdventure: 4,
      grantsDiscount: false, isLateral: true,
    },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getFactionRank(type: FactionType, rankId: string): FactionRankData | undefined {
  const def = FACTIONS[type];
  return def.ranks.find(r => r.id === rankId) ?? (def.lateralRank?.id === rankId ? def.lateralRank : undefined);
}

export function getFactionLabel(type: FactionType, rankId: string): string {
  return getFactionRank(type, rankId)?.label ?? rankId;
}

export function getAvailableRanks(type: FactionType, level: number): FactionRankData[] {
  return FACTIONS[type].ranks.filter(r => r.requiredLevel <= level);
}

export function pilhagemIncome(shipCrewBonus: number, followerBonus: number): number {
  return (shipCrewBonus + followerBonus) * 50_000;
}
