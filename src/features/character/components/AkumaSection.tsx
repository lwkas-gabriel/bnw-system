// AkumaSection.tsx
import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Button, Badge } from "../../../shared/components";
import type { AkumaRank } from "../../../shared/types/character";

const TYPES = [
  { id: "zoan",     label: "Zoan",     icon: "🐉", desc: "Transformação em animal. Bônus em CON (Vigor Animal), points com +4/+4 e Desperto (+8/+8)." },
  { id: "logia",    label: "Logia",    icon: "⚡", desc: "Domínio elemental. +5 atributo, +4 DEF+CON (Intangibilidade), Área grátis em técnicas." },
  { id: "paramecia",label: "Paramecia",icon: "🌀", desc: "Poderes únicos. Habilidades passivas e ativas customizáveis com módulos." },
];

const RANKS: { rank: AkumaRank; cost: number; label: string }[] = [
  { rank: "A", cost: 90,  label: "Rank A — 90g" },
  { rank: "S", cost: 140, label: "Rank S (Desperto) — +50g = 140g total" },
];

export function AkumaSection() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <SectionCard title="Akuma no Mi" icon="🍎">
        {!draft.akuma ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Escolha o tipo da Akuma no Mi. Rank A (mínimo para builds endgame) custa 90g.</p>
            <div className="grid gap-3">
              {TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => updateDraft(c => {
                    if (t.id === "logia") {
                      c.akuma = { type: "logia", name: "Nova Logia", rank: "A",
                        elementalNatureAttr: "power",
                        statusEnhanced: { name: "Status", description: "", combination: ["confusion"] },
                        intangibilityBonus: { defense: 4, constitution: 4 },
                      };
                    } else if (t.id === "zoan") {
                      c.akuma = { type: "zoan", name: "Nova Zoan", rank: "A",
                        animalClass: "carnivore", isMythical: true, isAncestral: false,
                        points: [], abilities: [], vigorAnimalBonus: 6,
                      };
                    } else {
                      c.akuma = { type: "paramecia", name: "Nova Paramecia", rank: "A",
                        parameciaClass: "corporeal", specialAdherence: "",
                        passives: [], actives: [],
                      };
                    }
                  })}
                  className="p-4 rounded-xl border border-slate-700 bg-slate-800 hover:border-amber-700 hover:bg-slate-750 text-left transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-sm font-semibold text-slate-200">{t.label}</span>
                  </div>
                  <p className="text-xs text-slate-500">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{draft.akuma.type === "zoan" ? "🐉" : draft.akuma.type === "logia" ? "⚡" : "🌀"}</span>
                <div>
                  <input
                    className="bg-transparent text-sm font-bold text-slate-200 focus:outline-none border-b border-transparent focus:border-amber-600"
                    value={draft.akuma.name}
                    onChange={e => updateDraft(c => { if (c.akuma) c.akuma.name = e.target.value; })}
                  />
                  <p className="text-[10px] text-slate-500 capitalize">{draft.akuma.type}</p>
                </div>
              </div>
              <Badge variant="amber">Rank {draft.akuma.rank}</Badge>
            </div>

            {/* Rank selector */}
            <div className="flex gap-2">
              {RANKS.map(r => {
                const needsNewWorld = r.rank === "S" && draft.location !== "new_world";
                return (
                  <button
                    key={r.rank}
                    disabled={needsNewWorld}
                    onClick={() => updateDraft(c => { if (c.akuma) c.akuma.rank = r.rank; })}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      draft.akuma.rank === r.rank
                        ? "border-amber-600 bg-amber-900/20 text-amber-400"
                        : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {r.label}
                    {needsNewWorld && " (New World)"}
                  </button>
                );
              })}
            </div>

            {/* Type-specific info */}
            {draft.akuma.type === "logia" && (
              <div className="p-3 bg-slate-800 rounded-lg space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Natureza Elemental (+5 ao atributo)</p>
                <div className="flex gap-2">
                  {(["power","precision","defense","constitution"] as const).map(attr => (
                    <button
                      key={attr}
                      onClick={() => updateDraft(c => { if (c.akuma?.type === "logia") (c.akuma as any).elementalNatureAttr = attr; })}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                        (draft.akuma as any).elementalNatureAttr === attr
                          ? "bg-amber-600 text-white"
                          : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      }`}
                    >
                      {attr.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 bg-slate-700 rounded text-center">
                    <p className="text-[10px] text-slate-400">Intangibilidade</p>
                    <p className="text-xs font-bold text-blue-400">+4 DEF +4 CON</p>
                  </div>
                  <div className="p-2 bg-slate-700 rounded text-center">
                    <p className="text-[10px] text-slate-400">Área em técnicas</p>
                    <p className="text-xs font-bold text-green-400">Grátis</p>
                  </div>
                </div>
              </div>
            )}

            {draft.akuma.type === "zoan" && (
              <div className="p-3 bg-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Vigor Animal</span>
                  <span className="text-xs font-bold text-green-400">+{(draft.akuma as any).vigorAnimalBonus} CON</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Mitológica</span>
                  <button
                    onClick={() => updateDraft(c => { if (c.akuma?.type === "zoan") (c.akuma as any).isMythical = !(c.akuma as any).isMythical; })}
                    className={`w-10 h-5 rounded-full transition-colors ${(draft.akuma as any).isMythical ? "bg-amber-600" : "bg-slate-700"}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${(draft.akuma as any).isMythical ? "translate-x-5" : ""}`} />
                  </button>
                </div>
                {draft.akuma.rank === "S" && (
                  <div className="p-2 bg-amber-950/30 border border-amber-800/30 rounded text-[10px] text-amber-400/80">
                    Point Desperto: +8/+8 por 5 EN/turno. Habilidade Desperta: 2 módulos.
                  </div>
                )}
              </div>
            )}

            <Button variant="danger" size="sm" onClick={() => updateDraft(c => { c.akuma = null; })}>
              Remover Akuma no Mi
            </Button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
