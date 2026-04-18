import type { PericiaId } from "../shared/types/character";

// ─── Pericias data ────────────────────────────────────────────────────────────

export interface PericiaData {
  id: PericiaId;
  name: string;
  description: string;
}

export const PERICIAS: Record<PericiaId, PericiaData> = {
  ambicao:       { id: "ambicao",       name: "Ambição",       description: "Força de vontade, determinação, presença intimidadora. Bônus em técnicas com Haki do Rei Avançado." },
  atletismo:     { id: "atletismo",     name: "Atletismo",     description: "Corrida, natação, escalada, resistência física." },
  destreza:      { id: "destreza",      name: "Destreza",      description: "Agilidade fina, acrobacias, equilíbrio." },
  erudicao:      { id: "erudicao",      name: "Erudição",      description: "Conhecimento histórico, náutico, científico." },
  expressao:     { id: "expressao",     name: "Expressão",     description: "Atuação, disfarce, performance." },
  furtividade:   { id: "furtividade",   name: "Furtividade",   description: "Stealth, bater carteira, se esconder." },
  investigacao:  { id: "investigacao",  name: "Investigação",  description: "Análise de cenas, dedução, farejamento de pistas." },
  logica:        { id: "logica",        name: "Lógica",        description: "Estratégia, xadrez, planejamento tático." },
  percepcao:     { id: "percepcao",     name: "Percepção",     description: "Sentidos aguçados, detectar emboscadas." },
  persuasao:     { id: "persuasao",     name: "Persuasão",     description: "Blefe, negociação, sedução, intimidação social." },
  sobrevivencia: { id: "sobrevivencia", name: "Sobrevivência", description: "Orientação, caça, primeiros socorros no campo." },
};

// ─── Roll bonus ───────────────────────────────────────────────────────────────

/** Roll = 3d6 + (gradação × 3) */
export function periciaRollBonus(gradacao: number): number {
  return gradacao * 3;
}

// ─── Difficulty classes ───────────────────────────────────────────────────────

export const PERICIAS_DC: { label: string; dc: number }[] = [
  { label: "Trivial",       dc: 8  },
  { label: "Fácil",         dc: 11 },
  { label: "Médio",         dc: 14 },
  { label: "Difícil",       dc: 17 },
  { label: "Muito Difícil", dc: 20 },
  { label: "Heroico",       dc: 23 },
  { label: "Lendário",      dc: 26 },
];

// ─── Racial péricia bonuses ───────────────────────────────────────────────────

/** Which péricia (by ID) a given race gets a fixed +1 bonus on (outside the pool). */
export const RACE_PERICIA_BONUS: Partial<Record<string, PericiaId>> = {
  fishman:    "sobrevivencia",
  siren:      "atletismo",
  lunar:      "logica",
  mink:       "percepcao",
  dwarf:      "furtividade",
  giant:      "sobrevivencia",
  half_giant: "sobrevivencia",
  // human: free choice → stored in char.humanPericiaChoice
};

// ─── Zoan class péricia bonuses ───────────────────────────────────────────────

export const ZOAN_CLASS_PERICIA_BONUS: Record<string, PericiaId> = {
  flying:    "atletismo",
  herbivore: "sobrevivencia",
  carnivore: "furtividade",
  rational:  "logica",
};
