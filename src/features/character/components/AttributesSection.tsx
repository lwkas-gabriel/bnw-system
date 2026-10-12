import { useCharacterStore } from "../store/characterStore";
import { StatControl, SectionCard, Badge, NumberStepper } from "../../../shared/components";
import { bpn, characterMaxEnergy, CYBORG_ENERGY_BONUS, totalAttributePoints } from "../utils/attrCalc";
import { hakiStageNum } from "../utils/haki";
import { RACES } from "../../../data/races";
import type {
  RaceId, BaseAttributes, Character,
  ZoanAkuma, LogiaAkuma, ParameciaAkuma,
} from "../../../shared/types/character";
import { ATTR_KEYS, ATTR_LABELS } from "../../../data/attributes";
import { faixaStatBonuses, hasReachedFaixa } from "../../../data/artesMarciais";
import { CYBORG_LOCATIONS_BY_ID } from "../../../data/cyborg";

// ─── Attr Breakdown ───────────────────────────────────────────────────────────

interface AttrRow {
  source: string;
  pod: number; pre: number; def: number; con: number;
  conTemp?: number; // Haki armamento gera CON temporária, não permanente
  isCombat?: boolean;
}



function computeAttrBreakdown(char: Character): AttrRow[] {
  const rows: AttrRow[] = [];

  function add(source: string, pod: number, pre: number, def: number, con: number, opts?: { isCombat?: boolean; conTemp?: number }) {
    if (pod || pre || def || con || opts?.conTemp) {
      rows.push({ source, pod, pre, def, con, ...opts });
    }
  }

  // Base
  add("Base", 1, 1, 1, 3);

  // Racial (use stored racialBonus so human free choice is reflected)
  const rb = char.racialBonus;
  add("Raça", rb.power ?? 0, rb.precision ?? 0, rb.defense ?? 0, rb.constitution ?? 0);

  // Invested
  const ia = char.investedAttributes;
  add("Investido", ia.power, ia.precision, ia.defense, ia.constitution);

  // Equipment
  const equips = [char.equippedWeapon, char.equippedDefensive[0], char.equippedDefensive[1]].filter(Boolean);
  for (const eq of equips as NonNullable<typeof equips[number]>[]) {
    if (!eq.bonusValue) continue;
    const a = eq.bonusAttr as keyof BaseAttributes;
    const label = eq.name || eq.slot;
    add(label,
      a === "power" ? eq.bonusValue : 0,
      a === "precision" ? eq.bonusValue : 0,
      a === "defense" ? eq.bonusValue : 0,
      a === "constitution" ? eq.bonusValue : 0,
    );
  }

  // Ciborgue shifts (+4 por localização)
  if (char.cyborg) {
    const shiftTotals: Partial<Record<keyof BaseAttributes, number>> = {};
    for (const shift of char.cyborg.shifts) {
      const attr = CYBORG_LOCATIONS_BY_ID[shift.location].attr;
      if (attr) shiftTotals[attr] = (shiftTotals[attr] ?? 0) + 4;
    }
    add("Ciborgue (shifts)",
      shiftTotals.power ?? 0, shiftTotals.precision ?? 0,
      shiftTotals.defense ?? 0, shiftTotals.constitution ?? 0,
    );
  }

  // Akuma
  if (char.akuma) {
    if (char.akuma.type === "zoan") {
      const z = char.akuma as ZoanAkuma;
      // Vigor Animal — sempre ativo
      add("Vigor Animal", 0, 0, 0, z.vigorAnimalBonus);
      // Points — combate
      for (const point of z.points) {
        const label = point.id === "hybrid" ? "Point Híbrido" : point.id === "animal" ? "Point Animal" : "Point Desperto";
        const m: Record<keyof BaseAttributes, number> = { power: 0, precision: 0, defense: 0, constitution: 0 };
        m[point.primaryAttr] += point.bonus;
        m[point.complementaryAttr] += point.bonus;
        add(label, m.power, m.precision, m.defense, m.constitution, { isCombat: true });
      }
    } else if (char.akuma.type === "logia") {
      const l = char.akuma as LogiaAkuma;
      const ea = l.elementalNatureAttr;
      add("Logia — Natureza Elemental",
        ea === "power" ? 5 : 0, ea === "precision" ? 5 : 0,
        ea === "defense" ? 5 : 0, ea === "constitution" ? 5 : 0,
      );
      add("Logia — Intangibilidade", 0, 0, 4, 4);
    } else if (char.akuma.type === "paramecia") {
      const p = char.akuma as ParameciaAkuma;
      const countModules = (modules: string[]) => {
        let pod = 0, pre = 0, def = 0, con = 0;
        for (const m of modules) {
          if (m === "pow1") pod++; else if (m === "pre1") pre++;
          else if (m === "def1") def++; else if (m === "con1") con++;
        }
        return { pod, pre, def, con };
      };
      const passiveTotals = { pod: 0, pre: 0, def: 0, con: 0 };
      for (const hab of p.passives) {
        if (!hab) continue;
        const c = countModules(hab.modules);
        passiveTotals.pod += c.pod; passiveTotals.pre += c.pre;
        passiveTotals.def += c.def; passiveTotals.con += c.con;
      }
      add("Paramecia — Módulos Passivos", passiveTotals.pod, passiveTotals.pre, passiveTotals.def, passiveTotals.con);

      const activeTotals = { pod: 0, pre: 0, def: 0, con: 0 };
      for (const hab of p.actives) {
        if (!hab) continue;
        const c = countModules(hab.modules);
        activeTotals.pod += c.pod; activeTotals.pre += c.pre;
        activeTotals.def += c.def; activeTotals.con += c.con;
      }
      add("Paramecia — Módulos Ativos", activeTotals.pod, activeTotals.pre, activeTotals.def, activeTotals.con, { isCombat: true });
    }
  }

  // Artes Marciais
  if (char.artesMarciais?.currentFaixa) {
    const faixa = char.artesMarciais.currentFaixa;
    const amStats = faixaStatBonuses(faixa);
    // Flat bonuses cumulativos (Cinza–Amarela)
    add("AM (faixas Cinza–Amarela)",
      amStats.power ?? 0,
      amStats.precision ?? 0,
      amStats.defense ?? 0,
      amStats.constitution ?? 0,
    );
    // Bônus em itens defensivos (Laranja=+1, Marrom=+2, Rajada=+3)
    const defBonus = hasReachedFaixa(faixa, "rajada") ? 3 : hasReachedFaixa(faixa, "marrom") ? 2 : hasReachedFaixa(faixa, "laranja") ? 1 : 0;
    if (defBonus > 0) {
      const defTotals: Record<keyof BaseAttributes, number> = { power: 0, precision: 0, defense: 0, constitution: 0 };
      for (const item of [char.equippedDefensive[0], char.equippedDefensive[1]]) {
        if (item) defTotals[item.bonusAttr as keyof BaseAttributes] += defBonus;
      }
      add("AM (bônus defensivos)", defTotals.power, defTotals.precision, defTotals.defense, defTotals.constitution);
    }
    // Vermelha: +2 a atributo à escolha por 2 EN (combate)
    if (hasReachedFaixa(faixa, "vermelha")) {
      rows.push({ source: "AM Vermelha (+2 à escolha / 2 EN)", pod: 0, pre: 0, def: 0, con: 0, isCombat: true, conTemp: undefined });
    }
  }

  // Haissaikai — espelha bônus do Point Zoan ativo
  const isHaissaikai =
    char.equippedWeapon &&
    "characteristic" in char.equippedWeapon &&
    (char.equippedWeapon as { characteristic: string }).characteristic === "haissaikai";
  if (isHaissaikai && char.akuma?.type === "zoan") {
    const zoan = char.akuma as ZoanAkuma;
    for (const point of zoan.points) {
      const mult = point.id === "awakened" ? 0.5 : 1;
      const bonus = Math.floor(point.bonus * mult);
      const label = `Haissaikai espelha Point ${point.id === "hybrid" ? "Híbrido" : point.id === "animal" ? "Animal" : "Desperto"}`;
      const m: Record<keyof BaseAttributes, number> = { power: 0, precision: 0, defense: 0, constitution: 0 };
      m[point.primaryAttr] += bonus;
      m[point.complementaryAttr] += bonus;
      add(label, m.power, m.precision, m.defense, m.constitution, { isCombat: true });
    }
  }

  // Haki — combate
  if (char.haki) {
    const { primaryType, primaryStage, secondaryType, secondaryStage, advancedType } = char.haki;
    const pNum = hakiStageNum(primaryStage);
    const sNum = hakiStageNum(secondaryStage);

    // Primário
    if (pNum > 0) {
      const isArm = primaryType === "armament";
      // Armamento: +N POD, +N CON temp
      // Observação: +N PRE, +N DEF
      add(`Haki ${isArm ? "Armamento" : "Observação"} (primário · Estágio ${pNum})`,
        isArm ? pNum : 0,
        isArm ? 0 : pNum,
        isArm ? 0 : pNum,
        0,
        { isCombat: true, ...(isArm ? { conTemp: pNum } : {}) },
      );
    }

    // Secundário
    if (sNum > 0) {
      const isArm = secondaryType === "armament";
      add(`Haki ${isArm ? "Armamento" : "Observação"} (secundário · Estágio ${sNum})`,
        isArm ? sNum : 0,
        isArm ? 0 : sNum,
        isArm ? 0 : sNum,
        0,
        { isCombat: true, ...(isArm ? { conTemp: sNum } : {}) },
      );
    }

    // Haki Avançado (+4 ao atributo específico da variante, 5 EN/turno)
    if (advancedType) {
      const ADVANCED_BONUS: Record<string, [number, number, number, number]> = {
        ryuo:          [4, 0, 0, 0], // +4 POD
        repulsion:     [0, 0, 0, 4], // +4 CON
        mantra:        [0, 4, 0, 0], // +4 PRE
        future_vision: [0, 0, 4, 0], // +4 DEF
        king_advanced: [0, 0, 0, 0], // bônus em técnicas, não attrs
      };
      const [pod, pre, def, con] = ADVANCED_BONUS[advancedType] ?? [0, 0, 0, 0];
      if (pod || pre || def || con) {
        add(`Haki Avançado — ${advancedType} (5 EN/turno)`, pod, pre, def, con, { isCombat: true });
      } else if (advancedType === "king_advanced") {
        rows.push({ source: "Haki Rei Avançado (Ambição → bônus técnicas)", pod: 0, pre: 0, def: 0, con: 0, isCombat: true });
      }
    }
  }

  return rows;
}

