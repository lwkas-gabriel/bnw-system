import { useState } from "react";
import { Button, Input, SegmentedControl } from "../../../../shared/components";
import { BUGIGANGAS, BUGIGANGAS_BY_ID } from "../../../../data/bugigangas";
import type { Equipment, EquipmentSlot, EquipmentQuality } from "../../../../shared/types/character";
import { ATTR_SHORT_LABELS } from "../../../../data/attributes";
import { EQUIPMENT_PRICES, QUALITY_BONUS, SLOT_ATTRS, SLOT_LABELS } from "../../../../data/equipment";
import { formatBerries } from "../../../../shared/utils/format";
import { blankEquipment } from "./equipmentForm";
import { QualityPicker } from "./QualityPicker";

// ─── Slot Edit Form ───────────────────────────────────────────────────────────

interface SlotFormProps {
  title: string;
  slotOptions: EquipmentSlot[];
  current: Equipment | null;
  isWeapon: boolean;
  onSave: (eq: Equipment) => void;
  onClear: () => void;
}

export function SlotForm({ title, slotOptions, current, isWeapon, onSave, onClear }: SlotFormProps) {
  const [eq, setEq] = useState<Equipment>(() =>
    current ? { ...current } : blankEquipment(slotOptions[0])
  );

  const allowedAttrs = SLOT_ATTRS[eq.slot];
  const priceKey = isWeapon ? "weapon" : "defensive";
  const price = EQUIPMENT_PRICES[priceKey][eq.quality];

  function handleChange<K extends keyof Equipment>(key: K, value: Equipment[K]) {
    setEq(prev => {
      const next = { ...prev, [key]: value };
      // When slot changes, reset bonusAttr to first valid
      if (key === "slot") {
        next.bonusAttr = SLOT_ATTRS[value as EquipmentSlot][0];
      }
      // When quality changes, update bonusValue
      if (key === "quality") {
        next.bonusValue = QUALITY_BONUS[value as EquipmentQuality];
      }
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{title}</p>

      {/* Slot */}
      {slotOptions.length > 1 && (
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Slot</label>
          <SegmentedControl
            className="flex flex-wrap gap-1.5"
            buttonClassName="px-2.5 py-1 rounded text-xs"
            options={slotOptions.map(s => ({ value: s, label: SLOT_LABELS[s] }))}
            value={eq.slot}
            onChange={s => handleChange("slot", s)}
          />
        </div>
      )}

      {/* Name */}
      <Input
        label="Nome"
        placeholder={`Ex: ${isWeapon ? "Espada de Ferro" : "Armadura de Couro"}`}
        value={eq.name}
        onChange={e => handleChange("name", e.target.value)}
      />

      {/* Quality */}
      <div>
        <label className="block text-[10px] text-slate-500 mb-1">Qualidade</label>
        <QualityPicker value={eq.quality} onChange={q => handleChange("quality", q)} />
      </div>

      {/* Bonus attribute */}
      <div>
        <label className="block text-[10px] text-slate-500 mb-1">Atributo bônus</label>
        <SegmentedControl
          options={allowedAttrs.map(attr => ({ value: attr, label: ATTR_SHORT_LABELS[attr] }))}
          value={eq.bonusAttr}
          onChange={attr => handleChange("bonusAttr", attr)}
        />
      </div>

      {/* Bugiganga */}
      <div>
        <label className="block text-[10px] text-slate-500 mb-1">Bugiganga (opcional)</label>
        <select
          value={eq.bugiganga?.name ?? ""}
          onChange={e => {
            if (!e.target.value) {
              handleChange("bugiganga", undefined);
              return;
            }
            const bug = BUGIGANGAS_BY_ID[e.target.value];
            if (bug) {
              handleChange("bugiganga", {
                name: bug.name,
                quality: bug.quality,
                periciaBonus: bug.periciaBonus
                  ? { pericia: bug.periciaBonus.pericia, value: bug.periciaBonus.value }
                  : undefined,
                interpretive: bug.interpretive,
              });
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 px-2 py-1.5 focus:outline-none focus:border-amber-600"
        >
          <option value="">— Sem bugiganga —</option>
          {BUGIGANGAS.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        {eq.bugiganga && (
          <p className="text-[10px] text-slate-500 mt-1">
            {eq.bugiganga.periciaBonus
              ? `+${eq.bugiganga.periciaBonus.value} ${eq.bugiganga.periciaBonus.pericia}`
              : eq.bugiganga.interpretive ?? ""}
          </p>
        )}
      </div>

      {/* Price note */}
      <p className="text-[10px] text-slate-600">
        Preço: <span className="font-mono text-slate-500">{formatBerries(price)}</span>
        {" · "} Sem custo em gemas.
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        {current && (
          <Button variant="danger" size="sm" onClick={onClear}>
            Remover
          </Button>
        )}
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          disabled={!eq.name.trim()}
          onClick={() => onSave({ ...eq, bonusValue: QUALITY_BONUS[eq.quality] })}
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}
