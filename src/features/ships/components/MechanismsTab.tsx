import { useShipStore } from "../store/shipStore";
import { Button, SectionCard, Badge } from "../../../shared/components";
import { SHIP_SIZES, SHIP_MECHANISMS } from "../../../data/ships";
import { COMMISSIONED_SHIP_PRESET } from "../../../data/factions";
import { formatBerriesShort } from "../../../shared/utils/format";

// ─── Tab: Mechanisms ──────────────────────────────────────────────────────────

export function MechanismsTab({ shipId }: { shipId: string }) {
  const { ships, addMechanism, removeMechanism } = useShipStore();
  const ship = ships.find(s => s.id === shipId);
  if (!ship) return null;

  const maxMech = SHIP_SIZES[ship.size].maxMechanisms;

  return (
    <SectionCard
      title="Mecanismos Avançados"
      icon="⚙️"
      action={<Badge variant={ship.mechanisms.length >= maxMech ? "red" : "amber"}>{ship.mechanisms.length}/{maxMech}</Badge>}
    >
      <p className="text-xs text-slate-500 mb-4">
        Máximo de {maxMech} mecanismos por embarcação. Upgrades permanentes.
      </p>

      <div className="space-y-2">
        {SHIP_MECHANISMS.map(mech => {
          const isSelected = ship.mechanisms.includes(mech.id);
          const isFull = !isSelected && ship.mechanisms.length >= maxMech;
          const isCommissionGrant =
            ship.ownership !== "owned" &&
            COMMISSIONED_SHIP_PRESET.mechanisms.includes(mech.id);
          return (
            <div
              key={mech.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                isSelected
                  ? "bg-amber-950/20 border-amber-700/40"
                  : isFull
                  ? "bg-slate-800/30 border-slate-700/30 opacity-50"
                  : "bg-slate-800/50 border-slate-700/50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-slate-200">{mech.name}</p>
                  {isCommissionGrant && isSelected
                    ? <span className="text-[10px] font-semibold text-amber-500">Incluído na comissão</span>
                    : <span className="text-[10px] font-mono text-slate-500">{formatBerriesShort(mech.price)}</span>
                  }
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{mech.description}</p>
              </div>
              <Button
                variant={isSelected ? "danger" : "ghost"}
                size="sm"
                disabled={isFull}
                onClick={() => isSelected ? removeMechanism(ship.id, mech.id) : addMechanism(ship.id, mech.id)}
              >
                {isSelected ? "Remover" : "Adicionar"}
              </Button>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
