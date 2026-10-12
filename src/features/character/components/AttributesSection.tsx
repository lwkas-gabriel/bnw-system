import { useCharacterStore } from "../store/characterStore";
import { StatControl, SectionCard, Badge, NumberStepper, ToggleButton, StatTile, Callout } from "../../../shared/components";
import { bpn, characterMaxEnergy, CYBORG_ENERGY_BONUS, totalAttributePoints } from "../utils/attrCalc";
import { RACES } from "../../../data/races";
import type { RaceId, BaseAttributes } from "../../../shared/types/character";
import { ATTR_KEYS, ATTR_LABELS } from "../../../data/attributes";
import { computeAttrBreakdown, sumRows } from "../utils/attrBreakdown";

function AttrCell({ v, highlight }: { v: number; highlight?: boolean }) {
  if (!v) return <td className="px-2 py-1 text-center text-slate-700">—</td>;
  return (
    <td className={`px-2 py-1 text-center font-mono font-bold text-xs ${highlight ? "text-amber-400" : "text-slate-200"}`}>
      +{v}
    </td>
  );
}

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

  function increment(attr: keyof BaseAttributes) {
    if (remaining <= 0) return;
    updateDraft(c => { c.investedAttributes[attr]++; });
  }
  function decrement(attr: keyof BaseAttributes) {
    if ((draft as NonNullable<typeof draft>).investedAttributes[attr] <= 0) return;
    updateDraft(c => { c.investedAttributes[attr]--; });
  }

  const attrBase = { power: 1, precision: 1, defense: 1, constitution: 3 };
  const racialBonus = {
    power:        draft.racialBonus.power        ?? 0,
    precision:    draft.racialBonus.precision    ?? 0,
    defense:      draft.racialBonus.defense      ?? 0,
    constitution: draft.racialBonus.constitution ?? 0,
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
                onClick={() => updateDraft(c => {
                  c.race = r.value as RaceId;
                  // Sync racial attr bonus — non-humans get fixed bonus; humans get {} until they pick
                  const bonus = RACES[r.value as RaceId].attrBonus;
                  c.racialBonus = { ...bonus };
                })}
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
          <Callout className="mt-3 p-2 rounded-lg">
            <p className="text-xs text-amber-400">{raceData.specialAbility}</p>
          </Callout>
        )}

        {/* Human free attribute choice */}
        {draft.race === "human" && (
          <Callout className="mt-3 p-3 rounded-lg">
            <p className="text-xs font-medium text-amber-400 mb-2">
              Bônus Racial Humano — Escolha 1 atributo para +1 (fora do pool)
            </p>
            <div className="flex flex-wrap gap-2">
              {ATTR_KEYS.map(attr => {
                const chosen = (draft.racialBonus[attr] ?? 0) > 0;
                return (
                  <ToggleButton
                    key={attr}
                    active={chosen}
                    onClick={() => updateDraft(c => {
                      c.racialBonus = chosen ? {} : { [attr]: 1 };
                    })}
                    className="px-3 py-1.5 rounded text-xs"
                  >
                    {ATTR_LABELS[attr]}
                  </ToggleButton>
                );
              })}
            </div>
          </Callout>
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

        <div className="flex flex-wrap justify-around gap-4 py-2">
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
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
          {[
            { label: "BPN",     value: charBPN,                       sub: `3/4 × Lv.${draft.level}` },
            { label: "Energia", value: characterMaxEnergy(draft), sub: `Lv×3 + ${draft.energy.energyInvested}g${draft.cyborg?.shift3Bonus === "energy" ? ` +${CYBORG_ENERGY_BONUS} Cib` : ""}` },
          ].map(d => (
            <StatTile key={d.label} label={d.label} value={d.value} sub={d.sub} valueClassName="text-xl font-bold font-mono text-slate-200" />
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

      </SectionCard>

      {/* Combat Attr Summary */}
      {(() => {
        const rows = computeAttrBreakdown(draft);
        if (rows.length === 0) return null;
        const passiveRows = rows.filter(r => !r.isCombat);
        const combatRows  = rows.filter(r => r.isCombat);
        const passiveTotal = sumRows(passiveRows);
        const combatTotal  = sumRows(rows);
        const hasConTemp   = rows.some(r => r.conTemp);

        const HEADERS = ["POD", "PRE", "DEF", "CON"];

        return (
          <SectionCard title="Somatória de Atributos" icon="⚔️">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-1.5 pr-3 text-slate-500 font-medium uppercase tracking-widest">Fonte</th>
                    {HEADERS.map(h => (
                      <th key={h} className="px-2 py-1.5 text-slate-500 font-medium uppercase tracking-widest text-center w-12">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Passive rows */}
                  {passiveRows.map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/60">
                      <td className="py-1 pr-3 text-slate-400">{row.source}</td>
                      <AttrCell v={row.pod} /><AttrCell v={row.pre} /><AttrCell v={row.def} /><AttrCell v={row.con} />
                    </tr>
                  ))}
                  {/* Passive total */}
                  <tr className="border-b-2 border-slate-600 bg-slate-800/40">
                    <td className="py-1.5 pr-3 font-bold text-slate-300 uppercase tracking-wider text-[9px]">Total Passivo</td>
                    {[passiveTotal.pod, passiveTotal.pre, passiveTotal.def, passiveTotal.con].map((v, i) => (
                      <td key={i} className="px-2 py-1.5 text-center font-mono font-bold text-slate-200 text-xs">{v}</td>
                    ))}
                  </tr>

                  {/* Combat rows */}
                  {combatRows.length > 0 && (
                    <>
                      <tr>
                        <td colSpan={5} className="pt-2 pb-0.5 text-[9px] uppercase tracking-widest text-amber-600/70 font-semibold">
                          Em Combate (ativação necessária)
                        </td>
                      </tr>
                      {combatRows.map((row, i) => {
                        const isNote = !row.pod && !row.pre && !row.def && !row.con;
                        return (
                          <tr key={i} className="border-b border-slate-800/40">
                            <td className={`py-1 pr-3 ${isNote ? "text-amber-500/60 italic" : "text-amber-400/80"}`}>
                              {row.source}
                              {row.conTemp ? <span className="text-slate-500 ml-1">(+{row.conTemp} CON temp)</span> : null}
                            </td>
                            {isNote
                              ? <td colSpan={4} className="px-2 py-1 text-[9px] text-slate-600 text-center">ver descrição</td>
                              : (<><AttrCell v={row.pod} highlight /><AttrCell v={row.pre} highlight />
                                 <AttrCell v={row.def} highlight /><AttrCell v={row.con} highlight /></>)
                            }
                          </tr>
                        );
                      })}
                      {/* Combat total */}
                      <tr className="bg-amber-950/20">
                        <td className="py-1.5 pr-3 font-bold text-amber-400 uppercase tracking-wider text-[9px]">Total em Combate</td>
                        {[combatTotal.pod, combatTotal.pre, combatTotal.def, combatTotal.con].map((v, i) => (
                          <td key={i} className="px-2 py-1.5 text-center font-mono font-bold text-amber-400 text-xs">{v}</td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
              {hasConTemp && (
                <p className="text-[9px] text-slate-600 mt-2">* CON temp absorve dano antes da CON base; não some ao valor permanente.</p>
              )}
            </div>
          </SectionCard>
        );
      })()}

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
