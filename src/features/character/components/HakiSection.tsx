import { useState } from "react";
import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Button, Badge } from "../../../shared/components";
import { HAKI_ARMAMENT_STAGES, HAKI_OBSERVATION_STAGES, ADVANCED_HAKI, KING_HAKI } from "../../../data/haki";
import type { HakiPath, AdvancedHakiVariant } from "../../../shared/types/character";

const STAGE_LABELS = [1, 2, 3, 4, 5];

function StageProgress({ stages, current, onSelect, type }: {
  stages: typeof HAKI_ARMAMENT_STAGES;
  current: number | string | null;
  onSelect: (s: number) => void;
  type: "armament" | "observation";
}) {
  const currentNum = typeof current === "number" ? current : 0;
  const colors = { armament: "amber", observation: "blue" };
  const colorClass = type === "armament"
    ? "bg-amber-600 border-amber-500 text-white"
    : "bg-blue-700 border-blue-600 text-white";

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {STAGE_LABELS.map(s => {
          const stage = stages[s - 1];
          const isActive = s <= currentNum;
          const isCurrent = s === currentNum;
          return (
            <button
              key={s}
              onClick={() => onSelect(currentNum === s ? 0 : s)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                isActive
                  ? `${colorClass} ${isCurrent ? "scale-105 shadow-lg" : ""}`
                  : "border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
      {currentNum > 0 && (
        <div className="p-2 bg-slate-800 rounded-lg">
          <div className="flex gap-3 text-xs">
            {Object.entries(stages[currentNum - 1].bonus).map(([k, v]) => (
              <span key={k} className="text-slate-300">
                +{v} <span className="text-slate-500 uppercase text-[10px]">{k.slice(0, 3)}</span>
              </span>
            ))}
            <span className="ml-auto text-slate-500">{stages[currentNum - 1].energyCostPerTurn} EN/turno</span>
          </div>
          <p className="text-[10px] text-slate-600 mt-1">{stages[currentNum - 1].description}</p>
          {stages[currentNum - 1].freeTechniqueRank && (
            <Badge variant="amber" className="mt-1">1 técnica Rank A grátis</Badge>
          )}
        </div>
      )}
    </div>
  );
}

export function HakiSection() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  const haki = draft.haki;

  function initHaki() {
    updateDraft(c => {
      c.haki = {
        primaryType: "armament",
        primaryStage: 1,
        secondaryType: "observation",
        secondaryStage: 0,
        hasKing: false,
        kingStage: null,
        advancedType: null,
      } as HakiPath;
    });
  }

  function setPrimaryStage(s: number) {
    updateDraft(c => {
      if (!c.haki) return;
      c.haki.primaryStage = s as any;
    });
  }

  function setSecondaryStage(s: number) {
    updateDraft(c => {
      if (!c.haki) return;
      c.haki.secondaryStage = s as any;
    });
  }

  function toggleKing() {
    updateDraft(c => {
      if (!c.haki) return;
      c.haki.hasKing = !c.haki.hasKing;
      if (c.haki.hasKing) c.haki.kingStage = "dormant";
      else { c.haki.kingStage = null; c.haki.advancedType = null; }
    });
  }

  function setKingAdvanced() {
    if (draft.location !== "new_world") return;
    updateDraft(c => {
      if (!c.haki) return;
      c.haki.kingStage = "advanced";
      c.haki.advancedType = "king_advanced";
    });
  }

  function setAdvanced(variant: AdvancedHakiVariant) {
    if (draft.location !== "new_world") return;
    updateDraft(c => {
      if (!c.haki) return;
      c.haki.advancedType = variant;
      if (variant === "king_advanced") c.haki.kingStage = "advanced";
    });
  }

  const primaryStageNum = typeof haki?.primaryStage === "number" ? haki.primaryStage : 0;
  const canHaveKing = primaryStageNum >= 5 || (typeof haki?.secondaryStage === "number" && haki.secondaryStage >= 5);
  const canHaveAdvanced = draft.location === "new_world";

  // Gem cost calculation
  const gemCost = (primaryStageNum * 20)
    + (haki?.hasKing ? 20 : 0)
    + (haki?.advancedType === "king_advanced" ? 20 : 0)
    + (haki?.advancedType && haki.advancedType !== "king_advanced" ? 40 : 0);

  return (
    <div className="space-y-4 max-w-2xl">
      {!haki ? (
        <SectionCard title="Haki" icon="🌊">
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm mb-4">Nenhum Haki adquirido. Custo inicial: 20g (estágio 1).</p>
            <Button variant="primary" onClick={initHaki}>+ Adquirir Haki</Button>
          </div>
        </SectionCard>
      ) : (
        <>
          {/* Cost display */}
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400">Custo total em Haki</span>
            <span className="text-sm font-bold font-mono text-amber-400">{gemCost}g</span>
          </div>

          {/* Primary Haki */}
          <SectionCard
            title={`Haki ${haki.primaryType === "armament" ? "do Armamento" : "da Observação"} (Primário)`}
            icon={haki.primaryType === "armament" ? "🔶" : "👁️"}
            action={<Badge variant="amber">Pago</Badge>}
          >
            <p className="text-[10px] text-slate-600 mb-3">100g para estagios 1–5</p>
            <StageProgress
              stages={haki.primaryType === "armament" ? HAKI_ARMAMENT_STAGES : HAKI_OBSERVATION_STAGES}
              current={haki.primaryStage}
              onSelect={setPrimaryStage}
              type={haki.primaryType}
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => updateDraft(c => { if (!c.haki) return; c.haki.primaryType = "armament"; c.haki.secondaryType = "observation"; })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${haki.primaryType === "armament" ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >Armamento</button>
              <button
                onClick={() => updateDraft(c => { if (!c.haki) return; c.haki.primaryType = "observation"; c.haki.secondaryType = "armament"; })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${haki.primaryType === "observation" ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >Observação</button>
            </div>
          </SectionCard>

          {/* Secondary Haki - FREE */}
          <SectionCard
            title={`Haki ${haki.secondaryType === "armament" ? "do Armamento" : "da Observação"} (Secundário)`}
            icon={haki.secondaryType === "armament" ? "🔶" : "👁️"}
            action={<Badge variant="green">Gratuito</Badge>}
          >
            <p className="text-[10px] text-slate-600 mb-3">0g — apenas aventuras necessárias</p>
            <StageProgress
              stages={haki.secondaryType === "armament" ? HAKI_ARMAMENT_STAGES : HAKI_OBSERVATION_STAGES}
              current={haki.secondaryStage}
              onSelect={setSecondaryStage}
              type={haki.secondaryType}
            />
          </SectionCard>

          {/* King Haki */}
          <SectionCard title="Haki do Rei" icon="👑">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-slate-400">Custo: 20g. Requer estágio 5 em um dos Hakis.</p>
                {!canHaveKing && <p className="text-[10px] text-amber-500/80 mt-0.5">Atinja estágio 5 primeiro.</p>}
              </div>
              <button
                onClick={toggleKing}
                disabled={!canHaveKing && !haki.hasKing}
                className={`relative w-12 h-6 rounded-full transition-colors ${haki.hasKing ? "bg-amber-600" : "bg-slate-700"} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${haki.hasKing ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
            {haki.hasKing && (
              <div className="space-y-2">
                <div className="p-2 bg-amber-950/30 border border-amber-800/30 rounded-lg">
                  <p className="text-xs font-medium text-amber-400 mb-1">Haki do Rei — Controlado</p>
                  <p className="text-[10px] text-slate-500">{KING_HAKI.controlled.description}</p>
                  <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                    <span>+{KING_HAKI.controlled.persuasionBonus} Persuasão</span>
                    <span>{KING_HAKI.controlled.energyCostPerTurn} EN/turno</span>
                  </div>
                </div>

                {canHaveAdvanced && (
                  <div>
                    <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Haki do Rei Avançado (+20g)</p>
                    <button
                      onClick={() => haki.advancedType === "king_advanced" ? updateDraft(c => { if (c.haki) { c.haki.kingStage = "controlled"; c.haki.advancedType = null; }}) : setKingAdvanced()}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        haki.advancedType === "king_advanced"
                          ? "border-amber-600 bg-amber-900/20"
                          : "border-slate-700 bg-slate-800 hover:border-amber-700"
                      }`}
                    >
                      <p className="text-xs font-medium text-amber-400">Imbuir do Rei</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Adiciona valor de Ambição ao bônus de todas as técnicas com o Rei ativo.</p>
                      <p className="text-[10px] text-amber-500/70 mt-1">Com Ambição {draft.ambition}: +{draft.ambition} por técnica</p>
                    </button>
                  </div>
                )}
                {!canHaveAdvanced && (
                  <p className="text-[10px] text-slate-600 text-center py-2">Haki do Rei Avançado disponível no New World.</p>
                )}
              </div>
            )}
          </SectionCard>

          {/* Advanced Haki (Arm or Obs) */}
          {canHaveAdvanced && !haki.hasKing && (
            <SectionCard title="Haki Avançado" icon="⚡">
              <p className="text-[10px] text-amber-500/80 mb-3">Só é possível um tipo de Haki Avançado. Rei Avançado custa 20g; os outros custam 40g (parcial + completo).</p>
              <div className="grid grid-cols-1 gap-2">
                {ADVANCED_HAKI.filter(a => a.type !== "king").map(adv => (
                  <button
                    key={adv.variant}
                    onClick={() => setAdvanced(adv.variant)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      haki.advancedType === adv.variant
                        ? "border-amber-600 bg-amber-900/20"
                        : "border-slate-700 bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-300 capitalize">{adv.variant.replace("_", " ")}</p>
                      <span className="text-[10px] text-amber-400 font-mono">{adv.gemCostPartial + adv.gemCostComplete}g</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{adv.complete.extraEffect}</p>
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          <Button variant="danger" size="sm" onClick={() => updateDraft(c => { c.haki = null; })}>
            Remover Haki
          </Button>
        </>
      )}
    </div>
  );
}
