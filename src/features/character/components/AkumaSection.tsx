import { useState } from "react";
import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Button, Badge } from "../../../shared/components";
import { PARAMECIA_MODULES, ZOAN_MODULES } from "../../../data/akumaModules";
import type { AkumaModuleOption } from "../../../data/akumaModules";
import type {
  AkumaRank, ZoanAkuma, LogiaAkuma, ParameciaAkuma, ZoanClass, ParameciaClass,
  ZoanAbility, ParameciaHabilityPassive, ParameciaHabilityActive, Technique,
} from "../../../shared/types/character";
import { ATTR_KEYS, ATTR_SHORT_LABELS, DEFENSIVE_ATTRS, OFFENSIVE_ATTRS, type AttrKey } from "../../../data/attributes";

// ─── Constants ────────────────────────────────────────────────────────────────

const VIGOR_ANIMAL: Record<AkumaRank, number>   = { C: 2, B: 4, A: 6, S: 6 };
const POINT_BONUS: Record<AkumaRank, number>    = { C: 1, B: 3, A: 4, S: 4 };

const RANKS: { rank: AkumaRank; cost: number }[] = [
  { rank: "C", cost: 30  },
  { rank: "B", cost: 60  },
  { rank: "A", cost: 90  },
  { rank: "S", cost: 140 },
];

const FREE_TECHS: Partial<Record<AkumaRank, string>> = {
  C: "1 Técnica Rank A gratuita",
  B: "2 Técnicas Rank A gratuitas",
};

const TYPES = [
  { id: "zoan",      icon: "🐉", label: "Zoan",      desc: "Transformação animal. Vigor CON, points (+atributos), Desperto (Rank S)." },
  { id: "logia",     icon: "⚡", label: "Logia",     desc: "+5 atributo elemental, +4 DEF+CON (Intangibilidade), Área grátis." },
  { id: "paramecia", icon: "🌀", label: "Paramecia", desc: "Poderes únicos com habilidades passivas e ativas modulares." },
];

const ZOAN_CLASSES: { id: ZoanClass; label: string; bonus: string }[] = [
  { id: "flying",    label: "Alado",     bonus: "+1 Atletismo" },
  { id: "herbivore", label: "Herbívoro", bonus: "+1 Sobrevivência" },
  { id: "carnivore", label: "Carnívoro", bonus: "+1 Furtividade" },
  { id: "rational",  label: "Racional",  bonus: "+1 Lógica" },
];

const PARAMECIA_CLASSES: { id: ParameciaClass; label: string; desc: string }[] = [
  { id: "corporeal",   label: "Corpórea",    desc: "Altera o próprio corpo" },
  { id: "substantial", label: "Substancial", desc: "Gera ou manipula substância" },
  { id: "surreal",     label: "Surreal",     desc: "Distorção da realidade" },
];


const RANK_ORDER_MAP: Record<AkumaRank, number> = { C: 0, B: 1, A: 2, S: 3 };

// Paramecia slot budget per rank
const PARAMECIA_PASSIVE_SLOTS: Record<AkumaRank, number> = { C: 2, B: 3, A: 3, S: 5 };
const PARAMECIA_ACTIVE_SLOTS:  Record<AkumaRank, number> = { C: 2, B: 3, A: 3, S: 0 };
const PARAMECIA_ACTIVE_EN:     Record<AkumaRank, number> = { C: 2, B: 3, A: 3, S: 0 };

// ─── Small helpers ────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-amber-600" : "bg-slate-700"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${value ? "translate-x-5" : ""}`} />
    </button>
  );
}

function AttrPicker({ value, color, onChange }: { value: string; color: string; onChange: (a: AttrKey) => void }) {
  return (
    <div className="flex gap-1">
      {ATTR_KEYS.map(a => (
        <button
          key={a}
          onClick={() => onChange(a)}
          className={`flex-1 py-1 rounded text-[9px] font-bold transition-colors ${
            value === a ? `${color} text-white` : "bg-slate-700 text-slate-400 hover:bg-slate-600"
          }`}
        >
          {ATTR_SHORT_LABELS[a]}
        </button>
      ))}
    </div>
  );
}

