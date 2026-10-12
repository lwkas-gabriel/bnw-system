import type { AMFaixaId } from "../shared/types/character";

export type FaixaRegion = "any" | "grand_line" | "new_world";

export interface AMFaixaData {
  id: AMFaixaId;
  label: string;
  /** Resumo curto do bônus (UI do builder) */
  summary: string;
  /** Região mínima em que a faixa pode ser obtida */
  region: FaixaRegion;
  /** Bônus que ESTA faixa adiciona (o acumulado é a soma das faixas anteriores) */
  bonusLines: string[];
}

/** As 14 faixas de Artes Marciais, em ordem de progressão (fonte única). */
export const AM_FAIXAS: AMFaixaData[] = [
  { id: "branca",      label: "Branca",      summary: "+2 bônus na arma",            region: "any",        bonusLines: ["+2 de bônus na arma equipada"] },
  { id: "cinza",       label: "Cinza",       summary: "+2 Precisão",                 region: "any",        bonusLines: ["+2 de Precisão"] },
  { id: "azul_clara",  label: "Azul Clara",  summary: "+2 Defesa",                   region: "any",        bonusLines: ["+2 de Defesa"] },
  { id: "azul_escura", label: "Azul Escura", summary: "+2 Poder",                    region: "any",        bonusLines: ["+2 de Poder"] },
  { id: "amarela",     label: "Amarela",     summary: "+2 Constituição",             region: "any",        bonusLines: ["+2 de Constituição"] },
  { id: "laranja",     label: "Laranja",     summary: "+1 itens def + Arma Única",   region: "grand_line", bonusLines: ["+1 em todos os itens defensivos", "2 Técnicas Rank A ou 1 Arma Única Comum"] },
  { id: "verde",       label: "Verde",       summary: "+2 técnicas defensivas",      region: "grand_line", bonusLines: ["+2 de bônus em técnicas defensivas"] },
  { id: "roxa",        label: "Roxa",        summary: "+2 técnicas ofensivas",       region: "grand_line", bonusLines: ["+2 de bônus em técnicas ofensivas"] },
  { id: "marrom",      label: "Marrom",      summary: "+1 itens def + 1 Rank A",     region: "grand_line", bonusLines: ["+1 em todos os itens defensivos", "1 Técnica Rank A"] },
  { id: "preta",       label: "Preta",       summary: "Equipa arma extra",           region: "new_world",  bonusLines: ["Pode equipar uma arma extra"] },
  { id: "coral",       label: "Coral",       summary: "+2 na arma extra",            region: "new_world",  bonusLines: ["+2 de bônus na arma extra"] },
  { id: "rajada",      label: "Rajada",      summary: "+1 itens defensivos",         region: "new_world",  bonusLines: ["+1 de bônus nos equipamentos defensivos"] },
  { id: "vermelha",    label: "Vermelha",    summary: "+2 POD/PRE/DEF/CON por 2 EN", region: "new_world",  bonusLines: ["+2 em POD/PRE/DEF/CON por 2 de energia (escolha por turno)"] },
  { id: "grao_mestre", label: "Grão-Mestre", summary: "+2 rolagem ou -2 oponente",   region: "new_world",  bonusLines: ["+2 em ataque por 3 de energia OU -2 no ataque do oponente por 3 de energia"] },
];

export const AM_FAIXA_ORDER: AMFaixaId[] = AM_FAIXAS.map(f => f.id);

export const AM_FAIXAS_BY_ID = Object.fromEntries(AM_FAIXAS.map(f => [f.id, f])) as Record<AMFaixaId, AMFaixaData>;

/** Índice 0-based da faixa na progressão (-1 se nula). */
export function faixaIndex(id: AMFaixaId | null | undefined): number {
  return id ? AM_FAIXA_ORDER.indexOf(id) : -1;
}

/** Faixas obtidas até `id` (inclusive), em ordem. */
export function faixasUpTo(id: AMFaixaId): AMFaixaData[] {
  return AM_FAIXAS.slice(0, faixaIndex(id) + 1);
}
