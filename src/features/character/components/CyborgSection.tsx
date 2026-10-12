import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Button, Badge } from "../../../shared/components";
import type { CyborgShiftData, CyborgShiftLocation, CyborgGear, CyborgPath } from "../../../shared/types/character";
import { ATTR_KEYS, ATTR_SHORT_LABELS } from "../../../data/attributes";

// ─── Static data ──────────────────────────────────────────────────────────────

const LOCATIONS: { value: CyborgShiftLocation; label: string; attrBonus: string }[] = [
  { value: "head",       label: "Cabeça",         attrBonus: "+4 PRE" },
  { value: "right_arm",  label: "Braço Direito",  attrBonus: "+4 POD" },
  { value: "left_arm",   label: "Braço Esquerdo", attrBonus: "+4 POD" },
  { value: "right_leg",  label: "Perna Direita",  attrBonus: "+4 DEF" },
  { value: "left_leg",   label: "Perna Esquerda", attrBonus: "+4 DEF" },
  { value: "torso",      label: "Tronco",         attrBonus: "+4 CON" },
];

const GEARS: { value: CyborgGear; label: string; description: string }[] = [
  { value: "overclock", label: "Overclock", description: "Dobra custo de combustível de 1 técnica/turno; concede +metade do efeito (arredonda ↑)." },
  { value: "laser",     label: "Laser",     description: "+2 Dano +2 Dano Direto à CON (ignora CON temp). Custo: 5 EN/turno. Requer acerto." },
  { value: "drone",     label: "Drone",     description: "+2 PRE +2 em rolagens de ataque. Impede falha crítica; facilita crítico. Custo: 5 EN/turno." },
  { value: "mecha",     label: "Mecha",     description: "+4 CON temp por 5 EN/turno. Consumida primeiro por ataques." },
  { value: "stealth",   label: "Stealth",   description: "Força oponente a rolar 2 dados de ataque e usar o menor. 1× por turno. Custo: 5 EN/turno." },
];

