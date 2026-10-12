import type { HakiStage, AdvancedHakiVariant, PrimaryHakiType } from "../shared/types/character";

export interface HakiStageData {
  stage: HakiStage;
  gemCost: number;
  /** Adventures required at previous stage */
  adventuresRequired: number;
  locationRequired: "anywhere" | "grand_line" | "new_world";
  /** Bonus while active */
  bonus: {
    power?: number;
    precision?: number;
    defense?: number;
    constitution?: number; // temporary (consumed first)
    percepcao?: number;
  };
  energyCostPerTurn: number;
  description: string;
  /** Free technique granted at this stage */
  freeTechniqueRank?: "A";
}

export const HAKI_ARMAMENT_STAGES: HakiStageData[] = [
  { stage: 1, gemCost: 20, adventuresRequired: 0, locationRequired: "anywhere",
    bonus: { power: 1, constitution: 1 }, energyCostPerTurn: 1,
    description: "Sensação de pele mais densa. Sem controle consciente ainda." },
  { stage: 2, gemCost: 20, adventuresRequired: 1, locationRequired: "anywhere",
    bonus: { power: 2, constitution: 2 }, energyCostPerTurn: 2,
    description: "Revestimento de partes do corpo. Ainda em desenvolvimento." },
  { stage: 3, gemCost: 20, adventuresRequired: 1, locationRequired: "grand_line",
    bonus: { power: 3, constitution: 3 }, energyCostPerTurn: 3,
    description: "Partes revestidas ficam totalmente negras. Atinge Logias.",
    freeTechniqueRank: "A" },
  { stage: 4, gemCost: 20, adventuresRequired: 2, locationRequired: "grand_line",
    bonus: { power: 4, constitution: 4 }, energyCostPerTurn: 4,
    description: "Revestimento de áreas maiores. Domínio significativo." },
  { stage: 5, gemCost: 20, adventuresRequired: 2, locationRequired: "grand_line",
    bonus: { power: 5, constitution: 5 }, energyCostPerTurn: 5,
    description: "Domínio pleno. Compatível com Akuma no Mi e Ciborgue." },
];

export const HAKI_OBSERVATION_STAGES: HakiStageData[] = [
  { stage: 1, gemCost: 0, adventuresRequired: 0, locationRequired: "anywhere",
    bonus: { precision: 1, defense: 1 }, energyCostPerTurn: 1,
    description: "Sente objetos próximos. Apura os 5 sentidos." },
  { stage: 2, gemCost: 0, adventuresRequired: 1, locationRequired: "anywhere",
    bonus: { precision: 2, defense: 2 }, energyCostPerTurn: 2,
    description: "Sente silhuetas de pessoas ao redor." },
  { stage: 3, gemCost: 0, adventuresRequired: 1, locationRequired: "grand_line",
    bonus: { precision: 3, defense: 3, percepcao: 1 }, energyCostPerTurn: 3,
    description: "Percebe emoções e sente doriki dos oponentes." },
  { stage: 4, gemCost: 0, adventuresRequired: 2, locationRequired: "grand_line",
    bonus: { precision: 4, defense: 4, percepcao: 2 }, energyCostPerTurn: 4,
    description: "Vê claramente todas as pessoas e objetos no raio." },
  { stage: 5, gemCost: 0, adventuresRequired: 2, locationRequired: "grand_line",
    bonus: { precision: 5, defense: 5, percepcao: 3 }, energyCostPerTurn: 5,
    description: "Pressente intenções. Alcance de 3 ações de movimento." },
];

// Secondary Haki is FREE — no gem cost, only adventures
export const SECONDARY_HAKI_GEM_COST = 0;
export const PRIMARY_HAKI_TOTAL_GEM_COST = 100; // stages 1-5 = 5 × 20g

export interface AdvancedHakiData {
  variant: AdvancedHakiVariant;
  gemCostPartial: number;
  gemCostComplete: number;
  adventuresRequired: number;
  locationRequired: "new_world";
  type: "armament" | "observation" | "king";
  focusAttr: "power" | "constitution" | "precision" | "defense" | "techniques";
  partial: { bonus: Partial<Record<string, number>>; description: string; energyCostPerTurn: number };
  complete: { bonus: Partial<Record<string, number>>; extraEffect: string; description: string; energyCostPerTurn: number };
}

