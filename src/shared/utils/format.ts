/** Símbolo de Berries usado em toda a UI e nas fichas do fórum */
export const BERRIES_SYMBOL = "B$";

/** Valor completo: "B$ 1.234.567" */
export function formatBerries(value: number): string {
  return `${BERRIES_SYMBOL} ${value.toLocaleString("pt-BR")}`;
}

/** Valor compacto para tabelas: "B$ 500k", "B$ 10M" */
export function formatBerriesShort(value: number): string {
  return value >= 1_000_000
    ? `${BERRIES_SYMBOL} ${(value / 1_000_000).toFixed(0)}M`
    : `${BERRIES_SYMBOL} ${(value / 1_000).toFixed(0)}k`;
}

/** Número com 2 dígitos: 3 → "03" */
export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
