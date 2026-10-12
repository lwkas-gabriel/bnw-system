import { useState } from "react";
import { SectionCard } from "../../../../shared/components";
import { PARAMECIA_MODULES, PARAMECIA_MODULES_BY_ID } from "../../../../data/akumaModules";
import type { AkumaRank, ParameciaAkuma, ParameciaHabilityPassive, ParameciaHabilityActive } from "../../../../shared/types/character";
import { PARAMECIA_ACTIVE_EN, PARAMECIA_ACTIVE_SLOTS, PARAMECIA_PASSIVE_SLOTS } from "../../../../data/akumaModules";
import { PARAMECIA_CLASSES, RANK_ORDER_MAP } from "./constants";
import { ModuleBadge, ModulePicker } from "./AkumaFields";

// ─── Paramecia sub-component ──────────────────────────────────────────────────

export function ParameciaConfig({ paramecia, onUpdate }: { paramecia: ParameciaAkuma; onUpdate: (fn: (p: ParameciaAkuma) => void) => void }) {
  const rankIdx = RANK_ORDER_MAP[paramecia.rank];

  function ensureHabilidade(rank: AkumaRank) {
    const rIdx = RANK_ORDER_MAP[rank];
    onUpdate(p => {
      if (!p.passives[rIdx]) {
        p.passives[rIdx] = {
          id: `passive_${rank}`, name: `Passiva ${rank}`, description: "",
          slots: 0, modules: [], condition: "",
        } as ParameciaHabilityPassive;
      }
      if (!p.actives[rIdx] && rank !== "S") {
        p.actives[rIdx] = {
          id: `active_${rank}`, name: `Ativa ${rank}`, description: "",
          slots: 0, energyCost: PARAMECIA_ACTIVE_EN[rank], modules: [], condition: "",
          isAwakened: false,
        } as ParameciaHabilityActive;
      }
    });
  }

  const unlockedRanks = (["C", "B", "A"] as AkumaRank[]).filter(r => rankIdx >= RANK_ORDER_MAP[r]);

  return (
    <SectionCard title="Configuração Paramecia" icon="🌀">
      {/* Classe */}
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Classe</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {PARAMECIA_CLASSES.map(cls => (
          <button
            key={cls.id}
            onClick={() => onUpdate(p => { p.parameciaClass = cls.id; })}
            className={`p-2 rounded-lg border text-left transition-all ${
              paramecia.parameciaClass === cls.id
                ? "border-amber-600 bg-amber-900/20"
                : "border-slate-700 bg-slate-800 hover:border-slate-600"
            }`}
          >
            <p className="text-xs font-medium text-slate-300">{cls.label}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{cls.desc}</p>
          </button>
        ))}
      </div>

      {/* Efeito Aderido Especial */}
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Efeito Aderido Especial</p>
      <input
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600 mb-1"
        placeholder="Nome do efeito exclusivo (ex: Borracha, Neve...)"
        value={paramecia.specialAdherence}
        onChange={e => onUpdate(p => { p.specialAdherence = e.target.value; })}
      />
      <p className="text-[10px] text-slate-500 mb-4">Técnicas com este efeito aderido recebem +1 ao bônus básico.</p>

      {/* Habilidades por rank */}
      <div className="space-y-4">
        {unlockedRanks.map(rank => {
          const rIdx = RANK_ORDER_MAP[rank];
          const passive = paramecia.passives[rIdx];
          const active  = paramecia.actives[rIdx];
          const passiveSlots   = PARAMECIA_PASSIVE_SLOTS[rank];
          const activeSlots    = PARAMECIA_ACTIVE_SLOTS[rank];

          return (
            <div key={rank} className="border border-amber-800/30 rounded-xl p-3 bg-amber-950/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400">Rank {rank}</span>
                {!passive && (
                  <button
                    onClick={() => ensureHabilidade(rank)}
                    className="text-[10px] text-amber-600 hover:text-amber-400"
                  >
                    + Inicializar habilidades
                  </button>
                )}
              </div>

              {passive && (
                <ParameciaHabilidadeEditor
                  label="Passiva"
                  habilidade={passive}
                  maxSlots={passiveSlots}
                  hasCondition={rank === "A"}
                  onUpdate={patch => onUpdate(p => { Object.assign(p.passives[rIdx], patch); })}
                  onAddModule={moduleId => onUpdate(p => { p.passives[rIdx].modules.push(moduleId); })}
                  onRemoveModule={idx => onUpdate(p => { p.passives[rIdx].modules.splice(idx, 1); })}
                />
              )}

              {active && rank !== "S" && (
                <div className="mt-2">
                  <ParameciaHabilidadeEditor
                    label={`Ativa (${PARAMECIA_ACTIVE_EN[rank]} EN)`}
                    habilidade={active}
                    maxSlots={activeSlots}
                    hasCondition={rank === "A"}
                    onUpdate={patch => onUpdate(p => { Object.assign(p.actives[rIdx], patch); })}
                    onAddModule={moduleId => onUpdate(p => { p.actives[rIdx].modules.push(moduleId); })}
                    onRemoveModule={idx => onUpdate(p => { p.actives[rIdx].modules.splice(idx, 1); })}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Rank S — Despertar */}
        {rankIdx >= RANK_ORDER_MAP["S"] && (
          <div className="border border-amber-600/40 rounded-xl p-3 bg-amber-900/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400">Rank S — Despertar</span>
              {!paramecia.passives[RANK_ORDER_MAP["S"]] && (
                <button
                  onClick={() => onUpdate(p => {
                    p.passives[RANK_ORDER_MAP["S"]] = {
                      id: "passive_S", name: "Habilidade Desperta", description: "",
                      slots: 0, modules: [], condition: "Modo Desperto ativo",
                    } as ParameciaHabilityPassive;
                  })}
                  className="text-[10px] text-amber-600 hover:text-amber-400"
                >
                  + Inicializar Despertar
                </button>
              )}
            </div>
            {paramecia.passives[RANK_ORDER_MAP["S"]] && (
              <>
                <p className="text-[9px] text-amber-500/70 mb-2 italic">Condição fixa: Modo Desperto ativo (5 EN/turno)</p>
                <ParameciaHabilidadeEditor
                  label="Habilidade Desperta (5 slots)"
                  habilidade={paramecia.passives[RANK_ORDER_MAP["S"]]}
                  maxSlots={5}
                  hasCondition={false}
                  onUpdate={patch => onUpdate(p => { Object.assign(p.passives[RANK_ORDER_MAP["S"]], patch); })}
                  onAddModule={moduleId => onUpdate(p => { p.passives[RANK_ORDER_MAP["S"]].modules.push(moduleId); })}
                  onRemoveModule={idx => onUpdate(p => { p.passives[RANK_ORDER_MAP["S"]].modules.splice(idx, 1); })}
                />
              </>
            )}
          </div>
        )}

        {unlockedRanks.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-4">Selecione o rank da Paramecia acima.</p>
        )}
      </div>
    </SectionCard>
  );
}

export function ParameciaHabilidadeEditor({
  label, habilidade, maxSlots, hasCondition, onUpdate, onAddModule, onRemoveModule,
}: {
  label: string;
  habilidade: ParameciaHabilityPassive | ParameciaHabilityActive;
  maxSlots: number;
  hasCondition: boolean;
  onUpdate: (patch: Partial<ParameciaHabilityPassive>) => void;
  onAddModule: (moduleId: string) => void;
  onRemoveModule: (idx: number) => void;
}) {
  const usedSlots = habilidade.modules.reduce((sum, modId) => {
    const m = PARAMECIA_MODULES_BY_ID[modId];
    return sum + (m?.slots ?? 1);
  }, 0);

  const [condActive, setCondActive] = useState(!!habilidade.condition);

  const effectiveMax = hasCondition && condActive ? maxSlots + 1 : maxSlots;
  const remaining = effectiveMax - usedSlots;

  return (
    <div className="bg-slate-800/50 rounded-lg p-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400">{label}</span>
        <span className="text-[9px] font-mono text-amber-500">{usedSlots}/{effectiveMax} slots</span>
      </div>

      <input
        className="w-full bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-amber-600"
        placeholder="Nome da habilidade"
        value={habilidade.name}
        onChange={e => onUpdate({ name: e.target.value })}
      />

      <input
        className="w-full bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-[10px] text-slate-400 focus:outline-none focus:border-amber-600"
        placeholder="Descrição..."
        value={habilidade.description}
        onChange={e => onUpdate({ description: e.target.value })}
      />

      {/* Condition toggle for Rank A */}
      {hasCondition && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`cond-${habilidade.id}`}
            checked={condActive}
            onChange={() => {
              setCondActive(v => !v);
              if (condActive) onUpdate({ condition: "" });
            }}
            className="accent-amber-600"
          />
          <label htmlFor={`cond-${habilidade.id}`} className="text-[9px] text-slate-500 cursor-pointer">
            Ativar condição (+1 slot extra)
          </label>
          {condActive && (
            <input
              className="flex-1 bg-slate-700/50 border border-slate-600 rounded px-2 py-0.5 text-[9px] text-slate-300 focus:outline-none focus:border-amber-600"
              placeholder="Descreva a condição..."
              value={habilidade.condition ?? ""}
              onChange={e => onUpdate({ condition: e.target.value })}
            />
          )}
        </div>
      )}

      {/* Module badges */}
      <div className="flex flex-wrap gap-1">
        {habilidade.modules.map((modId, idx) => {
          const m = PARAMECIA_MODULES_BY_ID[modId];
          return m ? (
            <ModuleBadge key={idx} module={m} onRemove={() => onRemoveModule(idx)} />
          ) : null;
        })}
      </div>

      {remaining > 0 && (
        <ModulePicker
          modules={PARAMECIA_MODULES}
          usedSlots={usedSlots}
          maxSlots={effectiveMax}
          onAdd={onAddModule}
        />
      )}
    </div>
  );
}
