import { PageHeader, SectionCard } from "../shared/components";
import { PERICIAS, PERICIAS_DC, periciaRollBonus } from "../data/pericias";
import { totalPericiaPoints } from "../features/character/utils/attrCalc";

const LEVEL_EXAMPLES = [1, 5, 10, 20, 30, 40];

export default function PericiasPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Perícias"
        subtitle="11 habilidades com graduação 0–5, adquiridas por nível"
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 max-w-4xl">

        {/* Regras gerais */}
        <SectionCard title="Como Funcionam" icon="📖">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Roll</p>
              <p className="text-sm font-bold font-mono text-amber-400">3d6 + (grad × 3)</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Pontos iniciais (Nv. 1)</p>
              <p className="text-sm font-bold font-mono text-amber-400">3 pontos</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Máximo por perícia</p>
              <p className="text-sm font-bold font-mono text-amber-400">5 (graduação)</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            +1 ponto a cada nível par. Bônus raciais e de Zoan são aplicados por cima da graduação,
            não contam no pool investível e não são limitados pelo máximo de 5.
          </p>
        </SectionCard>

        {/* Progressão por nível */}
        <SectionCard title="Pontos por Nível" icon="📈">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {LEVEL_EXAMPLES.map(lv => (
              <div key={lv} className="bg-slate-800 rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-slate-500 mb-1">Nv. {lv}</p>
                <p className="text-sm font-bold font-mono text-amber-400">{totalPericiaPoints(lv)} pts</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Tabela de DCs */}
        <SectionCard title="Graus de Dificuldade" icon="🎯">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PERICIAS_DC.map(({ label, dc }) => (
              <div key={dc} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="text-xs font-bold font-mono text-amber-400">DC {dc}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-3">
            Roll = 3d6 + bônus de perícia. Atingir ou superar a DC = sucesso.
          </p>
        </SectionCard>

        {/* Lista de perícias */}
        <SectionCard title="As 11 Perícias" icon="🧠">
          <div className="space-y-2">
            {Object.values(PERICIAS).map(p => (
              <div key={p.id} className="flex items-start gap-4 p-3 bg-slate-800 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                </div>
                {/* Roll preview para grad 1–5 */}
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-slate-600 mb-1">Roll por grad.</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(g => (
                      <span key={g} className="text-[9px] font-mono bg-slate-700 text-slate-400 px-1 py-0.5 rounded">
                        {g}→+{periciaRollBonus(g)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
