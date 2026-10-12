import { useState } from "react";
import { useShipStore } from "../store/shipStore";
import { Button, SectionCard, Badge, ToggleButton, ProgressBar } from "../../../shared/components";
import { SHIP_SIZES, SHIP_COMODOS, SHIP_COMODOS_BY_ID, COMODO_PROFESSION } from "../../../data/ships";
import { formatBerriesShort } from "../../../shared/utils/format";
import { usedComodoSlots } from "../utils/shipCalc";

// ─── Tab: Cômodos ─────────────────────────────────────────────────────────────

export function ComodosTab({ shipId }: { shipId: string }) {
  const { ships, addComodo, removeComodo } = useShipStore();
  const [sizeFilter, setSizeFilter] = useState<1 | 2 | 3 | "all">("all");
  const ship = ships.find(s => s.id === shipId);
  if (!ship) return null;

  const sizeData = SHIP_SIZES[ship.size];
  const usedSlots = usedComodoSlots(ship.comodoIds);
  const remainingSlots = sizeData.comodoSlots - usedSlots;

  if (sizeData.comodoSlots === 0) {
    return (
      <SectionCard title="Cômodos" icon="🏠">
        <p className="text-xs text-slate-500 text-center py-6">
          Embarcações individuais não possuem cômodos.
        </p>
      </SectionCard>
    );
  }

  const filtered = SHIP_COMODOS.filter(c =>
    sizeFilter === "all" || c.size === sizeFilter
  );

  return (
    <SectionCard
      title="Cômodos"
      icon="🏠"
      action={
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{usedSlots}/{sizeData.comodoSlots} slots</span>
          <Badge variant={remainingSlots === 0 ? "red" : "amber"}>{remainingSlots} livre{remainingSlots !== 1 ? "s" : ""}</Badge>
        </div>
      }
    >
      {/* Slot bar */}
      <div className="mb-4">
        <ProgressBar value={usedSlots} max={sizeData.comodoSlots} barClassName={remainingSlots === 0 ? "bg-red-500" : "bg-amber-500"} />
      </div>

      {/* Size filters */}
      <div className="flex gap-1.5 mb-4">
        {(["all", 1, 2, 3] as const).map(f => (
          <ToggleButton
            key={f}
            active={sizeFilter === f}
            onClick={() => setSizeFilter(f)}
            className="px-2.5 py-1 rounded text-[10px]"
          >
            {f === "all" ? "Todos" : `${f} slot${f > 1 ? "s" : ""}`}
          </ToggleButton>
        ))}
      </div>

      <div className="space-y-1.5">
        {filtered.map(comodo => {
          const isSelected = ship.comodoIds.includes(comodo.id);
          const canAdd = !isSelected && comodo.size <= remainingSlots;
          return (
            <div
              key={comodo.id}
              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
                isSelected
                  ? "bg-amber-950/20 border-amber-700/40"
                  : !canAdd
                  ? "bg-slate-800/20 border-slate-700/20 opacity-40"
                  : "bg-slate-800/40 border-slate-700/30 hover:border-slate-600"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-medium text-slate-200">{comodo.name}</p>
                  <span className="text-[10px] text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded-full">
                    {comodo.size} slot{comodo.size > 1 ? "s" : ""}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600">{formatBerriesShort(comodo.price)}</span>
                  {COMODO_PROFESSION[comodo.id] && (
                    <span className="text-[10px] text-sky-400/70 bg-sky-900/20 px-1.5 py-0.5 rounded-full">
                      {COMODO_PROFESSION[comodo.id]}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{comodo.description}</p>
              </div>
              <Button
                variant={isSelected ? "danger" : "ghost"}
                size="sm"
                disabled={!isSelected && !canAdd}
                onClick={() => isSelected ? removeComodo(ship.id, comodo.id) : addComodo(ship.id, comodo.id)}
              >
                {isSelected ? "Remover" : "Adicionar"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Active cômodos summary */}
      {ship.comodoIds.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Instalados</p>
          <div className="flex flex-wrap gap-1.5">
            {ship.comodoIds.map(id => {
              const c = SHIP_COMODOS_BY_ID[id];
              return c ? (
                <span key={id} className="text-[10px] bg-amber-900/30 text-amber-300/80 px-2 py-0.5 rounded-full">
                  {c.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
