import type { AkumaRank, AkumaType, ZoanClass, ParameciaClass } from "../../../../shared/types/character";
import { GEM_COSTS } from "../../../../data/gemCosts";

// ─── Constants (UI) ───────────────────────────────────────────────────────────

export const RANKS: { rank: AkumaRank; cost: number }[] = (["C", "B", "A", "S"] as const).map(rank => ({
  rank, cost: GEM_COSTS.akumaTotal[rank],
}));

export const FREE_TECHS: Partial<Record<AkumaRank, string>> = {
  C: "1 Técnica Rank A gratuita",
  B: "2 Técnicas Rank A gratuitas",
};

export const TYPES: { id: AkumaType; icon: string; label: string; desc: string }[] = [
  { id: "zoan",      icon: "🐉", label: "Zoan",      desc: "Transformação animal. Vigor CON, points (+atributos), Desperto (Rank S)." },
  { id: "logia",     icon: "⚡", label: "Logia",     desc: "+5 atributo elemental, +4 DEF+CON (Intangibilidade), Área grátis." },
  { id: "paramecia", icon: "🌀", label: "Paramecia", desc: "Poderes únicos com habilidades passivas e ativas modulares." },
];

export const ZOAN_CLASSES: { id: ZoanClass; label: string; bonus: string }[] = [
  { id: "flying",    label: "Alado",     bonus: "+1 Atletismo" },
  { id: "herbivore", label: "Herbívoro", bonus: "+1 Sobrevivência" },
  { id: "carnivore", label: "Carnívoro", bonus: "+1 Furtividade" },
  { id: "rational",  label: "Racional",  bonus: "+1 Lógica" },
];

export const PARAMECIA_CLASSES: { id: ParameciaClass; label: string; desc: string }[] = [
  { id: "corporeal",   label: "Corpórea",    desc: "Altera o próprio corpo" },
  { id: "substantial", label: "Substancial", desc: "Gera ou manipula substância" },
  { id: "surreal",     label: "Surreal",     desc: "Distorção da realidade" },
];


export const RANK_ORDER_MAP: Record<AkumaRank, number> = { C: 0, B: 1, A: 2, S: 3 };

// Paramecia slot budget per rank
