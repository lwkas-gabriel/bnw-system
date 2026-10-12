import { useShipStore } from "../store/shipStore";
import { Button, SectionCard, ProgressBar } from "../../../shared/components";
import { KLABAUTERMANN_VOYAGES } from "../../../data/ships";

// ─── Tab: Klabautermann ───────────────────────────────────────────────────────

export function KlabautermannTab({ shipId }: { shipId: string }) {
  const { ships, incrementVoyage } = useShipStore();
  const ship = ships.find(s => s.id === shipId);
  if (!ship) return null;

  const { klabautermann } = ship;
  const progress = Math.min(10, klabautermann.voyageCount);
  const pct = (progress / KLABAUTERMANN_VOYAGES) * 100;

  return (
    <SectionCard title="Klabautermann" icon="👻">
      <p className="text-xs text-slate-400 mb-4">
        O espírito guardião de um navio. Desperta após <span className="text-amber-400">{KLABAUTERMANN_VOYAGES} viagens</span> significativas —
        tornando-se visível apenas para a tripulação, protegendo e auxiliando a embarcação.
      </p>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">Viagens realizadas</span>
          <span className={`text-xs font-mono font-bold ${klabautermann.active ? "text-amber-400" : "text-slate-300"}`}>
            {klabautermann.voyageCount}/{KLABAUTERMANN_VOYAGES}
          </span>
        </div>
        <ProgressBar value={pct} max={100} className="w-full h-3 bg-slate-700" barClassName={klabautermann.active ? "bg-amber-500" : "bg-sky-600"} />
        <div className="flex justify-between mt-1">
          {[0, 2, 4, 6, 8, 10].map(n => (
            <span key={n} className={`text-[9px] ${klabautermann.voyageCount >= n ? "text-slate-400" : "text-slate-600"}`}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Status */}
      {klabautermann.active ? (
        <div className="p-4 bg-amber-950/30 border border-amber-700/40 rounded-lg mb-4">
          <p className="text-sm font-bold text-amber-400 mb-1">✦ Klabautermann Desperto</p>
          <p className="text-xs text-amber-200/70">
            O espírito do navio se manifestou. Apenas a tripulação pode vê-lo. Ele pode alertar sobre
            perigos, reforçar o casco em momentos críticos e guiar a navegação em mares desconhecidos.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-lg mb-4">
          <p className="text-sm font-medium text-slate-400 mb-1">Aguardando Despertar...</p>
          <p className="text-xs text-slate-500">
            {10 - klabautermann.voyageCount} viagem(ns) restante(s) para o espírito despertar.
          </p>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => incrementVoyage(ship.id)}
        disabled={klabautermann.active}
      >
        + Registrar Viagem
      </Button>

      {!klabautermann.active && (
        <p className="text-[10px] text-slate-500 mt-3">
          Alternativa: use o <span className="text-amber-400">Desconto de Facção</span> (20g, fora do limite)
          para despertar instantaneamente — disponível na aba Facção do personagem.
        </p>
      )}

      {ship.klabautermannUnlockedWithDiscount && (
        <p className="text-[10px] text-amber-400/70 mt-2">★ Despertado via Desconto de Facção</p>
      )}
      {klabautermann.active && !ship.klabautermannUnlockedWithDiscount && (
        <p className="text-[10px] text-slate-600 mt-2">O Klabautermann já despertou após {klabautermann.voyageCount} viagens.</p>
      )}
    </SectionCard>
  );
}
