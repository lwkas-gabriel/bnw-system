import { Badge } from "../../../../shared/components";
import type { Equipment, UniqueWeapon } from "../../../../shared/types/character";
import { ATTR_SHORT_LABELS } from "../../../../data/attributes";
import { QUALITY_LABELS, SLOT_LABELS } from "../../../../data/equipment";

// ─── Equipment Card ───────────────────────────────────────────────────────────

interface EquipCardProps {
  label: string;
  equipment: Equipment | null;
  hasUniqueWeapon?: boolean;
  onEdit: () => void;
}

export function EquipCard({ label, equipment, hasUniqueWeapon, onEdit }: EquipCardProps) {
  if (!equipment) {
    return (
      <button
        onClick={onEdit}
        className="w-full h-20 border-2 border-dashed border-slate-700 rounded-lg text-center text-slate-600 hover:border-slate-500 hover:text-slate-500 transition-colors text-xs flex flex-col items-center justify-center gap-1"
      >
        <span className="text-lg">+</span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onEdit}
      className={`w-full text-left p-3 bg-slate-800 rounded-lg border transition-colors hover:border-slate-500 ${
        hasUniqueWeapon ? "border-amber-700/50" : "border-slate-700"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-200 truncate">{equipment.name || label}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {SLOT_LABELS[equipment.slot]} · {QUALITY_LABELS[equipment.quality]}
          </p>
        </div>
        <div className="text-right shrink-0">
          {equipment.bonusValue > 0 ? (
            <Badge variant="amber">
              +{equipment.bonusValue} {ATTR_SHORT_LABELS[equipment.bonusAttr]}
            </Badge>
          ) : (
            <span className="text-[10px] text-slate-600">sem bônus</span>
          )}
        </div>
      </div>
      {equipment.bugiganga && (
        <p className="text-[10px] text-amber-600/70 mt-1 truncate">✦ {equipment.bugiganga.name}</p>
      )}
      {hasUniqueWeapon && (equipment as UniqueWeapon).description && (
        <p className="text-[10px] text-amber-400/80 mt-1 truncate">✦ {(equipment as UniqueWeapon).description}</p>
      )}
    </button>
  );
}
