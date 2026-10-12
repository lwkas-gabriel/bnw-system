import { PageHeader, SectionCard } from "../shared/components";
import { PROFESSIONS, STANDARD_CRAFT_DC } from "../data/professions";
import { PERICIAS } from "../data/pericias";
import { QUALITY_LABELS } from "../data/equipment";

const DC_ROWS = [
  { quality: QUALITY_LABELS.common,    dc: STANDARD_CRAFT_DC.common,    color: "text-slate-300" },
  { quality: QUALITY_LABELS.splendid,  dc: STANDARD_CRAFT_DC.splendid,  color: "text-sky-400"   },
  { quality: QUALITY_LABELS.legendary, dc: STANDARD_CRAFT_DC.legendary, color: "text-amber-400" },
];

export default function ProfissoesPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Profissões"
        subtitle="7 especializações com mecânica de craft — 10 gemas cada"
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 max-w-4xl">

        {/* Regras gerais */}
        <SectionCard title="Como Funcionam" icon="📖">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Custo</p>
              <p className="text-sm font-bold font-mono text-amber-400">10 gemas</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Roll de Craft</p>
              <p className="text-sm font-bold font-mono text-amber-400">3d6 + (grad × 3)</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Slots por Aventura</p>
              <p className="text-sm font-bold font-mono text-amber-400">2 usos</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Cada profissão está vinculada a uma perícia. O roll de craft usa o bônus dessa perícia.
            Bônus raciais e de Zoan na perícia vinculada também se aplicam ao craft.
          </p>
        </SectionCard>

        {/* DCs de Craft */}
        <SectionCard title="Graus de Dificuldade do Craft" icon="🔨">
          <div className="grid grid-cols-3 gap-3 mb-3">
            {DC_ROWS.map(({ quality, dc, color }) => (
              <div key={dc} className="bg-slate-800 rounded-lg p-3 text-center">
                <p className={`text-sm font-bold ${color}`}>{quality}</p>
                <p className="text-xs text-slate-500 mt-1">DC {dc}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500">
            Atingir ou superar a DC = sucesso. Falha não consome o slot.
          </p>
        </SectionCard>

        {/* Lista de profissões */}
        <SectionCard title="As 7 Profissões" icon="📜">
          <div className="space-y-2">
            {PROFESSIONS.map(p => (
              <div key={p.id} className="flex items-start gap-4 p-3 bg-slate-800 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-slate-200">{p.name}</p>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                      {p.gemCost}g
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{p.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-slate-600 mb-1">Perícia vinculada</p>
                  <span className="text-xs font-mono bg-slate-700 text-sky-400 px-2 py-0.5 rounded">
                    {PERICIAS[p.linkedPericias[0]].name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
