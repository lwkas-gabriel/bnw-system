import { useState } from "react";
import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Button, Badge } from "../../../shared/components";
import { TECHNIQUE_RANKS } from "../../../data/techniques";
import type { Technique, TechniqueRank } from "../../../shared/types/character";
import { ATTR_SHORT_LABELS, DEFENSIVE_ATTRS, OFFENSIVE_ATTRS } from "../../../data/attributes";

const RANK_COLORS: Record<TechniqueRank, string> = {
  E: "text-slate-400 border-slate-600",
  D: "text-blue-400 border-blue-700",
  C: "text-green-400 border-green-700",
  B: "text-purple-400 border-purple-700",
  A: "text-amber-400 border-amber-600",
};

function TechCard({ tech, onRemove }: { tech: Technique; onRemove: () => void }) {
  return (
    <div className={`border rounded-xl p-3 bg-slate-900 ${RANK_COLORS[tech.rank].split(" ")[1]}`}>
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${RANK_COLORS[tech.rank].split(" ")[0]}`}>
            [{tech.rank}]
          </span>
          <span className="text-sm font-semibold text-slate-200">{tech.name}</span>
          <Badge variant={tech.type === "offensive" ? "red" : "blue"}>
            {tech.type === "offensive" ? "Ofensiva" : "Defensiva"}
          </Badge>
        </div>
        <button onClick={onRemove} className="text-slate-600 hover:text-red-400 text-xs transition-colors">✕</button>
      </div>
      <p className="text-[10px] text-slate-500 mb-2">{tech.description}</p>
      <div className="flex items-center gap-3 text-[10px]">
        <span className="text-slate-400">+{tech.baseBonus} {tech.targetAttr.slice(0, 3).toUpperCase()}</span>
        <span className="text-slate-500">{tech.energyCost} EN</span>
        {tech.source && (
          <span className="text-slate-600 capitalize">{tech.source}</span>
        )}
        {tech.adherences.map(a => (
          <span key={a.effect} className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
            {a.effect.replace("_", " ")} ×{a.times}
          </span>
        ))}
      </div>
    </div>
  );
}

function NewTechForm({ onAdd, onCancel }: { onAdd: (t: Technique) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Partial<Technique>>({
    rank: "A",
    type: "offensive",
    targetAttr: "power",
    name: "",
    description: "",
    adherences: [],
    source: "purchased",
  });

  const rankData = TECHNIQUE_RANKS[form.rank ?? "A"];

  function handleSubmit() {
    if (!form.name?.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      description: form.description ?? "",
      rank: form.rank!,
      type: form.type!,
      targetAttr: form.targetAttr!,
      baseBonus: rankData.baseBonus,
      energyCost: rankData.energyCost,
      adherences: form.adherences ?? [],
      source: form.source ?? "purchased",
    });
  }

  return (
    <div className="border border-amber-700 bg-amber-950/20 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-amber-400">Nova Técnica</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-slate-500 mb-1 block">Nome</label>
          <input
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
            placeholder="Nome da técnica"
            value={form.name ?? ""}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 mb-1 block">Rank</label>
          <div className="flex gap-1">
            {(["E","D","C","B","A"] as TechniqueRank[]).map(r => (
              <button
                key={r}
                onClick={() => setForm(f => ({ ...f, rank: r }))}
                className={`flex-1 py-1.5 rounded text-xs font-bold border transition-colors ${
                  form.rank === r ? `${RANK_COLORS[r]} bg-slate-800` : "border-slate-700 text-slate-600 hover:border-slate-500"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-slate-500 mb-1 block">Tipo</label>
          <div className="flex gap-1">
            <button
              onClick={() => setForm(f => ({ ...f, type: "offensive", targetAttr: "power" }))}
              className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${form.type === "offensive" ? "bg-red-900/50 border border-red-700 text-red-400" : "bg-slate-800 border border-slate-700 text-slate-500"}`}
            >Ofensiva</button>
            <button
              onClick={() => setForm(f => ({ ...f, type: "defensive", targetAttr: "defense" }))}
              className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${form.type === "defensive" ? "bg-blue-900/50 border border-blue-700 text-blue-400" : "bg-slate-800 border border-slate-700 text-slate-500"}`}
            >Defensiva</button>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-slate-500 mb-1 block">Atributo</label>
          <div className="flex gap-1">
            {(form.type === "offensive" ? OFFENSIVE_ATTRS : DEFENSIVE_ATTRS).map(v => [v, ATTR_SHORT_LABELS[v]] as const).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setForm(f => ({ ...f, targetAttr: v as any }))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  form.targetAttr === v ? "bg-amber-600 text-white" : "bg-slate-800 border border-slate-700 text-slate-500"
                }`}
              >{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-slate-500 mb-1 block">Descrição (opcional)</label>
        <textarea
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-600 resize-none"
          rows={2}
          placeholder="Descrição narrativa..."
          value={form.description ?? ""}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-800 rounded-lg p-2">
        <span className={`font-bold ${RANK_COLORS[form.rank ?? "A"].split(" ")[0]}`}>Rank {form.rank}</span>
        <span>+{rankData.baseBonus} bônus</span>
        <span>{rankData.energyCost} EN</span>
        <span>{rankData.gemCost}g</span>
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} className="flex-1" disabled={!form.name?.trim()}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}

export function TechniquesSection() {
  const { draft, updateDraft } = useCharacterStore();
  const [showForm, setShowForm] = useState(false);
  if (!draft) return null;

  const freeTechs = draft.techniques.filter(t => t.source !== "purchased");
  const paidTechs = draft.techniques.filter(t => t.source === "purchased");

  function addTechnique(t: Technique) {
    updateDraft(c => { c.techniques.push(t); });
    setShowForm(false);
  }

  function removeTechnique(id: string) {
    updateDraft(c => { c.techniques = c.techniques.filter(t => t.id !== id); });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {freeTechs.length > 0 && (
        <SectionCard title="Técnicas Gratuitas (Caminhos)" icon="🎁">
          <div className="space-y-2">
            {freeTechs.map(t => (
              <TechCard key={t.id} tech={t} onRemove={() => removeTechnique(t.id)} />
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="Técnicas Compradas"
        icon="⚡"
        action={
          !showForm ? (
            <Button variant="amber" size="sm" onClick={() => setShowForm(true)}>+ Nova</Button>
          ) : undefined
        }
      >
        {showForm && (
          <div className="mb-4">
            <NewTechForm onAdd={addTechnique} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {paidTechs.length === 0 && !showForm ? (
          <p className="text-xs text-slate-600 text-center py-6">Nenhuma técnica comprada ainda.</p>
        ) : (
          <div className="space-y-2">
            {paidTechs.map(t => (
              <TechCard key={t.id} tech={t} onRemove={() => removeTechnique(t.id)} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
