import { useNavigate } from "react-router-dom";
import { useCharacterStore } from "../features/character/store/characterStore";
import { PageHeader, Button, EmptyState, Badge } from "../shared/components";
import type { Character } from "../shared/types/character";

function CharacterCard({ char, onLoad, onDelete }: { char: Character; onLoad: () => void; onDelete: () => void }) {
  const paths = [
    char.akuma    && `Akuma (${char.akuma.type})`,
    char.haki     && `Haki`,
    char.artesMarciais?.currentFaixa && `AM ${char.artesMarciais.currentFaixa}`,
    char.cyborg   && `Ciborgue S${char.cyborg.shifts.length}`,
  ].filter(Boolean);

  return (
    <div className="card hover:border-slate-600 transition-colors group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-200 truncate">{char.name}</h3>
            <Badge variant="amber">Lv. {char.level}</Badge>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {paths.map(p => (
              <span key={p} className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{p}</span>
            ))}
            {paths.length === 0 && (
              <span className="text-[10px] text-slate-600">Sem caminhos configurados</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {[
              { label: "POD", value: 1 + char.investedAttributes.power },
              { label: "PRE", value: 1 + char.investedAttributes.precision },
              { label: "DEF", value: 1 + char.investedAttributes.defense },
              { label: "CON", value: 3 + char.investedAttributes.constitution },
            ].map(s => (
              <div key={s.label} className="bg-slate-800 rounded p-1">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-bold font-mono text-slate-300">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
        <Button size="sm" variant="primary" onClick={onLoad} className="flex-1">
          Editar
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>
          Deletar
        </Button>
      </div>
    </div>
  );
}

export default function CharacterListPage() {
  const navigate = useNavigate();
  const { saved, deleteCharacter, loadCharacter } = useCharacterStore();

  function handleLoad(id: string) {
    loadCharacter(id);
    navigate(`/characters/${id}`);
  }

  return (
    <div>
      <PageHeader
        title="Personagens"
        subtitle={`${saved.length} ficha${saved.length !== 1 ? "s" : ""} salva${saved.length !== 1 ? "s" : ""}`}
        actions={
          <Button variant="primary" onClick={() => navigate("/characters/new")}>
            + Novo
          </Button>
        }
      />

      <div className="px-6 py-6">
        {saved.length === 0 ? (
          <EmptyState
            icon="⚔️"
            title="Nenhum personagem ainda"
            description="Crie sua primeira ficha e comece a aventura."
            action={
              <Button variant="primary" onClick={() => navigate("/characters/new")}>
                + Criar Personagem
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {saved.map(char => (
              <CharacterCard
                key={char.id}
                char={char}
                onLoad={() => handleLoad(char.id)}
                onDelete={() => deleteCharacter(char.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
