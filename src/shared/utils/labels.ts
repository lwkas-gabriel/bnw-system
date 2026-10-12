/**
 * Inverte um mapa id → label em label (minúsculo) → id.
 * Usado pelos importers para reconhecer os textos gerados pelos exporters.
 */
export function invertLabels<K extends string>(map: Record<K, string>): Record<string, K> {
  const inverted: Record<string, K> = {};
  for (const [id, label] of Object.entries(map) as [K, string][]) {
    inverted[label.toLowerCase()] = id;
  }
  return inverted;
}
