import { useState } from "react";
import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Button, Badge } from "../../../shared/components";
import { PROFESSIONS, PROFESSIONS_BY_ID } from "../../../data/professions";
import { PERICIAS } from "../../../data/pericias";
import { RACE_PERICIA_BONUS, ZOAN_CLASS_PERICIA_BONUS } from "../../../data/pericias";
import { periciaRollBonus } from "../../../data/pericias";
import { GEM_COSTS } from "../../../data/gemCosts";
import type { CharacterProfession, PericiaId, ZoanAkuma } from "../../../shared/types/character";

export function ProfissoesSection() {
  const { draft, updateDraft } = useCharacterStore();
  const [expandedCraft, setExpandedCraft] = useState<string | null>(null);

  if (!draft) return null;

  const current = draft.professions ?? [];

  // Racial/Zoan bonuses (same logic as PericiasSection)
  const racialPericiaId: PericiaId | undefined =
    draft.race === "human"
      ? (draft.humanPericiaChoice ?? undefined)
      : RACE_PERICIA_BONUS[draft.race] as PericiaId | undefined;

  const zoanPericiaId: PericiaId | undefined =
    draft.akuma?.type === "zoan"
      ? ZOAN_CLASS_PERICIA_BONUS[(draft.akuma as ZoanAkuma).animalClass] as PericiaId | undefined
      : undefined;

  function getEffectivePericia(id: PericiaId): number {
    const invested = draft!.pericias[id];
    const racial = racialPericiaId === id ? 1 : 0;
    const zoan = zoanPericiaId === id ? 1 : 0;
    return Math.min(5, invested + racial + zoan);
  }

  function addProfession(profId: string) {
    const data = PROFESSIONS_BY_ID[profId];
    if (!data) return;
    if (current.some(p => p.id === profId)) return;
    const prof: CharacterProfession = {
      id: data.id,
      name: data.name,
      linkedPericias: data.linkedPericias,
    };
    updateDraft(c => { (c.professions ?? (c.professions = [])).push(prof); });
  }

  function removeProfession(profId: string) {
    updateDraft(c => { c.professions = (c.professions ?? []).filter(p => p.id !== profId); });
  }

  const available = PROFESSIONS.filter(p => !current.some(c => c.id === p.id));

  return (
    <div className="space-y-4 max-w-2xl">
      <SectionCard
        title="Profissões"
        icon="📜"
        action={<Badge variant="amber">{current.length} profissão(ões)</Badge>}
      >
        <p className="text-xs text-slate-500 mb-4">
          Cada profissão custa <span className="font-mono text-amber-400">{GEM_COSTS.profession}g</span> e
          vincula uma perícia específica. Craft: 2 slots por aventura.
        </p>

        {/* Active professions */}
        {current.length > 0 && (
          <div className="space-y-2 mb-4">
            {current.map(prof => {
              const data = PROFESSIONS_BY_ID[prof.id];
              const periciaId = data?.linkedPericias[0] as PericiaId | undefined;
              const periciaName = periciaId ? PERICIAS[periciaId]?.name : "—";
              const effectiveGrad = periciaId ? getEffectivePericia(periciaId) : 0;
              const rollBonus = periciaRollBonus(effectiveGrad);
              const isExpanded = expandedCraft === prof.id;

              return (
                <div
                  key={prof.id}
                  className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-xs font-medium text-slate-200">{prof.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Perícia:{" "}
                        <span className="text-slate-400">{periciaName}</span>
                        {periciaId && (
                          <span className="ml-1.5 font-mono text-amber-400">
                            {effectiveGrad}/5 · 3d6{rollBonus > 0 ? `+${rollBonus}` : ""}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-400">{GEM_COSTS.profession}g</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedCraft(isExpanded ? null : prof.id)}
                      >
                        {isExpanded ? "▲" : "Craft"}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => removeProfession(prof.id)}>
                        Remover
                      </Button>
                    </div>
                  </div>

                  {/* Craft info panel */}
                  {isExpanded && data && (
                    <div className="px-3 pb-3 pt-0 border-t border-slate-700 bg-slate-800/50">
                      <p className="text-[10px] text-slate-400 mt-2 mb-2">{data.description}</p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">
                        Mecânica de Craft
                      </p>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {[
                          { label: "Comum",       dc: data.craftDC.common    },
                          { label: "Esplêndido",  dc: data.craftDC.splendid  },
                          { label: "Lendário",    dc: data.craftDC.legendary },
                        ].map(tier => (
                          <div key={tier.label} className="bg-slate-700 rounded p-2 text-center">
                            <p className="text-[10px] text-slate-400">{tier.label}</p>
                            <p className="text-sm font-bold font-mono text-amber-400">DC {tier.dc}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Teste: <span className="text-slate-400">3d6 + {periciaName} ({effectiveGrad} × 3 = +{rollBonus})</span>
                        {" · "}
                        <span className="text-slate-400">{data.craftSlotsPerAdventure} slots por aventura</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Available to add */}
        {available.length > 0 ? (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Adicionar</p>
            <div className="space-y-1.5">
              {available.map(prof => {
                const periciaId = prof.linkedPericias[0] as PericiaId;
                const periciaName = PERICIAS[periciaId]?.name ?? "—";
                const effectiveGrad = getEffectivePericia(periciaId);
                const rollBonus = periciaRollBonus(effectiveGrad);
                return (
                  <button
                    key={prof.id}
                    onClick={() => addProfession(prof.id)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg text-left transition-colors"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-300">{prof.name}</p>
                      <p className="text-[10px] text-slate-500">{prof.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs font-mono text-amber-400">{GEM_COSTS.profession}g</p>
                      <p className="text-[10px] text-slate-500">
                        {periciaName} 3d6{rollBonus > 0 ? `+${rollBonus}` : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : current.length === PROFESSIONS.length ? (
          <p className="text-xs text-green-500 text-center py-2">
            Todas as profissões adquiridas.
          </p>
        ) : null}
      </SectionCard>
    </div>
  );
}
