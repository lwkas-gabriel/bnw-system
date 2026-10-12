import type { PericiaId } from "../shared/types/character";

// ─── Professions data ─────────────────────────────────────────────────────────

export interface CraftDC {
  common:    number;
  splendid:  number;
  legendary: number;
}

export interface ProfessionData {
  id: string;
  name: string;
  description: string;
  linkedPericias: PericiaId[];
  gemCost: number;
  craftDC: CraftDC;
  /** Craft slots available per adventure */
  craftSlotsPerAdventure: number;
}

/** Shared craft DCs for all professions (per rules). */
export const STANDARD_CRAFT_DC: CraftDC = { common: 9, splendid: 18, legendary: 27 };

export const PROFESSIONS: ProfessionData[] = [
  {
    id: "adestrador",
    name: "Adestrador",
    description: "Especialista em treinar e controlar animais. Fundamental para usar a Lassoo.",
    linkedPericias: ["sobrevivencia"],
    gemCost: 10,
    craftDC: STANDARD_CRAFT_DC,
    craftSlotsPerAdventure: 2,
  },
  {
    id: "arqueologo",
    name: "Arqueólogo",
    description: "Decifra ruínas, mapas antigos e textos perdidos. Busca Poneglyphs.",
    linkedPericias: ["investigacao"],
    gemCost: 10,
    craftDC: STANDARD_CRAFT_DC,
    craftSlotsPerAdventure: 2,
  },
  {
    id: "cozinheiro",
    name: "Cozinheiro",
    description: "Prepara refeições que recuperam energia e elevam o moral da tripulação.",
    linkedPericias: ["expressao"],
    gemCost: 10,
    craftDC: STANDARD_CRAFT_DC,
    craftSlotsPerAdventure: 2,
  },
  {
    id: "engenheiro",
    name: "Engenheiro",
    description: "Projeta e constrói mecanismos, bugigangas e embarcações. Reduz custo de fabricação em 30%.",
    linkedPericias: ["logica"],
    gemCost: 10,
    craftDC: STANDARD_CRAFT_DC,
    craftSlotsPerAdventure: 2,
  },
  {
    id: "ferreiro",
    name: "Ferreiro",
    description: "Forja e repara armas e armaduras. Pode criar equipamentos de qualidade superior.",
    linkedPericias: ["destreza"],
    gemCost: 10,
    craftDC: STANDARD_CRAFT_DC,
    craftSlotsPerAdventure: 2,
  },
  {
    id: "medico",
    name: "Médico",
    description: "Trata ferimentos, cria antídotos e mantém a tripulação em combate.",
    linkedPericias: ["erudicao"],
    gemCost: 10,
    craftDC: STANDARD_CRAFT_DC,
    craftSlotsPerAdventure: 2,
  },
  {
    id: "navegador",
    name: "Navegador",
    description: "Lê Log Poses, cartografa rotas e pilota pelo Grand Line. Requisito para embarcações maiores.",
    linkedPericias: ["percepcao"],
    gemCost: 10,
    craftDC: STANDARD_CRAFT_DC,
    craftSlotsPerAdventure: 2,
  },
];

export const PROFESSIONS_BY_ID: Record<string, ProfessionData> = Object.fromEntries(
  PROFESSIONS.map(p => [p.id, p])
);
