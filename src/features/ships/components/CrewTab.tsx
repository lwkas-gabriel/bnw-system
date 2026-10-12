import { useState } from "react";
import { useShipStore } from "../store/shipStore";
import { Button, SectionCard, Badge, Input, EmptyState } from "../../../shared/components";
import { SHIP_SIZES, SHIP_ROLE_LABELS, SHIP_ROLES } from "../../../data/ships";
import type { ShipRole } from "../../../shared/types/ship";

// ─── Tab: Crew ────────────────────────────────────────────────────────────────

export function CrewTab({ shipId }: { shipId: string }) {
  const { ships, addCrewMember, removeCrewMember } = useShipStore();
  const ship = ships.find(s => s.id === shipId);
  const [showAdd, setShowAdd] = useState(false);
  const [crewName, setCrewName] = useState("");
  const [crewRole, setCrewRole] = useState<ShipRole>("crew");

  if (!ship) return null;

  function handleAdd() {
    if (!crewName.trim()) return;
    addCrewMember(ship!.id, { name: crewName.trim(), role: crewRole });
    setCrewName("");
    setCrewRole("crew");
    setShowAdd(false);
  }

  return (
    <SectionCard
      title="Tripulação"
      icon="👥"
      action={
        <div className="flex items-center gap-2">
          <Badge variant="amber">{ship.crew.length}/{SHIP_SIZES[ship.size].maxCrew}</Badge>
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)}>
            + Adicionar
          </Button>
        </div>
      }
    >
      {showAdd && (
        <div className="mb-4 p-3 bg-slate-800 rounded-lg space-y-3">
          <Input
            label="Nome"
            placeholder="Nome do tripulante"
            value={crewName}
            onChange={e => setCrewName(e.target.value)}
            autoFocus
          />
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Função</label>
            <select
              value={crewRole}
              onChange={e => setCrewRole(e.target.value as ShipRole)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 px-3 py-2 focus:outline-none focus:border-amber-600"
            >
              {SHIP_ROLES.map(r => (
                <option key={r} value={r}>{SHIP_ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" className="flex-1" disabled={!crewName.trim()} onClick={handleAdd}>Confirmar</Button>
          </div>
        </div>
      )}

      {ship.crew.length === 0 ? (
        <EmptyState compact title="Nenhum tripulante ainda." />
      ) : (
        <div className="space-y-1.5">
          {ship.crew.map(member => (
            <div key={member.id} className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-lg">
              <div>
                <span className="text-xs font-medium text-slate-300">{member.name}</span>
                <span className="text-[10px] text-slate-500 ml-2">{SHIP_ROLE_LABELS[member.role]}</span>
              </div>
              <Button variant="danger" size="sm" onClick={() => removeCrewMember(ship.id, member.id)}>×</Button>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
