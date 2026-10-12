// ArtesMarciaisSection.tsx
import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Badge, Callout } from "../../../shared/components";
import type { AMFaixaId } from "../../../shared/types/character";
import { GEM_COSTS } from "../../../data/gemCosts";
import { AM_FAIXAS, AM_FAIXA_ORDER, FAIXA_REGION_LABELS, faixaIndex, faixasUpTo, hasReachedFaixa, isFaixaAvailable } from "../../../data/artesMarciais";

export function ArtesMarciaisSection() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  const currentFaixa = draft.artesMarciais?.currentFaixa ?? null;
  const currentIdx = faixaIndex(currentFaixa);

  const totalCost = currentFaixa
    ? faixasUpTo(currentFaixa).reduce((s, f) => s + GEM_COSTS.artesMarciais[f.id], 0)
    : 0;

  function selectFaixa(id: AMFaixaId) {
    const newIdx = faixaIndex(id);
    const isSame = currentFaixa === id;
    updateDraft(c => {
      if (!c.artesMarciais) c.artesMarciais = { currentFaixa: null, laranjaChoice: null };
      c.artesMarciais.currentFaixa = isSame ? (newIdx > 0 ? AM_FAIXA_ORDER[newIdx - 1] : null) : id;
    });
  }

  const hasLaranja = hasReachedFaixa(currentFaixa, "laranja");

  return (
    <div className="space-y-4 max-w-2xl">
      <SectionCard
        title="Artes Marciais"
        icon="🥋"
        action={totalCost > 0 ? <Badge variant="amber">{totalCost}g</Badge> : undefined}
      >
        <p className="text-xs text-slate-500 mb-4">Selecione a faixa atual. Todas as faixas anteriores são adquiridas automaticamente.</p>

        <div className="space-y-1.5">
          {AM_FAIXAS.map((faixa, idx) => {
            const available = isFaixaAvailable(faixa.id, draft.location);
            const isActive = currentIdx >= idx;
            const isCurrent = currentFaixa === faixa.id;

            return (
              <button
                key={faixa.id}
                disabled={!available}
                onClick={() => selectFaixa(faixa.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? isCurrent
                      ? "border-amber-500 bg-amber-900/25"
                      : "border-amber-800/50 bg-amber-950/20"
                    : available
                      ? "border-slate-700 bg-slate-800 hover:border-slate-600"
                      : "border-slate-800 bg-slate-900 opacity-40 cursor-not-allowed"
                }`}
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? "bg-amber-500" : "bg-slate-700"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${isActive ? "text-amber-300" : "text-slate-400"}`}>
                      {faixa.label}
                    </span>
                    {!available && <span className="text-[9px] text-slate-600">{FAIXA_REGION_LABELS[faixa.region]}</span>}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{faixa.summary}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">{GEM_COSTS.artesMarciais[faixa.id]}g</span>
              </button>
            );
          })}
        </div>

        {/* Laranja choice */}
        {hasLaranja && (
          <Callout className="mt-4 p-3 rounded-xl">
            <p className="text-xs font-medium text-amber-400 mb-2">Faixa Laranja — Escolha</p>
            <div className="flex gap-2">
              <button
                onClick={() => updateDraft(c => { if (c.artesMarciais) c.artesMarciais.laranjaChoice = "unique_weapon"; })}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs transition-all ${
                  draft.artesMarciais?.laranjaChoice === "unique_weapon"
                    ? "border-amber-600 bg-amber-900/20 text-amber-400"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                }`}
              >
                🗡️ Arma Única (grátis)
              </button>
              <button
                onClick={() => updateDraft(c => { if (c.artesMarciais) c.artesMarciais.laranjaChoice = "techniques"; })}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs transition-all ${
                  draft.artesMarciais?.laranjaChoice === "techniques"
                    ? "border-amber-600 bg-amber-900/20 text-amber-400"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                }`}
              >
                ⚡ 2 Técnicas Rank A
              </button>
            </div>
          </Callout>
        )}
      </SectionCard>
    </div>
  );
}