// Module badge with remove button
function ModuleBadge({ module, onRemove }: { module: AkumaModuleOption; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-900/40 border border-amber-800/50 rounded text-[10px] text-amber-300">
      {module.label}
      <button onClick={onRemove} className="text-amber-500 hover:text-red-400 leading-none">×</button>
    </span>
  );
}

// Module picker dropdown
function ModulePicker({
  modules,
  usedSlots,
  maxSlots,
  onAdd,
  isMythical,
}: {
  modules: AkumaModuleOption[];
  usedSlots: number;
  maxSlots: number;
  onAdd: (moduleId: string) => void;
  isMythical?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const remaining = maxSlots - usedSlots;
  const available = modules.filter(m => {
    if (m.mythicalOnly && !isMythical) return false;
    return m.slots <= remaining;
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={remaining <= 0}
        className="text-[10px] px-2 py-1 rounded border border-dashed border-amber-700/60 text-amber-500 hover:border-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        + Módulo ({remaining} slot{remaining !== 1 ? "s" : ""} livre{remaining !== 1 ? "s" : ""})
      </button>
      {open && (
        <div className="absolute z-10 top-7 left-0 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 max-h-52 overflow-y-auto">
          {available.length === 0 ? (
            <p className="text-[10px] text-slate-500 px-3 py-2">Nenhum módulo disponível para os slots restantes.</p>
          ) : (
            available.map(m => (
              <button
                key={m.id + m.slots}
                onClick={() => { onAdd(m.id); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-200">{m.label}</span>
                  <span className="text-[9px] text-slate-500">{m.slots} slot{m.slots !== 1 ? "s" : ""}</span>
                </div>
                <p className="text-[9px] text-slate-500">{m.description}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Akuma free technique inline editor ──────────────────────────────────────

const RANK_COLORS: Record<string, string> = {
  E: "text-slate-400", D: "text-blue-400", C: "text-green-400",
  B: "text-purple-400", A: "text-amber-400",
};

function AkumaTechEditor({ tech, onUpdate }: {
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
          <span className={`text-xs font-bold ${RANK_COLORS[tech.rank]}`}>[{tech.rank}]</span>
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
            Rank A fixo · +{tech.baseBonus} {tech.targetAttr.slice(0, 3).toUpperCase()} · {tech.energyCost} EN · Gratuita (não cobra gemas)
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AkumaSection() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  // C=1 técnica grátis, B/A/S=2 técnicas grátis
  const FREE_TECH_COUNT: Record<AkumaRank, number> = { C: 1, B: 2, A: 2, S: 2 };

  function syncFreeTechniques(c: import("../../../shared/types/character").Character, rank: AkumaRank) {
    const target = FREE_TECH_COUNT[rank];
    const existing = c.techniques.filter(t => t.source === "akuma");
    const diff = target - existing.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        c.techniques.push({
          id: crypto.randomUUID(),
          name: `Técnica Akuma ${existing.length + i + 1}`,
          description: "",
          rank: "A",
          type: "offensive",
          targetAttr: "power",
          baseBonus: 5,
          energyCost: 5,
          adherences: [],
          source: "akuma",
        });
      }
    } else if (diff < 0) {
      let toRemove = -diff;
      for (let i = c.techniques.length - 1; i >= 0 && toRemove > 0; i--) {
        if (c.techniques[i].source === "akuma") {
          c.techniques.splice(i, 1);
          toRemove--;
        }
      }
    }
  }

  function initAkuma(type: string) {
    updateDraft(c => {
      syncFreeTechniques(c, "C");
      if (type === "logia") {
        c.akuma = {
          type: "logia", name: "Nova Logia", rank: "C",
          elementalNatureAttr: "power",
          statusEnhanced: { name: "", description: "", combination: ["confusion"] },
          intangibilityBonus: { defense: 4, constitution: 4 },
        } as LogiaAkuma;
      } else if (type === "zoan") {
        c.akuma = {
          type: "zoan", name: "Nova Zoan", rank: "C",
          animalClass: "carnivore", isMythical: false, isAncestral: false,
          points: [
            { id: "hybrid", primaryAttr: "power", complementaryAttr: "constitution", bonus: 1 },
            { id: "animal", primaryAttr: "power", complementaryAttr: "constitution", bonus: 1 },
          ],
          abilities: [],
          vigorAnimalBonus: 2,
        } as ZoanAkuma;
      } else {
        c.akuma = {
          type: "paramecia", name: "Nova Paramecia", rank: "C",
          parameciaClass: "corporeal", specialAdherence: "",
          passives: [], actives: [],
        } as ParameciaAkuma;
      }
    });
  }

  function changeRank(rank: AkumaRank) {
    updateDraft(c => {
      if (!c.akuma) return;
      c.akuma.rank = rank;
      syncFreeTechniques(c, rank);
      if (c.akuma.type !== "zoan") return;
      const zoan = c.akuma as ZoanAkuma;
      zoan.vigorAnimalBonus = VIGOR_ANIMAL[rank];
      const bonus = POINT_BONUS[rank];
      const base = zoan.points.filter(p => p.id !== "awakened");
      if (base.length < 2) {
        zoan.points = [
          { id: "hybrid", primaryAttr: "power", complementaryAttr: "constitution", bonus },
          { id: "animal", primaryAttr: "power", complementaryAttr: "constitution", bonus },
        ];
      } else {
        zoan.points = base.map(p => ({ ...p, bonus }));
      }
      if (rank === "S") {
        const ref = zoan.points[0];
        zoan.points.push({
          id: "awakened",
          primaryAttr: ref.primaryAttr,
          complementaryAttr: ref.complementaryAttr,
          bonus: 8,
        });
      }
    });
  }

  const akuma = draft.akuma;

  if (!akuma) {
    return (
      <div className="space-y-4 max-w-2xl">
        <SectionCard title="Akuma no Mi" icon="🍎">
          <p className="text-xs text-slate-500 mb-3">Nenhuma Akuma no Mi. Rank C (entrada) custa 30g.</p>
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
          <div className="p-2 bg-amber-950/30 border border-amber-800/30 rounded-lg text-[10px] text-amber-400/80">
            ✨ Despertar (Rank S) — requer New World + 5 aventuras.
            {akuma.type === "logia"     && " Domínio Elemental: +5 POD+PRE por 5 EN/turno em área de 3 movimentos."}
            {akuma.type === "paramecia" && " Modo Desperto: +5 PRE ou +5 DEF (escolha/turno) por 5 EN."}
            {akuma.type === "zoan"      && " Point Desperto: +8/+8 por 5 EN/turno. + 1 Habilidade Desperta (2 módulos)."}
          </div>
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

// ─── Zoan sub-component ───────────────────────────────────────────────────────

function ZoanConfig({ zoan, onUpdate }: { zoan: ZoanAkuma; onUpdate: (fn: (z: ZoanAkuma) => void) => void }) {
  const rankIdx = RANK_ORDER_MAP[zoan.rank];

  function addAbility(isAwakened = false) {
    onUpdate(z => {
      z.abilities.push({
        id: crypto.randomUUID(),
        name: isAwakened ? "Habilidade Desperta" : `Habilidade ${z.abilities.filter(a => !a.isAwakened).length + 1}`,
        description: "",
        modules: [],
        energyCost: 1,
        condition: "",
        isAwakened,
      });
    });
  }

  function removeAbility(id: string) {
    onUpdate(z => { z.abilities = z.abilities.filter(a => a.id !== id); });
  }

  function updateAbility(id: string, patch: Partial<ZoanAbility>) {
    onUpdate(z => {
      const idx = z.abilities.findIndex(a => a.id === id);
      if (idx !== -1) Object.assign(z.abilities[idx], patch);
    });
  }

  function addModule(abilityId: string, moduleId: string) {
    onUpdate(z => {
      const ab = z.abilities.find(a => a.id === abilityId);
      if (ab) ab.modules.push(moduleId);
    });
  }

  function removeModule(abilityId: string, moduleIdx: number) {
    onUpdate(z => {
      const ab = z.abilities.find(a => a.id === abilityId);
      if (ab) ab.modules.splice(moduleIdx, 1);
    });
  }

  const regularAbilities = zoan.abilities.filter(a => !a.isAwakened);
  const awakenedAbility   = zoan.abilities.find(a => a.isAwakened);

  // Mythical: up to 2 regular abilities at Rank A+; 1 awakened at Rank S
  const canAddRegular  = zoan.isMythical && rankIdx >= RANK_ORDER_MAP["A"] && regularAbilities.length < 2;
  const canAddAwakened = zoan.isMythical && rankIdx >= RANK_ORDER_MAP["S"] && !awakenedAbility;

  return (
    <>
      <SectionCard title="Configuração Zoan" icon="🐉">
        {/* Classe */}
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Classe Animal</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {ZOAN_CLASSES.map(cls => (
            <button
              key={cls.id}
              onClick={() => onUpdate(z => { z.animalClass = cls.id; })}
              className={`p-2 rounded-lg border text-left transition-all ${
                zoan.animalClass === cls.id
                  ? "border-amber-600 bg-amber-900/20"
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              <p className="text-xs font-medium text-slate-300">{cls.label}</p>
              <p className="text-[10px] text-sky-400 mt-0.5">{cls.bonus}</p>
            </button>
          ))}
        </div>

        {/* Toggles */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-300">Mitológica</p>
              <p className="text-[10px] text-slate-500">Módulos exclusivos + Retém 1 CON</p>
            </div>
            <Toggle value={zoan.isMythical} onChange={() => onUpdate(z => { z.isMythical = !z.isMythical; })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-300">Ancestral</p>
              <p className="text-[10px] text-slate-500">Variante ancestral da espécie</p>
            </div>
            <Toggle value={zoan.isAncestral} onChange={() => onUpdate(z => { z.isAncestral = !z.isAncestral; })} />
          </div>
        </div>

        {/* Vigor Animal */}
        <div className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
          <div>
            <p className="text-xs text-slate-300">Vigor Animal</p>
            <p className="text-[10px] text-slate-500">CON bônus em todas as formas  ·  C=+2  B=+4  A/S=+6</p>
          </div>
          <span className="text-sm font-bold font-mono text-green-400">+{zoan.vigorAnimalBonus} CON</span>
        </div>
      </SectionCard>

      {/* Points */}
      <SectionCard title="Points de Transformação" icon="🔄">
        <p className="text-[10px] text-slate-500 mb-3">
          Bônus por rank: C=+1 · B=+3 · A=+4 · Desperto=+8. Troca de point: 1× por turno, sem custo de EN.
        </p>
        {zoan.points.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Altere o rank para inicializar os points.</p>
        ) : (
          <div className="space-y-3">
            {zoan.points.map((point, i) => (
              <div key={point.id} className={`p-3 rounded-lg border ${point.id === "awakened" ? "border-amber-800/40 bg-amber-950/10" : "border-slate-700 bg-slate-800"}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-300">
                    Point {point.id === "hybrid" ? "Híbrido" : point.id === "animal" ? "Animal" : "Desperto ✨"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-amber-400">+{point.bonus}/+{point.bonus}</span>
                    {point.id === "awakened" && <span className="text-[9px] text-amber-500/70">5 EN/turno</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] text-slate-600 mb-1">Principal</p>
                    <AttrPicker
                      value={point.primaryAttr}
                      color="bg-amber-600"
                      onChange={attr => onUpdate(z => { z.points[i].primaryAttr = attr; })}
                    />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-600 mb-1">Complementar</p>
                    <AttrPicker
                      value={point.complementaryAttr}
                      color="bg-blue-600"
                      onChange={attr => onUpdate(z => { z.points[i].complementaryAttr = attr; })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Habilidades Mitológicas */}
      {zoan.isMythical && (
        <SectionCard title="Habilidades Mitológicas" icon="✨">
          <p className="text-[10px] text-slate-500 mb-3">
            Desbloqueadas no Rank A · 1 módulo cada · 1 EN · Habilidade Desperta no Rank S (2 módulos).
          </p>

          {rankIdx < RANK_ORDER_MAP["A"] ? (
            <p className="text-xs text-slate-600 text-center py-3">Disponível a partir do Rank A.</p>
          ) : (
            <div className="space-y-3">
              {regularAbilities.map(ab => (
                <ZoanAbilityEditor
                  key={ab.id}
                  ability={ab}
                  maxModules={1}
                  isMythical={zoan.isMythical}
                  onUpdate={patch => updateAbility(ab.id, patch)}
                  onRemove={() => removeAbility(ab.id)}
                  onAddModule={moduleId => addModule(ab.id, moduleId)}
                  onRemoveModule={idx => removeModule(ab.id, idx)}
                />
              ))}
              {canAddRegular && (
                <button
                  onClick={() => addAbility(false)}
                  className="w-full py-2 rounded-lg border border-dashed border-slate-700 text-[10px] text-slate-500 hover:border-amber-700 hover:text-amber-500 transition-colors"
                >
                  + Adicionar Habilidade ({2 - regularAbilities.length} restante{regularAbilities.length < 1 ? "s" : ""})
                </button>
              )}
            </div>
          )}

          {/* Habilidade Desperta */}
          {rankIdx >= RANK_ORDER_MAP["S"] && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-[10px] uppercase tracking-wider text-amber-600/70 mb-2">Habilidade Desperta</p>
              {awakenedAbility ? (
                <ZoanAbilityEditor
                  ability={awakenedAbility}
                  maxModules={2}
                  isMythical={zoan.isMythical}
                  isAwakened
                  onUpdate={patch => updateAbility(awakenedAbility.id, patch)}
                  onRemove={() => removeAbility(awakenedAbility.id)}
                  onAddModule={moduleId => addModule(awakenedAbility.id, moduleId)}
                  onRemoveModule={idx => removeModule(awakenedAbility.id, idx)}
                />
              ) : canAddAwakened ? (
                <button
                  onClick={() => addAbility(true)}
                  className="w-full py-2 rounded-lg border border-dashed border-amber-800/50 text-[10px] text-amber-600/70 hover:border-amber-600 hover:text-amber-400 transition-colors"
                >
                  + Adicionar Habilidade Desperta (2 módulos)
                </button>
              ) : null}
            </div>
          )}
        </SectionCard>
      )}
    </>
  );
}

function ZoanAbilityEditor({
  ability, maxModules, isMythical, isAwakened,
  onUpdate, onRemove, onAddModule, onRemoveModule,
}: {
  ability: ZoanAbility;
  maxModules: number;
  isMythical: boolean;
  isAwakened?: boolean;
  onUpdate: (patch: Partial<ZoanAbility>) => void;
  onRemove: () => void;
  onAddModule: (moduleId: string) => void;
  onRemoveModule: (idx: number) => void;
}) {
  const usedSlots = ability.modules.length;
  const modules = ZOAN_MODULES;

  return (
    <div className={`p-3 rounded-lg border ${isAwakened ? "border-amber-800/50 bg-amber-950/10" : "border-slate-700 bg-slate-800"}`}>
      <div className="flex items-start justify-between mb-2">
        <input
          className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none border-b border-transparent focus:border-amber-600 flex-1"
          value={ability.name}
          placeholder="Nome da habilidade"
          onChange={e => onUpdate({ name: e.target.value })}
        />
        <button onClick={onRemove} className="text-slate-600 hover:text-red-400 text-xs ml-2">✕</button>
      </div>

      <input
        className="w-full bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-amber-600 mb-2"
        placeholder="Descrição..."
        value={ability.description}
        onChange={e => onUpdate({ description: e.target.value })}
      />

      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-slate-500">EN:</span>
          <input
            type="number"
            min={0} max={10}
            className="w-10 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-[10px] text-center text-slate-200 focus:outline-none"
            value={ability.energyCost}
            onChange={e => onUpdate({ energyCost: Number(e.target.value) })}
          />
        </div>
        {!isAwakened && (
          <input
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded px-2 py-0.5 text-[10px] text-slate-400 focus:outline-none focus:border-amber-600"
            placeholder="Condição (opcional)"
            value={ability.condition ?? ""}
            onChange={e => onUpdate({ condition: e.target.value })}
          />
        )}
        {isAwakened && (
          <span className="text-[9px] text-amber-500/70 italic">Condição: forma desperta ativa</span>
        )}
      </div>

      {/* Módulos */}
      <div className="flex flex-wrap gap-1 mb-2">
        {ability.modules.map((modId, idx) => {
          const m = modules.find(m => m.id === modId);
          return m ? (
            <ModuleBadge key={idx} module={m} onRemove={() => onRemoveModule(idx)} />
          ) : null;
        })}
      </div>

      {usedSlots < maxModules && (
        <ModulePicker
          modules={modules}
          usedSlots={usedSlots}
          maxSlots={maxModules}
          onAdd={onAddModule}
          isMythical={isMythical}
        />
      )}
    </div>
  );
}

// ─── Logia sub-component ──────────────────────────────────────────────────────

function LogiaConfig({ logia, onUpdate }: { logia: LogiaAkuma; onUpdate: (fn: (l: LogiaAkuma) => void) => void }) {
  return (
    <SectionCard title="Configuração Logia" icon="⚡">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Natureza Elemental (+5 ao atributo)</p>
      <div className="flex gap-2 mb-4">
        {ATTR_KEYS.map(a => (
          <button
            key={a}
            onClick={() => onUpdate(l => { l.elementalNatureAttr = a; })}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors ${
              logia.elementalNatureAttr === a ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            {ATTR_SHORT_LABELS[a]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 bg-slate-800 rounded-lg text-center">
          <p className="text-[10px] text-slate-500">Intangibilidade</p>
          <p className="text-xs font-bold text-blue-400">+4 DEF +4 CON</p>
        </div>
        <div className="p-2 bg-slate-800 rounded-lg text-center">
          <p className="text-[10px] text-slate-500">Área grátis</p>
          <p className="text-xs font-bold text-green-400">técnicas ofensivas</p>
        </div>
        <div className="p-2 bg-slate-800 rounded-lg text-center">
          <p className="text-[10px] text-slate-500">Elementalista</p>
          <p className="text-xs font-bold text-amber-400">1 EN/uso</p>
        </div>
      </div>

      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Status Aprimorado</p>
      <div className="space-y-2">
        <input
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600"
          placeholder="Nome do status (ex: Queimadura, Cegueira...)"
          value={(logia as any).statusEnhanced?.name ?? ""}
          onChange={e => onUpdate(l => { (l as any).statusEnhanced.name = e.target.value; })}
        />
        <input
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-amber-600"
          placeholder="Descrição do efeito..."
          value={(logia as any).statusEnhanced?.description ?? ""}
          onChange={e => onUpdate(l => { (l as any).statusEnhanced.description = e.target.value; })}
        />
        <p className="text-[10px] text-slate-600">
          Combine 2 efeitos aderidos ou dobre 1 (Vulnerabilidade, Confusão, Fraqueza, Fragilidade, Exaustão, Ferimento).
        </p>
      </div>
    </SectionCard>
  );
}

// ─── Paramecia sub-component ──────────────────────────────────────────────────

function ParameciaConfig({ paramecia, onUpdate }: { paramecia: ParameciaAkuma; onUpdate: (fn: (p: ParameciaAkuma) => void) => void }) {
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

function ParameciaHabilidadeEditor({
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
    const m = PARAMECIA_MODULES.find(m => m.id === modId);
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
          const m = PARAMECIA_MODULES.find(m => m.id === modId);
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
