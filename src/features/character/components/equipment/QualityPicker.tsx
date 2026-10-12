import type { EquipmentQuality } from "../../../../shared/types/character";
import { SegmentedControl } from "../../../../shared/components";
import { QUALITY_BONUS, QUALITY_LABELS } from "../../../../data/equipment";

const QUALITY_OPTIONS = (Object.keys(QUALITY_LABELS) as EquipmentQuality[]).map(q => ({
  value: q,
  label: <>{QUALITY_LABELS[q]}{QUALITY_BONUS[q] > 0 && <span className="ml-1 opacity-75">+{QUALITY_BONUS[q]}</span>}</>,
}));

/** Seletor de qualidade (Comum / Esplêndido / Lendário) com o bônus de cada uma */
export function QualityPicker({ value, onChange }: { value: EquipmentQuality; onChange: (q: EquipmentQuality) => void }) {
  return <SegmentedControl options={QUALITY_OPTIONS} value={value} onChange={onChange} />;
}
