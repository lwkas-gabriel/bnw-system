import type { Character, AMFaixaId, AkumaRank } from "../../../shared/types/character";

// ─── Gem costs (single source of truth) ──────────────────────────────────────

export const GEM_COSTS = {
  // Akuma no Mi
  akuma: {
    C: 30, B: 60, A: 90,
    S: 50,            // Awakening, paid on top of A
    evolveCtoB: 30,   // difference
    evolveBtoA: 30,
    evolveAtoS: 50,
  },
  // Haki — primary only; secondary is FREE
  haki: {
    stageBase: 20,    // per stage, × 5 stages = 100g for primary
    secondary: 0,     // always free
    king: 20,         // Dormant / Controlled (single payment)
    advancedPartial:  20,
    advancedComplete: 20,
  },
  // Artes Marciais — each faixa
  artesMarciais: {
    branca:      10, cinza:       10, azul_clara:  10,
    azul_escura: 10, amarela:     10, laranja:     10,
    verde:       10, roxa:        10, marrom:      10,
    preta:       10, coral:       10, rajada:      10,
    vermelha:    10, grao_mestre: 10,
  } as Record<AMFaixaId, number>,
  // Ciborgue
  cyborg: {
    perShift: 20,   // 6 shifts × 20 = 120g total
    gear: 20,
  },
  // Unique weapon
  uniqueWeapon: 20,
  // Techniques (per rank)
  technique: { E: 6, D: 7, C: 8, B: 9, A: 10 },
  // Profession
  profession: 10,
  // Energy investment (1g = 1 EN)
  energyPerGem: 1,
} as const;

// ─── Gem Budget Calculator ────────────────────────────────────────────────────

export interface GemBreakdown {
  category: string;
  detail: string;
  cost: number;
}

export interface GemBudgetResult {
  total: number;
  spent: number;
  remaining: number;
  breakdown: GemBreakdown[];
  isOverBudget: boolean;
}

/** Computes the full gem budget breakdown for a character */
export function computeGemBudget(char: Character): GemBudgetResult {
  const breakdown: GemBreakdown[] = [];

  // ── Akuma no Mi ──────────────────────────────────────────────────
  if (char.akuma) {
    const rank = char.akuma.rank;
    const costs: Record<AkumaRank, number> = { C: 30, B: 60, A: 90, S: 140 };
    breakdown.push({
      category: "Akuma no Mi",
      detail: `${char.akuma.name} — Rank ${rank}`,
      cost: costs[rank],
    });
  }

  // ── Haki ─────────────────────────────────────────────────────────
  if (char.haki) {
    const primaryCost = typeof char.haki.primaryStage === "number"
      ? char.haki.primaryStage * GEM_COSTS.haki.stageBase
      : 5 * GEM_COSTS.haki.stageBase; // stage 5

    breakdown.push({
      category: "Haki",
      detail: `${char.haki.primaryType === "armament" ? "Armamento" : "Observação"} (primário, estágios 1-${typeof char.haki.primaryStage === "number" ? char.haki.primaryStage : 5})`,
      cost: primaryCost,
    });

    if (char.haki.hasKing) {
      breakdown.push({ category: "Haki", detail: "Haki do Rei (Dormente/Controlado)", cost: GEM_COSTS.haki.king });
    }

    if (char.haki.kingStage === "advanced") {
      breakdown.push({ category: "Haki", detail: "Haki do Rei Avançado", cost: GEM_COSTS.haki.advancedPartial });
    }

    if (char.haki.advancedType && char.haki.advancedType !== "king_advanced") {
      breakdown.push({
        category: "Haki",
        detail: `Haki Avançado — ${char.haki.advancedType} (parcial + completo)`,
        cost: GEM_COSTS.haki.advancedPartial + GEM_COSTS.haki.advancedComplete,
      });
    }
  }

  // ── Artes Marciais ────────────────────────────────────────────────
  if (char.artesMarciais?.currentFaixa) {
    const order: AMFaixaId[] = [
      "branca","cinza","azul_clara","azul_escura","amarela",
      "laranja","verde","roxa","marrom",
      "preta","coral","rajada","vermelha","grao_mestre",
    ];
    const idx = order.indexOf(char.artesMarciais.currentFaixa);
    const total = order.slice(0, idx + 1).reduce(
      (sum, f) => sum + GEM_COSTS.artesMarciais[f], 0
    );
    breakdown.push({
      category: "Artes Marciais",
      detail: `Branca → ${char.artesMarciais.currentFaixa}`,
      cost: total,
    });
  }

  // ── Ciborgue ──────────────────────────────────────────────────────
  if (char.cyborg) {
    const shiftCost = char.cyborg.shifts.length * GEM_COSTS.cyborg.perShift;
    breakdown.push({ category: "Ciborgue", detail: `${char.cyborg.shifts.length} shifts`, cost: shiftCost });
    if (char.cyborg.gear) {
      breakdown.push({ category: "Ciborgue", detail: `Gear: ${char.cyborg.gear}`, cost: GEM_COSTS.cyborg.gear });
    }
  }

  // ── Unique Weapon ─────────────────────────────────────────────────
  // Only count if NOT obtained via AM Laranja
  const hasUniqueWeapon = char.equippedWeapon && "characteristic" in char.equippedWeapon;
  const gotFromLaranja = char.artesMarciais?.laranjaChoice === "unique_weapon";
  if (hasUniqueWeapon && !gotFromLaranja) {
    breakdown.push({
      category: "Arma Única",
      detail: (char.equippedWeapon as any).uniqueName ?? "Arma Única",
      cost: GEM_COSTS.uniqueWeapon,
    });
  }

  // ── Techniques ───────────────────────────────────────────────────
  const purchasedTechs = char.techniques.filter(t => t.source === "purchased");
  for (const tech of purchasedTechs) {
    breakdown.push({
      category: "Técnica",
      detail: `${tech.name} (Rank ${tech.rank})`,
      cost: GEM_COSTS.technique[tech.rank],
    });
  }

  // ── Professions ───────────────────────────────────────────────────
  for (const prof of char.professions ?? []) {
    breakdown.push({
      category: "Profissão",
      detail: prof.name,
      cost: GEM_COSTS.profession,
    });
  }

  // ── Energy Investment ─────────────────────────────────────────────
  if (char.energy.energyInvested > 0) {
    breakdown.push({
      category: "Energia",
      detail: `+${char.energy.energyInvested} de Energia`,
      cost: char.energy.energyInvested * GEM_COSTS.energyPerGem,
    });
  }

  const spent = breakdown.reduce((sum, b) => sum + b.cost, 0);

  return {
    total: char.gemBudget,
    spent,
    remaining: char.gemBudget - spent,
    breakdown,
    isOverBudget: spent > char.gemBudget,
  };
}