export const ADVANCED_HAKI: AdvancedHakiData[] = [
  {
    variant: "ryuo",
    type: "armament", focusAttr: "power",
    gemCostPartial: 20, gemCostComplete: 20,
    adventuresRequired: 3, locationRequired: "new_world",
    partial: {
      bonus: { power: 4 }, energyCostPerTurn: 5,
      description: "Emite Haki para além do corpo — atinge o alvo antes do toque.",
    },
    complete: {
      bonus: { power: 4 }, energyCostPerTurn: 5,
      extraEffect: "Causa 4 de dano diretamente na CON base do alvo (ignora CON temporária).",
      description: "Fluxo de energia que penetra o interior do alvo.",
    },
  },
  {
    variant: "repulsion",
    type: "armament", focusAttr: "constitution",
    gemCostPartial: 20, gemCostComplete: 20,
    adventuresRequired: 3, locationRequired: "new_world",
    partial: {
      bonus: { constitution: 4 }, energyCostPerTurn: 5,
      description: "Camada invisível que amortece golpes inimigos.",
    },
    complete: {
      bonus: { constitution: 4 }, energyCostPerTurn: 5,
      extraEffect: "Pode aplicar Bônus para Aliado, Ataque em Área Controlado e Postura Defensiva Especial gratuitamente em técnicas defensivas.",
      description: "Projetar o Haki para além do próprio corpo.",
    },
  },
  {
    variant: "mantra",
    type: "observation", focusAttr: "precision",
    gemCostPartial: 20, gemCostComplete: 20,
    adventuresRequired: 3, locationRequired: "new_world",
    partial: {
      bonus: { precision: 4 }, energyCostPerTurn: 5,
      description: "Pressente exata posição e movimento do oponente no espaço.",
    },
    complete: {
      bonus: { precision: 4 }, energyCostPerTurn: 5,
      extraEffect: "Pode fazer duas rolagens de 3d6 ao atacar e selecionar o maior resultado.",
      description: "Sensibilidade extrassensorial no auge.",
    },
  },
  {
    variant: "future_vision",
    type: "observation", focusAttr: "defense",
    gemCostPartial: 20, gemCostComplete: 20,
    adventuresRequired: 3, locationRequired: "new_world",
    partial: {
      bonus: { defense: 4 }, energyCostPerTurn: 5,
      description: "Enxerga alguns segundos no futuro — prediz ataques.",
    },
    complete: {
      bonus: { defense: 4 }, energyCostPerTurn: 5,
      extraEffect: "Força o oponente a fazer duas rolagens de 3d6 e selecionar o menor resultado.",
      description: "Prever o futuro imediato se torna natural.",
    },
  },
  {
    variant: "king_advanced",
    type: "king", focusAttr: "techniques",
    gemCostPartial: 20, gemCostComplete: 0, // single stage only
    adventuresRequired: 3, locationRequired: "new_world",
    partial: {
      bonus: {}, energyCostPerTurn: 0, // no extra EN beyond King Controlled
      description: "Infunde o poder do Rei nas técnicas. Relâmpagos negros emanam do foco.",
    },
    complete: {
      bonus: {}, energyCostPerTurn: 0,
      extraEffect: "Adiciona o valor da perícia Ambição ao bônus de todas as técnicas enquanto o Haki do Rei estiver ativo.",
      description: "O ataque causa dano sem necessidade de contato físico.",
    },
  },
];

export const KING_HAKI: {
  dormant: { gemCost: number; description: string };
  controlled: { gemCost: number; energyCostPerTurn: number; persuasionBonus: number; description: string };
} = {
  dormant: {
    gemCost: 20,
    description: "Pode tentar ativar uma vez por aventura com teste difícil de Ambição (18). Ou automaticamente em acerto crítico.",
  },
  controlled: {
    gemCost: 0, // already paid when buying dormant
    energyCostPerTurn: 5,
    persuasionBonus: 4,
    description: "Desmaia alvos com 5 níveis a menos. Resistentes com Obs. 3+ ficam sem ação de ataque por 2 turnos.",
  },
};

/** Nome do Haki primário/secundário, com e sem artigo ("do Armamento") */
export const HAKI_TYPE_NAMES: Record<PrimaryHakiType, { name: string; withArticle: string }> = {
  armament:    { name: "Armamento", withArticle: "do Armamento" },
  observation: { name: "Observação", withArticle: "da Observação" },
};
