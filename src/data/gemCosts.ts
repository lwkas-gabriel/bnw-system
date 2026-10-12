import type { AMFaixaId, AkumaRank, CompanionRank } from "../shared/types/character";

/** Orçamento inicial de gemas de todo personagem */
export const GEM_BUDGET_MIN = 20;
/** Teto de gemas (o excedente vira XP) */
export const GEM_BUDGET_MAX = 400;
/** Desconto de Facção: 20 gemas fora do teto de 400 */
export const FACTION_DISCOUNT_GEMS = 20;

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
  // Custo total acumulado por rank (S = A + despertar)
  akumaTotal: { C: 30, B: 60, A: 90, S: 140 } as Record<AkumaRank, number>,
  // Haki — primary only; secondary is FREE
  haki: {
    stageBase: 20,    // per stage, × 5 stages = 100g for primary
    secondary: 0,     // always free
    king: 20,         // Dormant / Controlled (single payment)
    advancedPartial:  20,   // Haki Avançado (Armamento/Observação): fase parcial
    advancedComplete: 20,   // Haki Avançado (Armamento/Observação): fase completa
    kingAdvanced:     20,   // Haki do Rei Avançado: nível único, sem fase parcial/completa
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
