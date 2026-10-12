import { useState } from "react";
import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Button, Input, Badge } from "../../../shared/components";
import { BUGIGANGAS } from "../../../data/bugigangas";
import { UNIQUE_WEAPONS } from "../../../data/uniqueWeapons";
import type {
  Equipment,
  UniqueWeapon,
  EquipmentSlot,
  EquipmentQuality,
  BaseAttributes,
} from "../../../shared/types/character";
import { ATTR_SHORT_LABELS } from "../../../data/attributes";
import { EQUIPMENT_PRICES, QUALITY_BONUS, QUALITY_LABELS, SLOT_ATTRS, SLOT_LABELS } from "../../../data/equipment";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFENSIVE_SLOTS: EquipmentSlot[] = ["head", "arms", "torso", "legs"];

// ─── Blank Equipment Factory ──────────────────────────────────────────────────

function blankEquipment(slot: EquipmentSlot): Equipment {
  const attrs = SLOT_ATTRS[slot];
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    slot,
    quality: "common",
    bonusAttr: attrs[0],
    bonusValue: 0,
  };
}

// ─── Slot Edit Form ───────────────────────────────────────────────────────────

interface SlotFormProps {
  title: string;
  slotOptions: EquipmentSlot[];
  current: Equipment | null;
  isWeapon: boolean;
  onSave: (eq: Equipment) => void;
  onClear: () => void;
}

function SlotForm({ title, slotOptions, current, isWeapon, onSave, onClear }: SlotFormProps) {
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
          <div className="flex flex-wrap gap-1.5">
            {slotOptions.map(s => (
              <button
                key={s}
                onClick={() => handleChange("slot", s)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  eq.slot === s
                    ? "bg-amber-600 text-white"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                {SLOT_LABELS[s]}
              </button>
            ))}
          </div>
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
        <div className="flex gap-1.5">
          {(["common", "splendid", "legendary"] as EquipmentQuality[]).map(q => (
            <button
              key={q}
              onClick={() => handleChange("quality", q)}
              className={`flex-1 px-2 py-1.5 rounded text-xs transition-colors ${
                eq.quality === q
                  ? "bg-amber-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {QUALITY_LABELS[q]}
              {QUALITY_BONUS[q] > 0 && (
                <span className="ml-1 opacity-75">+{QUALITY_BONUS[q]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bonus attribute */}
      <div>
        <label className="block text-[10px] text-slate-500 mb-1">Atributo bônus</label>
        <div className="flex gap-1.5">
          {allowedAttrs.map(attr => (
            <button
              key={attr}
              onClick={() => handleChange("bonusAttr", attr)}
              className={`flex-1 px-2 py-1.5 rounded text-xs transition-colors ${
                eq.bonusAttr === attr
                  ? "bg-amber-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {ATTR_SHORT_LABELS[attr]}
            </button>
          ))}
        </div>
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
            const bug = BUGIGANGAS.find(b => b.id === e.target.value);
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
        Preço: <span className="font-mono text-slate-500">₿{price.toLocaleString("pt-BR")}</span>
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

// ─── Unique Weapon Picker ─────────────────────────────────────────────────────

interface UniqueWeaponPickerProps {
  current: UniqueWeapon | null;
  onSave: (eq: UniqueWeapon) => void;
  onClear: () => void;
}

function UniqueWeaponPicker({ current, onSave, onClear }: UniqueWeaponPickerProps) {
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
        <div className="flex gap-1.5">
          {(["common", "splendid", "legendary"] as EquipmentQuality[]).map(q => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`flex-1 px-2 py-1.5 rounded text-xs transition-colors ${
                quality === q ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {QUALITY_LABELS[q]}
              {QUALITY_BONUS[q] > 0 && <span className="ml-1 opacity-75">+{QUALITY_BONUS[q]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Bonus attribute */}
      <div>
        <label className="block text-[10px] text-slate-500 mb-1">Atributo bônus</label>
        <div className="flex gap-1.5">
          {(["precision", "power"] as (keyof BaseAttributes)[]).map(attr => (
            <button
              key={attr}
              onClick={() => setBonusAttr(attr)}
              className={`flex-1 px-2 py-1.5 rounded text-xs transition-colors ${
                bonusAttr === attr ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {ATTR_SHORT_LABELS[attr]}
            </button>
          ))}
        </div>
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

// ─── Equipment Card ───────────────────────────────────────────────────────────

interface EquipCardProps {
  label: string;
  equipment: Equipment | null;
  isUniqueWeapon?: boolean;
  onEdit: () => void;
}

function EquipCard({ label, equipment, isUniqueWeapon, onEdit }: EquipCardProps) {
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
        isUniqueWeapon ? "border-amber-700/50" : "border-slate-700"
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
      {isUniqueWeapon && (equipment as UniqueWeapon).description && (
        <p className="text-[10px] text-amber-400/80 mt-1 truncate">✦ {(equipment as UniqueWeapon).description}</p>
      )}
    </button>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

type EditTarget = "weapon" | "def0" | "def1" | null;

export function EquipmentSection() {
  const { draft, updateDraft } = useCharacterStore();
  const [editing, setEditing] = useState<EditTarget>(null);
  const [uniqueMode, setUniqueMode] = useState(false);

  if (!draft) return null;

  const isUniqueWeapon = !!draft.equippedWeapon && "characteristic" in draft.equippedWeapon;

  function openWeaponEditor() {
    setUniqueMode(isUniqueWeapon);
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
              isUniqueWeapon={isUniqueWeapon}
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
              <button
                onClick={() => setUniqueMode(false)}
                className={`flex-1 py-1.5 rounded text-xs transition-colors ${
                  !uniqueMode ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                Arma Comum
              </button>
              <button
                onClick={() => setUniqueMode(true)}
                className={`flex-1 py-1.5 rounded text-xs transition-colors ${
                  uniqueMode ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                Arma Única <span className="text-[10px] opacity-75">20g</span>
              </button>
            </div>
            {uniqueMode ? (
              <UniqueWeaponPicker
                current={isUniqueWeapon ? draft.equippedWeapon as UniqueWeapon : null}
                onSave={saveUniqueWeapon}
                onClear={() => clearSlot("weapon")}
              />
            ) : (
              <SlotForm
                title="Configurar Arma"
                slotOptions={["weapon"]}
                current={!isUniqueWeapon ? draft.equippedWeapon : null}
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
                    ₿{EQUIPMENT_PRICES.weapon[q].toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between text-xs px-2 py-1 bg-slate-800 rounded">
                  <span className="text-slate-400">Defensivo</span>
                  <span className="font-mono text-slate-300">
                    ₿{EQUIPMENT_PRICES.defensive[q].toLocaleString("pt-BR")}
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