function newShift(shiftNumber: number, usedLocations: CyborgShiftLocation[]): CyborgShiftData {
  const available = LOCATIONS.filter(l => !usedLocations.includes(l.value));
  return {
    shiftNumber: shiftNumber as 1 | 2 | 3 | 4 | 5 | 6,
    location: available[0]?.value ?? "head",
    name: "",
    description: "",
    bugigangaId: null,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CyborgSection() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  const cyborg = draft.cyborg;
  const shifts = cyborg?.shifts ?? [];
  const usedLocations = shifts.map(s => s.location);

  function initCyborg() {
    updateDraft(c => {
      c.cyborg = {
        shifts: [newShift(1, [])],
        shift3Bonus: null,
        gear: null,
        usesFuel: false,
      };
    });
  }

  function addShift() {
    if (shifts.length >= 6) return;
    updateDraft(c => {
      if (!c.cyborg) return;
      const next = newShift(c.cyborg.shifts.length + 1, c.cyborg.shifts.map(s => s.location));
      c.cyborg.shifts.push(next);
      c.cyborg.usesFuel = c.cyborg.shifts.length >= 3;
    });
  }

  function removeShift(idx: number) {
    updateDraft(c => {
      if (!c.cyborg) return;
      c.cyborg.shifts.splice(idx, 1);
      // Re-number
      c.cyborg.shifts.forEach((s, i) => { s.shiftNumber = (i + 1) as 1|2|3|4|5|6; });
      c.cyborg.usesFuel = c.cyborg.shifts.length >= 3;
      // Clear bonus if < 3 shifts
      if (c.cyborg.shifts.length < 3) c.cyborg.shift3Bonus = null;
      // Clear gear if < 6 shifts
      if (c.cyborg.shifts.length < 6) c.cyborg.gear = null;
    });
  }

  function updateShift(idx: number, patch: Partial<CyborgShiftData>) {
    updateDraft(c => {
      if (!c.cyborg) return;
      Object.assign(c.cyborg.shifts[idx], patch);
    });
  }

  function setCyborg(patch: Partial<CyborgPath>) {
    updateDraft(c => {
      if (!c.cyborg) return;
      Object.assign(c.cyborg, patch);
    });
  }

  function removeCyborg() {
    updateDraft(c => { c.cyborg = null; });
  }

  const canAddShift = shifts.length < 6;
  const showShift3Bonus = shifts.length >= 3;
  const gearUnavailableReason = shifts.length < 6
    ? "Requer 6 shifts"
    : draft.location !== "new_world"
      ? "Requer New World"
      : null;

  // Attribute bonus summary
  const attrBonuses = shifts.reduce(
    (acc, s) => {
      const loc = LOCATIONS.find(l => l.value === s.location);
      if (!loc) return acc;
      if (s.location === "head")      acc.precision += 4;
      if (s.location === "right_arm") acc.power += 4;
      if (s.location === "left_arm")  acc.power += 4;
      if (s.location === "right_leg") acc.defense += 4;
      if (s.location === "left_leg")  acc.defense += 4;
      if (s.location === "torso")     acc.constitution += 4;
      return acc;
    },
    { power: 0, precision: 0, defense: 0, constitution: 0 }
  );

  if (!cyborg) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <span className="text-5xl opacity-30">🦾</span>
          <p className="text-slate-400 font-medium">Caminho Ciborgue não iniciado</p>
          <p className="text-sm text-slate-600 max-w-xs">
            6 shifts × 20g = 120g. Cada shift modifica uma parte do corpo e concede bônus de atributo.
          </p>
          <Button variant="primary" onClick={initCyborg}>
            + Iniciar Ciborgue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Summary */}
      <SectionCard title="Resumo" icon="🦾" action={
        <Button size="sm" variant="danger" onClick={removeCyborg}>Remover</Button>
      }>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {ATTR_KEYS.map(attr => {
            const val = attrBonuses[attr];
            return (
              <div key={attr} className="bg-slate-800 rounded-lg p-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">{ATTR_SHORT_LABELS[attr]}</p>
                <p className={`text-sm font-bold font-mono ${val > 0 ? "text-amber-400" : "text-slate-600"}`}>
                  {val > 0 ? `+${val}` : "—"}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-slate-500">{shifts.length}/6 shifts</span>
          {cyborg.usesFuel && <Badge variant="amber">Combustível ativo</Badge>}
          {cyborg.gear && <Badge variant="green">Gear: {GEARS.find(g => g.value === cyborg.gear)?.label}</Badge>}
          {cyborg.shift3Bonus === "techniques" && <Badge variant="blue">+2 Técnicas Rank A</Badge>}
          {cyborg.shift3Bonus === "energy" && <Badge variant="blue">+20 Energia</Badge>}
        </div>
      </SectionCard>

      {/* Shifts */}
      <SectionCard title="Shifts" icon="⚙️" action={
        canAddShift
          ? <Button size="sm" variant="amber" onClick={addShift}>+ Shift</Button>
          : <span className="text-xs text-slate-500">Máximo atingido</span>
      }>
        <div className="space-y-3">
          {shifts.map((shift, idx) => {
            const locData = LOCATIONS.find(l => l.value === shift.location);
            const availableForThisShift = LOCATIONS.filter(
              l => l.value === shift.location || !usedLocations.includes(l.value)
            );
            return (
              <div key={idx} className="bg-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400">Shift {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    {locData && <Badge variant="slate">{locData.attrBonus}</Badge>}
                    <button
                      onClick={() => removeShift(idx)}
                      className="text-slate-600 hover:text-red-400 text-xs transition-colors"
                    >✕</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Location */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider">Localização</label>
                    <select
                      value={shift.location}
                      onChange={e => updateShift(idx, { location: e.target.value as CyborgShiftLocation })}
                      className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-600"
                    >
                      {availableForThisShift.map(l => (
                        <option key={l.value} value={l.value}>{l.label} ({l.attrBonus})</option>
                      ))}
                    </select>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider">Nome / apelido</label>
                    <input
                      value={shift.name}
                      onChange={e => updateShift(idx, { name: e.target.value })}
                      placeholder={`Ex: Braço de aço`}
                      className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider">Descrição (opcional)</label>
                  <input
                    value={shift.description}
                    onChange={e => updateShift(idx, { description: e.target.value })}
                    placeholder="Descrição visual ou funcional"
                    className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-600"
                  />
                </div>

                {/* Bugiganga */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider">Bugiganga instalada</label>
                  <input
                    value={shift.bugigangaId ?? ""}
                    onChange={e => updateShift(idx, { bugigangaId: e.target.value || null })}
                    placeholder="Nome da bugiganga (ou vazio)"
                    className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Shift 3 Bonus */}
      {showShift3Bonus && (
        <SectionCard title="Bônus do 3º Shift" icon="⚡">
          <p className="text-xs text-slate-500 mb-3">
            A partir do 3º shift o corpo opera por combustível. Escolha um bônus permanente:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([
              { id: "techniques", label: "2 Técnicas Rank A", desc: "Duas técnicas gratuitas (source: ciborgue)." },
              { id: "energy",     label: "+20 de Energia",    desc: "Bônus fixo de +20 EN permanente." },
            ] as const).map(opt => (
              <button
                key={opt.id}
                onClick={() => setCyborg({ shift3Bonus: opt.id })}
                className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-all ${
                  cyborg.shift3Bonus === opt.id
                    ? "border-amber-500 bg-amber-950/20 text-amber-300"
                    : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500"
                }`}
              >
                <span className="text-xs font-semibold">{opt.label}</span>
                <span className="text-[10px] opacity-70">{opt.desc}</span>
              </button>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Gear */}
      <SectionCard title="Gear" icon="🔩">
        {gearUnavailableReason ? (
          <p className="text-xs text-slate-500 text-center py-4">
            🔒 {gearUnavailableReason} — Gear disponível com 6 shifts no New World (custo: 20g).
          </p>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-3">Apenas 1 Gear por Ciborgue. Custo: 20g.</p>
            <div className="space-y-2">
              {GEARS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setCyborg({ gear: cyborg.gear === g.value ? null : g.value })}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    cyborg.gear === g.value
                      ? "border-amber-500 bg-amber-950/20"
                      : "border-slate-700 bg-slate-800/40 hover:border-slate-500"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${cyborg.gear === g.value ? "text-amber-300" : "text-slate-300"}`}>
                      {g.label}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{g.description}</p>
                  </div>
                  {cyborg.gear === g.value && <span className="text-amber-400 text-xs flex-shrink-0">✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </SectionCard>

    </div>
  );
}