function sumRows(rows: AttrRow[]) {
  return rows.reduce(
    (acc, r) => ({ pod: acc.pod + r.pod, pre: acc.pre + r.pre, def: acc.def + r.def, con: acc.con + r.con }),
    { pod: 0, pre: 0, def: 0, con: 0 },
  );
}

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
          <div className="mt-3 p-2 bg-amber-950/30 border border-amber-800/40 rounded-lg">
            <p className="text-xs text-amber-400">{raceData.specialAbility}</p>
          </div>
        )}

        {/* Human free attribute choice */}
        {draft.race === "human" && (
          <div className="mt-3 p-3 bg-amber-950/20 border border-amber-800/30 rounded-lg">
            <p className="text-xs font-medium text-amber-400 mb-2">
              Bônus Racial Humano — Escolha 1 atributo para +1 (fora do pool)
            </p>
            <div className="flex flex-wrap gap-2">
              {ATTR_KEYS.map(attr => {
                const chosen = (draft.racialBonus[attr] ?? 0) > 0;
                return (
                  <button
                    key={attr}
                    onClick={() => updateDraft(c => {
                      c.racialBonus = chosen ? {} : { [attr]: 1 };
                    })}
                    className={`px-3 py-1.5 rounded text-xs transition-colors ${
                      chosen ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    {ATTR_LABELS[attr]}
                  </button>
                );
              })}
            </div>
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
