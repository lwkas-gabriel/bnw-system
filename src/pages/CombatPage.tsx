import { useCombatStore } from "../features/combat/store/combatStore";
import { useCharacterStore } from "../features/character/store/characterStore";
import { PageHeader, Button, EmptyState } from "../shared/components";
import type { Character } from "../shared/types/character";
import { ATTR_KEYS, ATTR_SHORT_LABELS } from "../data/attributes";
import { baseAttributes } from "../features/character/utils/attrCalc";
import { hitProbability } from "../features/combat/engine/combatEngine";

function CombatantPanel({
  label, char, onSelect,
}: { label: string; char: Character | null; onSelect: (c: Character | null) => void }) {
  const saved = useCharacterStore(s => s.saved);

  return (
    <div className="card flex-1">
      <p className="section-title mb-3">{label}</p>
      {!char ? (
        <div>
          <p className="text-xs text-slate-500 mb-3">Selecione um personagem salvo ou configure manualmente.</p>
          {saved.length === 0 ? (
            <EmptyState compact title="Nenhum personagem salvo." />
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {saved.map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
                >
                  <span className="text-slate-300 font-medium">{c.name}</span>
                  <span className="text-slate-500 text-xs">Lv.{c.level}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-slate-200">{char.name}</p>
              <p className="text-xs text-slate-500">Nível {char.level} · {char.race}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onSelect(null)}>Trocar</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
            {ATTR_KEYS.map(attr => ({ l: ATTR_SHORT_LABELS[attr], v: baseAttributes(char, false)[attr] })).map(s => (
              <div key={s.l} className="bg-slate-800 rounded p-1.5">
                <p className="text-[9px] text-slate-500 uppercase">{s.l}</p>
                <p className="text-sm font-bold font-mono text-slate-200">{s.v}</p>
              </div>
            ))}
          </div>
          {char.akuma && (
            <div className="mt-2 text-[10px] text-slate-500">
              {char.akuma.name} ({char.akuma.type} {char.akuma.rank})
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CombatLog({ log }: { log: string }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400">Log de Combate</p>
        <button
          onClick={() => navigator.clipboard.writeText(log)}
          className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          📋 Copiar
        </button>
      </div>
      <pre className="px-4 py-3 text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
        {log || "Nenhuma simulação executada ainda."}
      </pre>
    </div>
  );
}

export default function CombatPage() {
  const {
    charA, charB, mode, setMode, setCharA, setCharB,
    choices, addTurn, simulate, reset,
    result, isRunning, toggleAverage, useAverage,
  } = useCombatStore();

  const canSimulate = !!charA && !!charB;

  // Simple probability display
  let hitAonB: number | null = null;
  let hitBonA: number | null = null;
  if (charA && charB) {
    const preA = 1 + charA.investedAttributes.precision + (charA.akuma?.type === "logia" ? 5 : 0) + 5; // rough with Haki Obs
    const defB = 1 + charB.investedAttributes.defense + 5; // rough with Haki Obs
    const preB = 1 + charB.investedAttributes.precision + (charB.akuma?.type === "logia" ? 5 : 0) + 5;
    const defA = 1 + charA.investedAttributes.defense + 5;
    hitAonB = Math.round(hitProbability(preA, defB) * 100);
    hitBonA = Math.round(hitProbability(preB, defA) * 100);
  }

  return (
    <div>
      <PageHeader
        title="Calculadora de Combate"
        subtitle="Simule confrontos com 3d6 ou média determinística"
        actions={
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked={useAverage} onChange={toggleAverage} className="rounded" />
              Usar média (3d6=11)
            </label>
            <Button variant="ghost" size="sm" onClick={reset}>Limpar</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={simulate}
              disabled={!canSimulate || isRunning}
            >
              {isRunning ? "Simulando..." : "▶ Simular"}
            </Button>
          </div>
        }
      />

      <div className="px-6 py-5 space-y-4">
        {/* Mode selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Modo:</span>
          <div className="flex gap-1">
            {([
              { id: "jxj", label: "Jogador × Jogador" },
              { id: "vs_npc", label: "Jogador × NPC" },
            ] as const).map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mode === m.id ? "bg-amber-600 text-white" : "bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >{m.label}</button>
            ))}
          </div>
        </div>

        {/* Combatants */}
        <div className="flex flex-col lg:flex-row gap-4">
          <CombatantPanel label="Combatente A" char={charA} onSelect={setCharA} />
          <div className="flex items-center justify-center text-2xl text-slate-600 font-bold px-2">⚔️</div>
          <CombatantPanel label="Combatente B" char={charB} onSelect={setCharB} />
        </div>

        {/* Quick stats */}
        {charA && charB && (
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center">
              <p className="text-[10px] text-slate-500 mb-1">{charA.name} acerta {charB.name}</p>
              <p className={`text-2xl font-bold font-mono ${(hitAonB ?? 0) > 70 ? "text-green-400" : (hitAonB ?? 0) > 40 ? "text-amber-400" : "text-red-400"}`}>
                {hitAonB}%
              </p>
            </div>
            <div className="card text-center">
              <p className="text-[10px] text-slate-500 mb-1">{charB.name} acerta {charA.name}</p>
              <p className={`text-2xl font-bold font-mono ${(hitBonA ?? 0) > 70 ? "text-green-400" : (hitBonA ?? 0) > 40 ? "text-amber-400" : "text-red-400"}`}>
                {hitBonA}%
              </p>
            </div>
          </div>
        )}

        {/* Turns config */}
        {canSimulate && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-300">Configuração de Turnos</p>
              <Button size="sm" variant="amber" onClick={addTurn}>+ Turno</Button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              {choices.length} turno{choices.length !== 1 ? "s" : ""} configurado{choices.length !== 1 ? "s" : ""}.
              Para cada turno, configure as técnicas de cada combatente individualmente.
            </p>
            <div className="flex flex-wrap gap-2">
              {choices.map((_, i) => (
                <div key={i} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400">
                  T{i + 1}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-2">
              Configuração avançada por turno em desenvolvimento — a simulação usa os bônus base dos personagens.
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border ${result.winner ? "border-green-700 bg-green-950/30" : "border-slate-700 bg-slate-900"}`}>
              <p className="text-sm font-bold text-slate-200">
                {result.winner
                  ? `🏆 ${result.winner === charA?.id ? charA?.name : charB?.name} vence!`
                  : "⚔️ Empate — ambos os combatentes foram nocauteados."}
              </p>
              <p className="text-xs text-slate-500 mt-1">{result.turnsCount} turno{result.turnsCount !== 1 ? "s" : ""}</p>
            </div>
            <CombatLog log={result.narration} />
          </div>
        )}
      </div>
    </div>
  );
}
