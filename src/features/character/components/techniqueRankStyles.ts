import type { TechniqueRank } from "../../../shared/types/character";

/** Cores de texto e borda por rank de técnica (E–A) */
export const TECHNIQUE_RANK_STYLES: Record<TechniqueRank, { text: string; border: string }> = {
  E: { text: "text-slate-400",  border: "border-slate-600" },
  D: { text: "text-blue-400",   border: "border-blue-700" },
  C: { text: "text-green-400",  border: "border-green-700" },
  B: { text: "text-purple-400", border: "border-purple-700" },
  A: { text: "text-amber-400",  border: "border-amber-600" },
};
