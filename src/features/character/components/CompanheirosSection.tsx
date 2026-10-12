import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Button, Badge } from "../../../shared/components";
import type { CompanionData, CompanionRank, CompanionType } from "../../../shared/types/character";
import { GEM_COSTS } from "../../../data/gemCosts";

// ─── Static data ──────────────────────────────────────────────────────────────

const RANK_OPTIONS: { value: CompanionRank; label: string; cost: number }[] = [
  { value: "C", label: "Rank C", cost: GEM_COSTS.companion.C },
  { value: "B", label: "Rank B", cost: GEM_COSTS.companion.B },
  { value: "A", label: "Rank A", cost: GEM_COSTS.companion.A },
];

const RANK_LIMITS: Record<CompanionRank, { maxLevel: number; maxGems: number; maxPericia: number }> = {
  C: { maxLevel: 15, maxGems: 100, maxPericia: 4 },
  B: { maxLevel: 25, maxGems: 200, maxPericia: 5 },
  A: { maxLevel: 35, maxGems: 300, maxPericia: 5 },
};

const COMPANION_COST = GEM_COSTS.companion;
const MASCOTE_BONUS_MULT: Record<CompanionRank, number> = { C: 2, B: 4, A: 6 };

// ─── Component ────────────────────────────────────────────────────────────────

export function CompanheirosSection() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  const companions = draft.companions ?? [];
  const profNames = draft.professions?.map(p => p.name.toLowerCase()) ?? [];
  const isAdestrador = profNames.some(n => n.includes("adestrador"));
  const isEngenheiro = profNames.some(n => n.includes("engenheiro"));
  const sobrevivencia = draft.pericias?.sobrevivencia ?? 0;
  const totalCost = companions.reduce((sum, c) => sum + COMPANION_COST[c.rank], 0);

  function addCompanion() {
    updateDraft(c => {
      if (!c.companions) c.companions = [];
      c.companions.push({
        id: crypto.randomUUID(),
        name: "",
        rank: "C",
        type: "companion",
      });
    });
  }

  function removeCompanion(id: string) {
    updateDraft(c => {
      c.companions = (c.companions ?? []).filter(x => x.id !== id);
    });
  }

  function updateCompanion(id: string, patch: Partial<CompanionData>) {
    updateDraft(c => {
      const idx = (c.companions ?? []).findIndex(x => x.id === id);
      if (idx >= 0) Object.assign(c.companions![idx], patch);
    });
  }

  return (
    <div className="space-y-5">

      {/* Header card */}
      <SectionCard title="Companheiros" icon="🐾" action={
        <Button size="sm" variant="amber" onClick={addCompanion}>+ Companheiro</Button>
      }>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {RANK_OPTIONS.map(r => {
            const lim = RANK_LIMITS[r.value];
            return (
              <div key={r.value} className="bg-slate-800 rounded-lg p-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{r.label}</p>
                <p className="text-xs font-bold text-amber-400">{r.cost}g</p>
                <p className="text-[9px] text-slate-600 mt-1">Nv. máx {lim.maxLevel} · {lim.maxGems}g</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500">
          Companheiros custam gemas da PJ. Subir Rank custa a diferença (ex: C→A = 20g adicionais).
        </p>
        {totalCost > 0 && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-3">
            <span className="text-xs text-slate-500">Custo total de companheiros</span>
            <span className="text-xs font-bold font-mono text-amber-400">{totalCost}g</span>
          </div>
        )}
      </SectionCard>

      {/* Empty state */}
      {companions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <span className="text-4xl opacity-30">🐾</span>
          <p className="text-slate-400 font-medium">Nenhum companheiro</p>
          <p className="text-sm text-slate-600 max-w-xs">
            Adicione companheiros, mascotes (Adestrador) ou autômatos (Engenheiro).
          </p>
        </div>
      )}

      {/* Companion cards */}
      {companions.map(companion => {
        const isMascote = companion.type === "mascote";
        const isAutomato = companion.type === "automato";
        const mascoteGemBonus = isMascote ? sobrevivencia * MASCOTE_BONUS_MULT[companion.rank] : 0;

        return (
          <SectionCard key={companion.id} title={companion.name || "Novo Companheiro"} icon="👤" action={
            <button
              onClick={() => removeCompanion(companion.id)}
              className="text-slate-600 hover:text-red-400 text-sm transition-colors px-1"
            >✕</button>
          }>
            <div className="space-y-3">

              {/* Name */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Nome</label>
                <input
                  value={companion.name}
                  onChange={e => updateCompanion(companion.id, { name: e.target.value })}
                  placeholder="Nome do companheiro"
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Rank */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider">Rank</label>
                  <select
                    value={companion.rank}
                    onChange={e => updateCompanion(companion.id, { rank: e.target.value as CompanionRank })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600 transition-colors cursor-pointer"
                  >
                    {RANK_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>
                        {r.label} — {r.cost}g (Nv. máx {RANK_LIMITS[r.value].maxLevel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider">Tipo</label>
                  <select
                    value={companion.type}
                    onChange={e => updateCompanion(companion.id, { type: e.target.value as CompanionType })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600 transition-colors cursor-pointer"
                  >
                    <option value="companion">Companheiro</option>
                    <option value="mascote" disabled={!isAdestrador}>
                      Mascote{!isAdestrador ? " (requer Adestrador)" : ""}
                    </option>
                    <option value="automato" disabled={!isEngenheiro}>
                      Autômato{!isEngenheiro ? " (requer Engenheiro)" : ""}
                    </option>
                  </select>
                </div>
              </div>

              {/* Type-specific info */}
              {isMascote && (
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-amber-400">Mascote — Regras especiais</p>
                  <p className="text-xs text-slate-400">
                    Lutam juntos com o Adestrador, intercalando turnos. Compartilham a CON de menor valor.
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">
                      Bônus de gemas (Sobrevivência {sobrevivencia} × {MASCOTE_BONUS_MULT[companion.rank]})
                    </span>
                    <Badge variant="amber">+{mascoteGemBonus}g</Badge>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Este bônus pode ultrapassar o limite do Rank. Mascotes não têm Perícias, Profissões nem Haki.
                  </p>
                </div>
              )}

              {isAutomato && (
                <div className="bg-blue-950/20 border border-blue-800/40 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-blue-400">Autômato — Requisitos</p>
                  <div className="space-y-1">
                    {[
                      { label: "Rank B+",                ok: companion.rank !== "C" },
                      { label: "Profissão: Engenheiro",  ok: isEngenheiro },
                      { label: "Perícia Lógica 5",       ok: (draft.pericias?.logica ?? 0) >= 5 },
                      { label: "Mín. 120g investidas",   ok: (draft.gemsSpent ?? 0) >= 120 },
                      { label: "6 shifts (Ciborgue)",    ok: (draft.cyborg?.shifts.length ?? 0) >= 6 },
                    ].map(req => (
                      <div key={req.label} className="flex items-center gap-2">
                        <span className={`text-xs ${req.ok ? "text-green-400" : "text-red-400"}`}>
                          {req.ok ? "✓" : "✕"}
                        </span>
                        <span className="text-xs text-slate-400">{req.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Pode lutar no lugar do Engenheiro contra NPCs. Derrota do Autômato = derrota do Engenheiro.
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Notas (opcional)</label>
                <textarea
                  value={companion.notes ?? ""}
                  onChange={e => updateCompanion(companion.id, { notes: e.target.value || undefined })}
                  placeholder="Espécie, personalidade, origem..."
                  rows={2}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-600 transition-colors resize-none"
                />
              </div>

            </div>
          </SectionCard>
        );
      })}

    </div>
  );
}
