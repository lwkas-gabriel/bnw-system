import type { HakiPath, HakiStage } from "../../../shared/types/character";
import { GEM_COSTS } from "../../../data/gemCosts";
import { HAKI_TYPE_NAMES } from "../../../data/haki";

/** Converte o estágio em número; estágios avançados ("advanced_*") contam como 5. */
export function hakiStageNum(stage: HakiStage, fallback = 5): number {
  return typeof stage === "number" ? stage : fallback;
}

export interface HakiCostItem {
  detail: string;
  cost: number;
}

/** Itens de custo do Haki (fonte única usada pelo gemBudget, validador, UI e export). */
export function hakiCostBreakdown(haki: HakiPath): HakiCostItem[] {
  const primaryStage = hakiStageNum(haki.primaryStage);
  const items: HakiCostItem[] = [{
    detail: `${HAKI_TYPE_NAMES[haki.primaryType].name} (primário, estágios 1-${primaryStage})`,
    cost: primaryStage * GEM_COSTS.haki.stageBase,
  }];

  if (haki.hasKing) {
    items.push({ detail: "Haki do Rei (Dormente/Controlado)", cost: GEM_COSTS.haki.king });
  }
  if (haki.kingStage === "advanced") {
    items.push({ detail: "Haki do Rei Avançado", cost: GEM_COSTS.haki.advancedPartial });
  }
  if (haki.advancedType && haki.advancedType !== "king_advanced") {
    items.push({
      detail: `Haki Avançado — ${haki.advancedType} (parcial + completo)`,
      cost: GEM_COSTS.haki.advancedPartial + GEM_COSTS.haki.advancedComplete,
    });
  }
  return items;
}

/** Custo total em gemas do caminho de Haki (secundário é sempre gratuito). */
export function computeHakiCost(haki: HakiPath): number {
  return hakiCostBreakdown(haki).reduce((sum, item) => sum + item.cost, 0);
}
