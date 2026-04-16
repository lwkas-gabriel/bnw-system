import { useCharacterStore } from "../store/characterStore";
import { StatControl, SectionCard, Badge, NumberStepper } from "../../../shared/components";
import { bpn, totalAttributePoints } from "../utils/attrCalc";
import { RACES } from "../../../data/races";
import type { RaceId } from "../../../shared/types/character";

const RACE_OPTIONS = Object.values(RACES).map(r => ({ value: r.id, label: r.name }));

export function AttributesSection() {
  const { draft, updateDraft, errors, budget } = useCharacterStore();
  if (!draft) return null;

  const charBPN = bpn(draft.level);
  const maxPoints = totalAttributePoints(draft.level);
  const usedPoints =
    draft.investedAttributes.power +
    draft.investedAttributes.precision +
    draft.investedAttributes.defense +
    draft.investedAttributes.constitution;
  const remaining = maxPoints - usedPoints;
  const raceData = RACES[draft.race];

  function increment(attr: keyof typeof draft.investedAttributes) {
    if (remaining <= 0) return;
    updateDraft(c => { c.investedAttributes[attr]++; });
  }
  function decrement(attr: keyof typeof draft.investedAttributes) {
    if (draft.investedAttributes[attr] <= 0) return;
    updateDraft(c => { c.investedAttributes[attr]--; });
  }

  const attrBase = { power: 1, precision: 1, defense: 1, constitution: 3 };
  const racialBonus = {
    power:        raceData.attrBonus.power        ?? 0,
    precision:    raceData.attrBonus.precision    ?? 0,
    defense:      raceData.attrBonus.defense      ?? 0,
    constitution: raceData.attrBonus.constitution ?? 0,
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Race */}
      <SectionCard title="Raça" icon="🌍">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {RACE_OPTIONS.map(r => {
            const data = RACES[r.value as RaceId];
            const isSelected = draft.race === r.value;
            return (
              <button
                key={r.value}
                onClick={() => updateDraft(c => { c.race = r.value as RaceId; })}
                className={`p-3 rounded-xl border text-left transition-all duration-150 ${
                  isSelected
                    ? "border-amber-600 bg-amber-900/20"
                    : "border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800"
                }`}
              >
                <p className={`text-xs font-semibold mb-1 ${isSelected ? "text-amber-400" : "text-slate-300"}`}>
                  {data.name}
                </p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(data.attrBonus).map(([k, v]) => (
                    <span key={k} className="text-[9px] text-slate-500">
                      +{v} {k.slice(0, 3).toUpperCase()}
                    </span>
                  ))}
                  {data.periciaBonus && (
                    <span className="text-[9px] text-slate-500">
                      +{data.periciaBonus.value} {data.periciaBonus.pericia}
                    </span>
                  )}
                  {data.specialAbility && (
                    <span className="text-[9px] text-amber-600">Especial</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {raceData.specialAbility && (
          <div className="mt-3 p-2 bg-amber-950/30 border border-amber-800/40 rounded-lg">
            <p className="text-xs text-amber-400">{raceData.specialAbility}</p>
          </div>
        )}
      </SectionCard>

      {/* Attributes */}
      <SectionCard
        title="Atributos"
        icon="📊"
        action={
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold ${remaining < 0 ? "text-red-400" : remaining === 0 ? "text-slate-500" : "text-green-400"}`}>
              {remaining >= 0 ? remaining : 0} pts restantes
            </span>
            <Badge variant={remaining < 0 ? "red" : "amber"}>
              {usedPoints}/{maxPoints}
            </Badge>
          </div>
        }
      >
        {errors.attributes?.length > 0 && (
          <div className="mb-3 p-2 bg-red-950/40 border border-red-800/50 rounded-lg">
            {errors.attributes.map((e, i) => (
              <p key={i} className="text-xs text-red-400">{e}</p>
            ))}
          </div>
        )}

        <div className="flex justify-around py-2">
          <StatControl
            label="Poder"
            shortLabel="POD"
            value={attrBase.power + (draft.racialBonus.power ?? 0) + draft.investedAttributes.power}
            base={draft.investedAttributes.power}
            bonuses={attrBase.power + (racialBonus.power)}
            onIncrement={() => increment("power")}
            onDecrement={() => decrement("power")}
            color="red"
          />
          <StatControl
            label="Precisão"
            shortLabel="PRE"
            value={attrBase.precision + (draft.racialBonus.precision ?? 0) + draft.investedAttributes.precision}
            base={draft.investedAttributes.precision}
            bonuses={attrBase.precision + racialBonus.precision}
            onIncrement={() => increment("precision")}
            onDecrement={() => decrement("precision")}
            color="blue"
          />
          <StatControl
            label="Defesa"
            shortLabel="DEF"
            value={attrBase.defense + (draft.racialBonus.defense ?? 0) + draft.investedAttributes.defense}
            base={draft.investedAttributes.defense}
            bonuses={attrBase.defense + racialBonus.defense}
            onIncrement={() => increment("defense")}
            onDecrement={() => decrement("defense")}
            color="green"
          />
          <StatControl
            label="Constituição"
            shortLabel="CON"
            value={attrBase.constitution + (draft.racialBonus.constitution ?? 0) + draft.investedAttributes.constitution}
            base={draft.investedAttributes.constitution}
            bonuses={attrBase.constitution + racialBonus.constitution}
            onIncrement={() => increment("constitution")}
            onDecrement={() => decrement("constitution")}
            color="amber"
          />
        </div>

        {/* Derived */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
          {[
            { label: "BPN",     value: charBPN,                       sub: `3/4 × Lv.${draft.level}` },
            { label: "Energia", value: draft.level * 3 + draft.energy.energyInvested, sub: `Lv×3 + ${draft.energy.energyInvested}g` },
            { label: "Ambição", value: draft.ambition,               sub: "0–5" },
          ].map(d => (
            <div key={d.label} className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{d.label}</p>
              <p className="text-xl font-bold font-mono text-slate-200">{d.value}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{d.sub}</p>
            </div>
          ))}
        </div>

        {/* Energy investment */}
        <div className="mt-3 flex items-center justify-between p-3 bg-slate-800 rounded-lg">
          <div>
            <p className="text-xs font-medium text-slate-300">Gemas em energia</p>
            <p className="text-[10px] text-slate-500">1 gema = +1 de energia</p>
          </div>
          <NumberStepper
            value={draft.energy.energyInvested}
            min={0}
            max={draft.gemBudget}
            onChange={v => updateDraft(c => { c.energy.energyInvested = v; })}
          />
        </div>

        {/* Ambition */}
        <div className="mt-2 flex items-center justify-between p-3 bg-slate-800 rounded-lg">
          <div>
            <p className="text-xs font-medium text-slate-300">Ambição</p>
            <p className="text-[10px] text-slate-500">Usado pelo Haki do Rei Avançado</p>
          </div>
          <NumberStepper
            value={draft.ambition}
            min={0}
            max={5}
            onChange={v => updateDraft(c => { c.ambition = v; })}
          />
        </div>
      </SectionCard>

      {/* Budget breakdown */}
      {budget && (
        <SectionCard title="Gemas — Breakdown" icon="💎">
          {budget.breakdown.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-4">Nenhum caminho adquirido ainda.</p>
          ) : (
            <div className="space-y-1">
              {budget.breakdown.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800 last:border-0">
                  <div>
                    <span className="text-slate-500 mr-2">{b.category}</span>
                    <span className="text-slate-400">{b.detail}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">{b.cost}g</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs pt-2 font-bold">
                <span className="text-slate-300">Total gasto</span>
                <span className={`font-mono text-sm ${budget.isOverBudget ? "text-red-400" : "text-amber-400"}`}>
                  {budget.spent}g / {budget.total}g
                </span>
              </div>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
