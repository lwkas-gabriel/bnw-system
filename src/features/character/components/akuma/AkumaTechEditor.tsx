import { useState } from "react";
import type { Technique } from "../../../../shared/types/character";
import { ATTR_SHORT_LABELS, DEFENSIVE_ATTRS, OFFENSIVE_ATTRS } from "../../../../data/attributes";
import { TECHNIQUE_RANK_STYLES } from "../techniqueRankStyles";

// ─── Akuma free technique inline editor ──────────────────────────────────────


export function AkumaTechEditor({ tech, onUpdate }: {
  tech: Technique;
  onUpdate: (patch: Partial<Technique>) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-amber-800/30 rounded-lg bg-slate-800/60">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${TECHNIQUE_RANK_STYLES[tech.rank].text}`}>[{tech.rank}]</span>
          <span className="text-xs text-slate-200">{tech.name || "Sem nome"}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
            tech.type === "offensive"
              ? "text-red-400 border-red-800/50"
              : "text-blue-400 border-blue-800/50"
          }`}>
            {tech.type === "offensive" ? "Ofensiva" : "Defensiva"}
          </span>
        </div>
        <span className="text-slate-600 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-700">
          <div className="mt-2">
            <label className="text-[10px] text-slate-500 mb-1 block">Nome</label>
            <input
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-600"
              placeholder="Nome da técnica"
              value={tech.name}
              onChange={e => onUpdate({ name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Tipo</label>
              <div className="flex gap-1">
                <button
                  onClick={() => onUpdate({ type: "offensive", targetAttr: "power" })}
                  className={`flex-1 py-1 rounded text-xs transition-colors ${
                    tech.type === "offensive"
                      ? "bg-red-900/50 border border-red-700 text-red-400"
                      : "bg-slate-700 border border-slate-600 text-slate-500"
                  }`}
                >Ofensiva</button>
                <button
                  onClick={() => onUpdate({ type: "defensive", targetAttr: "defense" })}
                  className={`flex-1 py-1 rounded text-xs transition-colors ${
                    tech.type === "defensive"
                      ? "bg-blue-900/50 border border-blue-700 text-blue-400"
                      : "bg-slate-700 border border-slate-600 text-slate-500"
                  }`}
                >Defensiva</button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Atributo</label>
              <div className="flex gap-1">
                {(tech.type === "offensive" ? OFFENSIVE_ATTRS : DEFENSIVE_ATTRS).map(v => [v, ATTR_SHORT_LABELS[v]] as const).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => onUpdate({ targetAttr: v as Technique["targetAttr"] })}
                    className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${
                      tech.targetAttr === v
                        ? "bg-amber-600 text-white"
                        : "bg-slate-700 border border-slate-600 text-slate-500"
                    }`}
                  >{l}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 mb-1 block">Descrição</label>
            <textarea
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-amber-600 resize-none"
              rows={2}
              placeholder="Descrição narrativa..."
              value={tech.description}
              onChange={e => onUpdate({ description: e.target.value })}
            />
          </div>

          <p className="text-[9px] text-slate-600">
            Rank A fixo · +{tech.baseBonus} {ATTR_SHORT_LABELS[tech.targetAttr]} · {tech.energyCost} EN · Gratuita (não cobra gemas)
          </p>
        </div>
      )}
    </div>
  );
}
