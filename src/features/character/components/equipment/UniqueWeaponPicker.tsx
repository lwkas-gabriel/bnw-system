import { useState } from "react";
import { Button, SegmentedControl } from "../../../../shared/components";
import { UNIQUE_WEAPONS } from "../../../../data/uniqueWeapons";
import type { UniqueWeapon, EquipmentQuality, BaseAttributes } from "../../../../shared/types/character";
import { ATTR_SHORT_LABELS } from "../../../../data/attributes";
import { QUALITY_BONUS, SLOT_ATTRS } from "../../../../data/equipment";
import { QualityPicker } from "./QualityPicker";

// ─── Unique Weapon Picker ─────────────────────────────────────────────────────

interface UniqueWeaponPickerProps {
  current: UniqueWeapon | null;
  onSave: (eq: UniqueWeapon) => void;
  onClear: () => void;
}

export function UniqueWeaponPicker({ current, onSave, onClear }: UniqueWeaponPickerProps) {
  const weaponList = Object.values(UNIQUE_WEAPONS).sort((a, b) => a.name.localeCompare(b.name));
  const [selectedId, setSelectedId] = useState(current?.characteristic ?? weaponList[0].id);
  const [quality, setQuality]       = useState<EquipmentQuality>(current?.quality ?? "common");
  const [bonusAttr, setBonusAttr]   = useState<keyof BaseAttributes>(current?.bonusAttr ?? "precision");

  const weapon = UNIQUE_WEAPONS[selectedId];

  function handleSave() {
    if (!weapon) return;
    onSave({
      id: current?.id ?? crypto.randomUUID(),
      name: weapon.name,
      uniqueName: weapon.name,
      characteristic: weapon.id,
      description: weapon.effect,
      slot: "weapon",
      quality,
      bonusAttr,
      bonusValue: QUALITY_BONUS[quality],
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Arma Única</p>

      {/* Weapon select */}
      <div>
        <label className="block text-[10px] text-slate-500 mb-1">Arma</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value as typeof selectedId)}
          className="w-full bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 px-2 py-1.5 focus:outline-none focus:border-amber-600"
        >
          {weaponList.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Effect + origin */}
      {weapon && (
        <div className="p-2 bg-slate-800 rounded-lg space-y-1">
          <p className="text-[10px] text-amber-400">{weapon.effect}</p>
          <p className="text-[9px] text-slate-500 italic">{weapon.origin}</p>
          <p className="text-[9px] text-amber-600/70 font-mono">20g</p>
        </div>
      )}

      {/* Quality */}
      <div>
        <label className="block text-[10px] text-slate-500 mb-1">Qualidade</label>
        <QualityPicker value={quality} onChange={setQuality} />
      </div>

      {/* Bonus attribute */}
      <div>
        <label className="block text-[10px] text-slate-500 mb-1">Atributo bônus</label>
        <SegmentedControl
          options={SLOT_ATTRS.weapon.map(attr => ({ value: attr, label: ATTR_SHORT_LABELS[attr] }))}
          value={bonusAttr}
          onChange={setBonusAttr}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {current && (
          <Button variant="danger" size="sm" onClick={onClear}>Remover</Button>
        )}
        <Button variant="primary" size="sm" className="flex-1" onClick={handleSave}>
          Confirmar
        </Button>
      </div>
    </div>
  );
}
