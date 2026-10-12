import { useDraft } from "../hooks/useDraft";
import { SectionCard, Button, Badge, Callout } from "../../../shared/components";
import type { AkumaRank, AkumaType, ZoanAkuma, LogiaAkuma, ParameciaAkuma } from "../../../shared/types/character";
import { GEM_COSTS } from "../../../data/gemCosts";
import { applyAkumaRank, createAkuma, syncFreeTechniques } from "../utils/akuma";
import { RANKS, FREE_TECHS, TYPES } from "./akuma/constants";
import { AkumaTechEditor } from "./akuma/AkumaTechEditor";
import { ZoanConfig } from "./akuma/ZoanConfig";
import { LogiaConfig } from "./akuma/LogiaConfig";
import { ParameciaConfig } from "./akuma/ParameciaConfig";

// ─── Main component ───────────────────────────────────────────────────────────

export function AkumaSection() {
  const { draft, updateDraft } = useDraft();
  if (!draft) return null;

  function initAkuma(type: AkumaType) {
    updateDraft(c => {
      syncFreeTechniques(c, "C");
      c.akuma = createAkuma(type);
    });
  }

  function changeRank(rank: AkumaRank) {
    updateDraft(c => applyAkumaRank(c, rank));
  }

  const akuma = draft.akuma;

  if (!akuma) {
    return (
      <div className="space-y-4 max-w-2xl">
        <SectionCard title="Akuma no Mi" icon="🍎">
          <p className="text-xs text-slate-500 mb-3">Nenhuma Akuma no Mi. Rank C (entrada) custa {GEM_COSTS.akumaTotal.C}g.</p>
          <div className="grid gap-3">
            {TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => initAkuma(t.id)}
                className="p-4 rounded-xl border border-slate-700 bg-slate-800 hover:border-amber-700 text-left transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-sm font-semibold text-slate-200">{t.label}</span>
                </div>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  const typeIcon = akuma.type === "zoan" ? "🐉" : akuma.type === "logia" ? "⚡" : "🌀";

  return (
    <div className="space-y-4 max-w-2xl">

      {/* Header card */}
      <SectionCard
        title="Akuma no Mi"
        icon="🍎"
        action={<Button variant="danger" size="sm" onClick={() => updateDraft(c => { c.akuma = null; c.techniques = c.techniques.filter(t => t.source !== "akuma"); })}>Remover</Button>}
      >
        {/* Name + type */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{typeIcon}</span>
          <div className="flex-1">
            <input
              className="bg-transparent text-sm font-bold text-slate-200 focus:outline-none border-b border-transparent focus:border-amber-600 w-full"
              value={akuma.name}
              placeholder="Nome da Akuma no Mi"
              onChange={e => updateDraft(c => { if (c.akuma) c.akuma.name = e.target.value; })}
            />
            <p className="text-[10px] text-slate-500 capitalize mt-0.5">{akuma.type}</p>
          </div>
          <Badge variant="amber">Rank {akuma.rank}</Badge>
        </div>

        {/* Rank selector */}
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Rank</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {RANKS.map(r => {
            const locked = r.rank === "S" && draft.location !== "new_world";
            const active = akuma.rank === r.rank;
            return (
              <button
                key={r.rank}
                disabled={locked}
                onClick={() => changeRank(r.rank)}
                className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                  active
                    ? "border-amber-600 bg-amber-900/20 text-amber-400"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <div>{r.rank}</div>
                <div className="text-[9px] font-mono text-slate-500 mt-0.5">{r.cost}g</div>
                {locked && <div className="text-[8px] text-slate-600">New World</div>}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 mb-3">
          {[["C→B", "+30g"], ["B→A", "+30g"], ["A→S", "+50g"]].map(([label, cost]) => (
            <div key={label} className="flex-1 text-center p-1.5 bg-slate-800 rounded text-[9px]">
              <span className="text-slate-400">{label} </span>
              <span className="text-amber-400 font-mono">{cost}</span>
            </div>
          ))}
        </div>

        {(() => {
          const freeTechs = draft.techniques.filter(t => t.source === "akuma");
          if (freeTechs.length === 0) return null;
          return (
            <div className="mb-2 space-y-2">
              {FREE_TECHS[akuma.rank] && (
                <p className="text-[10px] text-green-400">🎁 {FREE_TECHS[akuma.rank]}</p>
              )}
              {freeTechs.map(tech => (
                <AkumaTechEditor
                  key={tech.id}
                  tech={tech}
                  onUpdate={patch => updateDraft(c => {
                    const t = c.techniques.find(t => t.id === tech.id);
                    if (t) Object.assign(t, patch);
                  })}
                />
              ))}
            </div>
          );
        })()}

        {akuma.rank === "S" && (
          <Callout className="p-2 text-[10px] text-amber-400/80 rounded-lg">
            ✨ Despertar (Rank S) — requer New World + 5 aventuras.
            {akuma.type === "logia"     && " Domínio Elemental: +5 POD+PRE por 5 EN/turno em área de 3 movimentos."}
            {akuma.type === "paramecia" && " Modo Desperto: +5 PRE ou +5 DEF (escolha/turno) por 5 EN."}
            {akuma.type === "zoan"      && " Point Desperto: +8/+8 por 5 EN/turno. + 1 Habilidade Desperta (2 módulos)."}
          </Callout>
        )}
      </SectionCard>

      {/* ── Zoan ───────────────────────────────────────────────────────── */}
      {akuma.type === "zoan" && (
        <ZoanConfig
          zoan={akuma as ZoanAkuma}
          onUpdate={(updater) => updateDraft(c => { if (c.akuma?.type === "zoan") updater(c.akuma as ZoanAkuma); })}
        />
      )}

      {/* ── Logia ───────────────────────────────────────────────────────── */}
      {akuma.type === "logia" && (
        <LogiaConfig
          logia={akuma as LogiaAkuma}
          onUpdate={(updater) => updateDraft(c => { if (c.akuma?.type === "logia") updater(c.akuma as LogiaAkuma); })}
        />
      )}

      {/* ── Paramecia ───────────────────────────────────────────────────── */}
      {akuma.type === "paramecia" && (
        <ParameciaConfig
          paramecia={akuma as ParameciaAkuma}
          onUpdate={(updater) => updateDraft(c => { if (c.akuma?.type === "paramecia") updater(c.akuma as ParameciaAkuma); })}
        />
      )}
    </div>
  );
}
