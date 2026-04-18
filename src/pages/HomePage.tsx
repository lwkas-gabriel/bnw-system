import { useNavigate } from "react-router-dom";
import { Button } from "../shared/components";
import { useCharacterStore } from "../features/character/store/characterStore";

const MODULES = [
  { path: "/characters", icon: "⚔️", title: "Personagens", desc: "Crie e gerencie fichas completas com todos os caminhos do sistema.", available: true },
  { path: "/combat",     icon: "🎲", title: "Calculadora de Combate", desc: "Simule combates com 3d6, log narrável e análise de probabilidades.", available: true },
  { path: "/items",      icon: "🔧", title: "Construtor de Itens", desc: "Monte equipamentos, armas únicas e bugigangas.", available: true },
  { path: "/ships",      icon: "⛵", title: "Embarcações", desc: "Construa e atualize navios.", available: true },
  { path: "/professions",icon: "📜", title: "Profissões", desc: "Gerencie profissões e fabricação de itens.", available: true },
  { path: "/pericias",   icon: "🧠", title: "Perícias", desc: "Distribuição de graduações e testes.", available: true },
];

export default function HomePage() {
  const navigate = useNavigate();
  const savedChars = useCharacterStore(s => s.saved);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🏴‍☠️</span>
          <div>
            <h1 className="text-3xl font-bold text-amber-400 tracking-wide">BNW System</h1>
            <p className="text-slate-500 text-sm">Ferramentas para o RPG de fórum de One Piece</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      {savedChars.length > 0 && (
        <div className="card mb-6">
          <p className="section-title">Continuar</p>
          <div className="flex flex-wrap gap-2">
            {savedChars.slice(0, 3).map(c => (
              <button
                key={c.id}
                onClick={() => navigate(`/characters/${c.id}`)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 text-sm"
              >
                <span className="text-amber-400 font-semibold">{c.name}</span>
                <span className="text-slate-500 text-xs">Lv.{c.level}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modules grid */}
      <p className="section-title mb-4">Módulos</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map(m => (
          <div
            key={m.path}
            onClick={() => m.available && navigate(m.path)}
            className={`card transition-all duration-150 ${
              m.available
                ? "cursor-pointer hover:border-amber-700 hover:bg-slate-800/80"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{m.icon}</span>
              {!m.available && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-full">
                  Coming soon
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">{m.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 p-5 rounded-xl border border-amber-800/40 bg-amber-950/20">
        <p className="text-sm text-amber-400 font-semibold mb-1">Pronto para zarpar?</p>
        <p className="text-xs text-slate-400 mb-3">Crie seu primeiro personagem com 20 gemas e todas as mecânicas do sistema.</p>
        <Button variant="primary" onClick={() => navigate("/characters/new")}>
          + Novo Personagem
        </Button>
      </div>
    </div>
  );
}
