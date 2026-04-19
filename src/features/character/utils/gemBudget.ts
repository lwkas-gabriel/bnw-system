import type { Character, AMFaixaId, AkumaRank, CompanionRank } from "../../../shared/types/character";
import { FACTIONS } from "../../../data/factions";

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
  // Companions
  companion: { C: 10, B: 20, A: 30 } as Record<CompanionRank, number>,
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
  /** +20g from Faction Discount (outside the 400g cap) */
  factionDiscountBonus: number;
  spent: number;
  remaining: number;
  breakdown: GemBreakdown[];
  isOverBudget: boolean;
}

/** Returns faction bonus info: +20g added to the gem pool for ranks at or above the grant rank */
export function computeFactionDiscount(char: Character): {
  hasDiscount: boolean;
  bonus: number;
} {
  if (!char.faction) return { hasDiscount: false, bonus: 0 };

  const fac = FACTIONS[char.faction.type];
  const grantIdx = fac.ranks.findIndex(r => r.grantsDiscount);
  const currentIdx = fac.ranks.findIndex(r => r.id === char.faction!.rank);

  // For lateral ranks (currentIdx = -1), check by required level
  const hasDiscount = grantIdx >= 0 && (
    currentIdx >= grantIdx ||
    (currentIdx < 0 && char.level >= fac.ranks[grantIdx].requiredLevel)
  );

  return { hasDiscount, bonus: hasDiscount ? 20 : 0 };
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
  // Only count if NOT obtained via AM Laranja (Laranja faixa or higher + not explicitly "techniques")
  const hasUniqueWeapon = char.equippedWeapon && "characteristic" in char.equippedWeapon;
  const LARANJA_IDX = ["branca","cinza","azul_clara","azul_escura","amarela","laranja","verde","roxa","marrom","preta","coral","rajada","vermelha","grao_mestre"].indexOf("laranja");
  const currentFaixaIdx = char.artesMarciais?.currentFaixa
    ? ["branca","cinza","azul_clara","azul_escura","amarela","laranja","verde","roxa","marrom","preta","coral","rajada","vermelha","grao_mestre"].indexOf(char.artesMarciais.currentFaixa)
    : -1;
  const hasLaranja = currentFaixaIdx >= LARANJA_IDX;
  const gotFromLaranja = hasUniqueWeapon && hasLaranja && char.artesMarciais?.laranjaChoice !== "techniques";
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

  // ── Companheiros ──────────────────────────────────────────────────
  for (const companion of char.companions ?? []) {
    breakdown.push({
      category: "Companheiros",
      detail: `${companion.name || "Companheiro"} — Rank ${companion.rank}`,
      cost: GEM_COSTS.companion[companion.rank],
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
  const factionDiscountBonus = computeFactionDiscount(char).bonus;
  const effectiveTotal = char.gemBudget + factionDiscountBonus;

  return {
    total: effectiveTotal,
    factionDiscountBonus,
    spent,
    remaining: effectiveTotal - spent,
    breakdown,
    isOverBudget: spent > effectiveTotal,
  };
}
