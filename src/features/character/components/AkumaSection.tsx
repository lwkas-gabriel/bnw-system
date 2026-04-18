import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Button, Badge } from "../../../shared/components";
import type {
  AkumaRank, ZoanAkuma, LogiaAkuma, ParameciaAkuma, ZoanClass, ParameciaClass,
} from "../../../shared/types/character";

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

const ATTRS = ["power", "precision", "defense", "constitution"] as const;
const ATTR_LABEL: Record<string, string> = { power: "POD", precision: "PRE", defense: "DEF", constitution: "CON" };

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

function AttrPicker({ value, color, onChange }: { value: string; color: string; onChange: (a: typeof ATTRS[number]) => void }) {
  return (
    <div className="flex gap-1">
      {ATTRS.map(a => (
        <button
          key={a}
          onClick={() => onChange(a)}
          className={`flex-1 py-1 rounded text-[9px] font-bold transition-colors ${
            value === a ? `${color} text-white` : "bg-slate-700 text-slate-400 hover:bg-slate-600"
          }`}
        >
          {ATTR_LABEL[a]}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AkumaSection() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  // ── Init helpers ──────────────────────────────────────────────────

  function initAkuma(type: string) {
    updateDraft(c => {
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
            { id: "hybrid", primaryAttr: "power",        complementaryAttr: "constitution", bonus: 1 },
            { id: "animal", primaryAttr: "power",        complementaryAttr: "constitution", bonus: 1 },
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
      if (c.akuma.type !== "zoan") return;
      const zoan = c.akuma as ZoanAkuma;
      zoan.vigorAnimalBonus = VIGOR_ANIMAL[rank];
      const bonus = POINT_BONUS[rank];
      // Ensure 2 base points exist
      const base = zoan.points.filter(p => p.id !== "awakened");
      if (base.length < 2) {
        zoan.points = [
          { id: "hybrid", primaryAttr: "power", complementaryAttr: "constitution", bonus },
          { id: "animal", primaryAttr: "power", complementaryAttr: "constitution", bonus },
        ];
      } else {
        zoan.points = base.map(p => ({ ...p, bonus }));
      }
      // Add or remove Awakened point
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

  // ── Empty state ────────────────────────────────────────────────────

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

  // ── Active state ───────────────────────────────────────────────────

  const typeIcon = akuma.type === "zoan" ? "🐉" : akuma.type === "logia" ? "⚡" : "🌀";

  return (
    <div className="space-y-4 max-w-2xl">

      {/* Header card */}
      <SectionCard
        title="Akuma no Mi"
        icon="🍎"
        action={<Button variant="danger" size="sm" onClick={() => updateDraft(c => { c.akuma = null; })}>Remover</Button>}
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

        {/* Evolution costs reminder */}
        <div className="flex gap-2 mb-3">
          {[["C→B", "+30g"], ["B→A", "+30g"], ["A→S", "+50g"]].map(([label, cost]) => (
            <div key={label} className="flex-1 text-center p-1.5 bg-slate-800 rounded text-[9px]">
              <span className="text-slate-400">{label} </span>
              <span className="text-amber-400 font-mono">{cost}</span>
            </div>
          ))}
        </div>

        {/* Free technique banner */}
        {FREE_TECHS[akuma.rank] && (
          <div className="p-2 bg-green-950/30 border border-green-800/40 rounded-lg text-[10px] text-green-400 mb-2">
            🎁 {FREE_TECHS[akuma.rank]} — adicione na aba Técnicas com source "akuma" (não cobra gemas)
          </div>
        )}

        {/* Rank S awakening note */}
        {akuma.rank === "S" && (
          <div className="p-2 bg-amber-950/30 border border-amber-800/30 rounded-lg text-[10px] text-amber-400/80">
            ✨ Despertar (Rank S) — requer New World + 5 aventuras.
            {akuma.type === "logia"     && " Domínio Elemental: +5 POD+PRE por 5 EN/turno em área de 3 movimentos."}
            {akuma.type === "paramecia" && " Modo Desperto: +5 PRE ou +5 DEF (escolha/turno) por 5 EN."}
            {akuma.type === "zoan"      && " Point Desperto: +8/+8 por 5 EN/turno. + 1 Habilidade Desperta (2 módulos)."}
          </div>
        )}
      </SectionCard>

      {/* ── Zoan ────────────────────────────────────────────────────── */}
      {akuma.type === "zoan" && (
        <ZoanConfig
          zoan={akuma as ZoanAkuma}
          onUpdate={(updater) => updateDraft(c => { if (c.akuma?.type === "zoan") updater(c.akuma as ZoanAkuma); })}
        />
      )}

      {/* ── Logia ────────────────────────────────────────────────────── */}
      {akuma.type === "logia" && (
        <LogiaConfig
          logia={akuma as LogiaAkuma}
          onUpdate={(updater) => updateDraft(c => { if (c.akuma?.type === "logia") updater(c.akuma as LogiaAkuma); })}
        />
      )}

      {/* ── Paramecia ────────────────────────────────────────────────── */}
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
    </>
  );
}

// ─── Logia sub-component ──────────────────────────────────────────────────────

function LogiaConfig({ logia, onUpdate }: { logia: LogiaAkuma; onUpdate: (fn: (l: LogiaAkuma) => void) => void }) {
  return (
    <SectionCard title="Configuração Logia" icon="⚡">
      {/* Natureza Elemental */}
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Natureza Elemental (+5 ao atributo)</p>
      <div className="flex gap-2 mb-4">
        {ATTRS.map(a => (
          <button
            key={a}
            onClick={() => onUpdate(l => { l.elementalNatureAttr = a; })}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors ${
              logia.elementalNatureAttr === a ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            {ATTR_LABEL[a]}
          </button>
        ))}
      </div>

      {/* Passivos */}
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

      {/* Status Aprimorado */}
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

const RANK_ORDER_MAP: Record<AkumaRank, number> = { C: 0, B: 1, A: 2, S: 3 };

function ParameciaConfig({ paramecia, onUpdate }: { paramecia: ParameciaAkuma; onUpdate: (fn: (p: ParameciaAkuma) => void) => void }) {
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
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Habilidades por Rank</p>
      <div className="space-y-2">
        {([
          { rank: "C" as AkumaRank, passive: "2 slots", active: "2 slots / 2 EN" },
          { rank: "B" as AkumaRank, passive: "3 slots", active: "3 slots / 3 EN" },
          { rank: "A" as AkumaRank, passive: "3 slots", active: "3 slots / 3 EN + condição opcional" },
        ]).map(row => {
          const unlocked = RANK_ORDER_MAP[paramecia.rank] >= RANK_ORDER_MAP[row.rank];
          return (
            <div
              key={row.rank}
              className={`p-2 rounded-lg border flex items-start gap-3 ${
                unlocked ? "border-amber-800/40 bg-amber-950/10" : "border-slate-700 bg-slate-800 opacity-50"
              }`}
            >
              <span className={`text-xs font-bold w-6 shrink-0 ${unlocked ? "text-amber-400" : "text-slate-500"}`}>
                {row.rank}
              </span>
              <div className="text-[10px] text-slate-400 space-y-0.5">
                <p>Passiva: {row.passive}</p>
                <p>Ativa: {row.active}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-slate-600 mt-2">Configure módulos com o narrador em tópico de habilidades.</p>
    </SectionCard>
  );
}
