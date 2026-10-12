import { useState } from "react";
import { useDraft } from "../hooks/useDraft";
import { SectionCard, Badge, ToggleButton } from "../../../shared/components";
import { GEM_COSTS } from "../../../data/gemCosts";
import type { Equipment, UniqueWeapon, EquipmentQuality, BaseAttributes } from "../../../shared/types/character";
import { ATTR_SHORT_LABELS } from "../../../data/attributes";
import { EQUIPMENT_PRICES, QUALITY_BONUS, QUALITY_LABELS } from "../../../data/equipment";
import { formatBerries } from "../../../shared/utils/format";
import { isUniqueWeapon } from "../utils/equipment";
import { DEFENSIVE_SLOTS } from "./equipment/equipmentForm";
import { SlotForm } from "./equipment/SlotForm";
import { UniqueWeaponPicker } from "./equipment/UniqueWeaponPicker";
import { EquipCard } from "./equipment/EquipCard";

// ─── Main Section ─────────────────────────────────────────────────────────────

type EditTarget = "weapon" | "def0" | "def1" | null;

export function EquipmentSection() {
  const { draft, updateDraft } = useDraft();
  const [editing, setEditing] = useState<EditTarget>(null);
  const [uniqueMode, setUniqueMode] = useState(false);

  if (!draft) return null;

  const hasUniqueWeapon = isUniqueWeapon(draft.equippedWeapon);

  function openWeaponEditor() {
    setUniqueMode(hasUniqueWeapon);
    setEditing("weapon");
  }

  function saveWeapon(eq: Equipment) {
    updateDraft(c => { c.equippedWeapon = eq; });
    setEditing(null);
  }

  function saveUniqueWeapon(eq: UniqueWeapon) {
    updateDraft(c => { c.equippedWeapon = eq; });
    setEditing(null);
  }

  function saveDef(idx: 0 | 1, eq: Equipment) {
    updateDraft(c => {
      c.equippedDefensive = [
        idx === 0 ? eq : c.equippedDefensive[0],
        idx === 1 ? eq : c.equippedDefensive[1],
      ];
    });
    setEditing(null);
  }

  function clearSlot(target: EditTarget) {
    if (target === "weapon") updateDraft(c => { c.equippedWeapon = null; });
    if (target === "def0")  updateDraft(c => { c.equippedDefensive[0] = null; });
    if (target === "def1")  updateDraft(c => { c.equippedDefensive[1] = null; });
    setEditing(null);
  }

  // Compute total equipment bonuses for summary
  const allEquip = [
    draft.equippedWeapon,
    draft.equippedDefensive[0],
    draft.equippedDefensive[1],
  ].filter(Boolean) as Equipment[];

  const bonusSummary: Partial<Record<keyof BaseAttributes, number>> = {};
  for (const eq of allEquip) {
    if (eq.bonusValue > 0) {
      bonusSummary[eq.bonusAttr as keyof BaseAttributes] =
        (bonusSummary[eq.bonusAttr as keyof BaseAttributes] ?? 0) + eq.bonusValue;
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <SectionCard
        title="Equipamentos"
        icon="🛡️"
        action={
          allEquip.length > 0 ? (
            <div className="flex gap-1.5">
              {(Object.entries(bonusSummary) as [keyof BaseAttributes, number][]).map(([attr, val]) => (
                <Badge key={attr} variant="amber">+{val} {ATTR_SHORT_LABELS[attr]}</Badge>
              ))}
            </div>
          ) : undefined
        }
      >
        <p className="text-xs text-slate-500 mb-4">
          3 slots: 1 arma + 2 peças defensivas. Qualidade Esplêndida = +1 atributo; Lendária = +2. Sem custo em gemas.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Weapon */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Arma</p>
            <EquipCard
              label="Arma"
              equipment={draft.equippedWeapon}
              hasUniqueWeapon={hasUniqueWeapon}
              onEdit={openWeaponEditor}
            />
          </div>
          {/* Defensive 1 */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Defensivo 1</p>
            <EquipCard
              label="Defensivo 1"
              equipment={draft.equippedDefensive[0]}
              onEdit={() => setEditing("def0")}
            />
          </div>
          {/* Defensive 2 */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Defensivo 2</p>
            <EquipCard
              label="Defensivo 2"
              equipment={draft.equippedDefensive[1]}
              onEdit={() => setEditing("def1")}
            />
          </div>
        </div>

        {/* Edit form */}
        {editing === "weapon" && (
          <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg space-y-3">
            {/* Toggle unique / common */}
            <div className="flex gap-2">
              <ToggleButton active={!uniqueMode} onClick={() => setUniqueMode(false)} className="flex-1 py-1.5 rounded text-xs">
                Arma Comum
              </ToggleButton>
              <ToggleButton active={uniqueMode} onClick={() => setUniqueMode(true)} className="flex-1 py-1.5 rounded text-xs">
                Arma Única <span className="text-[10px] opacity-75">{GEM_COSTS.uniqueWeapon}g</span>
              </ToggleButton>
            </div>
            {uniqueMode ? (
              <UniqueWeaponPicker
                current={hasUniqueWeapon ? draft.equippedWeapon as UniqueWeapon : null}
                onSave={saveUniqueWeapon}
                onClear={() => clearSlot("weapon")}
              />
            ) : (
              <SlotForm
                title="Configurar Arma"
                slotOptions={["weapon"]}
                current={!hasUniqueWeapon ? draft.equippedWeapon : null}
                isWeapon
                onSave={saveWeapon}
                onClear={() => clearSlot("weapon")}
              />
            )}
          </div>
        )}
        {editing === "def0" && (
          <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg">
            <SlotForm
              title="Configurar Defensivo 1"
              slotOptions={DEFENSIVE_SLOTS}
              current={draft.equippedDefensive[0]}
              isWeapon={false}
              onSave={eq => saveDef(0, eq)}
              onClear={() => clearSlot("def0")}
            />
          </div>
        )}
        {editing === "def1" && (
          <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg">
            <SlotForm
              title="Configurar Defensivo 2"
              slotOptions={DEFENSIVE_SLOTS}
              current={draft.equippedDefensive[1]}
              isWeapon={false}
              onSave={eq => saveDef(1, eq)}
              onClear={() => clearSlot("def1")}
            />
          </div>
        )}
      </SectionCard>

      {/* Price reference */}
      <SectionCard title="Referência de Preços" icon="💰">
        <div className="grid grid-cols-2 gap-3">
          {(["common", "splendid", "legendary"] as EquipmentQuality[]).map(q => (
            <div key={q} className="col-span-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">
                {QUALITY_LABELS[q]} {QUALITY_BONUS[q] > 0 ? `(+${QUALITY_BONUS[q]})` : "(sem bônus)"}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs px-2 py-1 bg-slate-800 rounded">
                  <span className="text-slate-400">Arma</span>
                  <span className="font-mono text-slate-300">
                    {formatBerries(EQUIPMENT_PRICES.weapon[q])}
                  </span>
                </div>
                <div className="flex justify-between text-xs px-2 py-1 bg-slate-800 rounded">
                  <span className="text-slate-400">Defensivo</span>
                  <span className="font-mono text-slate-300">
                    {formatBerries(EQUIPMENT_PRICES.defensive[q])}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
