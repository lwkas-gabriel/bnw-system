// ArtesMarciaisSection.tsx
import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Button, Badge } from "../../../shared/components";
import type { AMFaixaId } from "../../../shared/types/character";
import { GEM_COSTS } from "../utils/gemBudget";

const FAIXAS: { id: AMFaixaId; label: string; bonus: string; location: string }[] = [
  { id: "branca",      label: "Branca",      bonus: "+2 bônus na arma",          location: "Qualquer" },
  { id: "cinza",       label: "Cinza",        bonus: "+2 Precisão",               location: "Qualquer" },
  { id: "azul_clara",  label: "Azul Clara",   bonus: "+2 Defesa",                 location: "Qualquer" },
  { id: "azul_escura", label: "Azul Escura",  bonus: "+2 Poder",                  location: "Qualquer" },
  { id: "amarela",     label: "Amarela",      bonus: "+2 Constituição",           location: "Qualquer" },
  { id: "laranja",     label: "Laranja",      bonus: "+1 itens def + Arma Única", location: "Grand Line" },
  { id: "verde",       label: "Verde",        bonus: "+2 técnicas defensivas",    location: "Grand Line" },
  { id: "roxa",        label: "Roxa",         bonus: "+2 técnicas ofensivas",     location: "Grand Line" },
  { id: "marrom",      label: "Marrom",       bonus: "+1 itens def + 1 Rank A",   location: "Grand Line" },
  { id: "preta",       label: "Preta",        bonus: "Equipa arma extra",         location: "New World" },
  { id: "coral",       label: "Coral",        bonus: "+2 na arma extra",          location: "New World" },
  { id: "rajada",      label: "Rajada",       bonus: "+1 itens defensivos",       location: "New World" },
  { id: "vermelha",    label: "Vermelha",     bonus: "+2 POD/PRE/DEF/CON por 2 EN", location: "New World" },
  { id: "grao_mestre", label: "Grão-Mestre",  bonus: "+2 rolagem ou -2 oponente", location: "New World" },
];

const ORDER = FAIXAS.map(f => f.id);

function isAvailable(id: AMFaixaId, location: typeof import("../../../shared/types/character").Character.prototype.location): boolean {
  const f = FAIXAS.find(f => f.id === id)!;
  if (f.location === "Qualquer") return true;
  if (f.location === "Grand Line") return location === "grand_line" || location === "new_world";
  if (f.location === "New World") return location === "new_world";
  return false;
}

export function ArtesMarciaisSection() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  const currentFaixa = draft.artesMarciais?.currentFaixa ?? null;
  const currentIdx = currentFaixa ? ORDER.indexOf(currentFaixa) : -1;

  const totalCost = currentFaixa
    ? ORDER.slice(0, currentIdx + 1).reduce((s, f) => s + GEM_COSTS.artesMarciais[f as AMFaixaId], 0)
    : 0;

  function selectFaixa(id: AMFaixaId) {
    const newIdx = ORDER.indexOf(id);
    const isSame = currentFaixa === id;
    updateDraft(c => {
      if (!c.artesMarciais) c.artesMarciais = { currentFaixa: null, laranjaChoice: null };
      c.artesMarciais.currentFaixa = isSame ? (newIdx > 0 ? ORDER[newIdx - 1] as AMFaixaId : null) : id;
    });
  }

  const hasLaranja = currentIdx >= ORDER.indexOf("laranja");

  return (
    <div className="space-y-4 max-w-2xl">
      <SectionCard
        title="Artes Marciais"
        icon="🥋"
        action={totalCost > 0 ? <Badge variant="amber">{totalCost}g</Badge> : undefined}
      >
        <p className="text-xs text-slate-500 mb-4">Selecione a faixa atual. Todas as faixas anteriores são adquiridas automaticamente.</p>

        <div className="space-y-1.5">
          {FAIXAS.map((faixa, idx) => {
            const available = isAvailable(faixa.id, draft.location);
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
                    {!available && <span className="text-[9px] text-slate-600">{faixa.location}</span>}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{faixa.bonus}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">10g</span>
              </button>
            );
          })}
        </div>

        {/* Laranja choice */}
        {hasLaranja && (
          <div className="mt-4 p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
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
          </div>
        )}
      </SectionCard>
    </div>
  );
}
