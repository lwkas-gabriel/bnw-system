import { useShipStore } from "../store/shipStore";
import { useCharacterStore } from "../../character/store/characterStore";
import { Button, SectionCard, CopyButton, StatTile, ProgressBar } from "../../../shared/components";
import { SHIP_SIZES, SHIP_SIZES_ORDERED, ENGINEER_DISCOUNT } from "../../../data/ships";
import { downloadShipJSON, exportShipToJSONString, downloadShipForumHTML } from "../utils/shipExporter";
import { formatBerries } from "../../../shared/utils/format";
import { engineerDiscount, shipHullPrice, usedComodoSlots } from "../utils/shipCalc";

// ─── Tab: Overview ────────────────────────────────────────────────────────────

export function OverviewTab({ shipId }: { shipId: string }) {
  const { ships, updateShip, updateHull, deleteShip, setActiveShip, upgradeShipSize } = useShipStore();
  const { saved: savedChars } = useCharacterStore();
  const ship = ships.find(s => s.id === shipId);
  if (!ship) return null;

  const ownerChar = savedChars.find(c => c.commissionedShipId === ship.id);

  const sizeData = SHIP_SIZES[ship.size];
  const hullPct = Math.round((ship.currentHull / ship.maxHull) * 100);
  const discount = ship.builtByEngineer ? engineerDiscount(sizeData.price) : 0;
  const effectivePrice = shipHullPrice(ship);

  return (
    <div className="space-y-4">
      <SectionCard
        title={ship.name}
        icon="⛵"
        action={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => downloadShipJSON(ship)}>⬇ JSON</Button>
            <CopyButton label="📋 JSON" getText={() => exportShipToJSONString(ship)} />
            <Button size="sm" onClick={() => downloadShipForumHTML(ship)}>📜 Fórum</Button>
            <Button variant="danger" size="sm" onClick={() => { deleteShip(ship.id); setActiveShip(null); }}>
              Excluir
            </Button>
          </div>
        }
      >
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Tamanho",   value: sizeData.name },
            { label: "Tripulação máx.", value: `${ship.crew.length}/${sizeData.maxCrew}` },
            { label: "Preço",     value: formatBerries(effectivePrice) },
            { label: "Req. Percepção", value: `${sizeData.percepaoRequired}/5` },
            { label: "Cômodos",   value: `${usedComodoSlots(ship.comodoIds)}/${sizeData.comodoSlots} slots` },
            { label: "Mecanismos", value: `${ship.mechanisms.length}/${sizeData.maxMechanisms}` },
          ].map(s => (
            <StatTile key={s.label} label={s.label} value={s.value} />
          ))}
        </div>

        {/* Hull tracker */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Casco</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {ship.currentHull}/{ship.maxHull}
            </span>
          </div>
          <ProgressBar
            value={ship.currentHull}
            max={ship.maxHull}
            className="w-full h-2.5 bg-slate-700 mb-2"
            barClassName={hullPct > 60 ? "bg-green-500" : hullPct > 30 ? "bg-amber-500" : "bg-red-500"}
          />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => updateHull(ship.id, -1)} className="flex-1">−1</Button>
            <Button variant="ghost" size="sm" onClick={() => updateHull(ship.id, -5)} className="flex-1">−5</Button>
            <Button variant="ghost" size="sm" onClick={() => updateHull(ship.id, +5)} className="flex-1">+5</Button>
            <Button variant="ghost" size="sm" onClick={() => updateHull(ship.id, +1)} className="flex-1">+1</Button>
            <Button variant="ghost" size="sm" onClick={() => updateShip(ship.id, s => { s.currentHull = s.maxHull; })} className="flex-1">
              Restaurar
            </Button>
          </div>
        </div>

        {ship.builtByEngineer && (
          <p className="text-[10px] text-green-400/70 mb-3">
            ✦ Construída por Engenheiro — desconto de {ENGINEER_DISCOUNT * 100}% aplicado (economia: {formatBerries(discount)})
          </p>
        )}
        {ship.ownership === "navy_permanent" && (
          <p className="text-[10px] text-amber-400/70 mb-3">
            ⚓ Comissão Permanente · Marinha — melhorias permitidas às suas custas
          </p>
        )}
        {ship.ownership === "cp_temporary" && (
          <p className="text-[10px] text-sky-400/70 mb-3">
            🕵️ Comissão Temporária · CP — disponível por 1 aventura, sem melhorias
          </p>
        )}
        {ship.ownership === "cp_galeon" && (
          <p className="text-[10px] text-sky-400/70 mb-3">
            🕵️ Galeão · CP Comandante — embarcação emprestada
          </p>
        )}
        {ownerChar && (
          <p className="text-[10px] text-violet-400/70 mb-3">
            🧑 Personagem: <span className="font-semibold">{ownerChar.name}</span>
          </p>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Notas</label>
          <textarea
            value={ship.notes}
            onChange={e => updateShip(ship.id, s => { s.notes = e.target.value; })}
            rows={3}
            placeholder="Histórico, características, upgrades especiais..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 px-3 py-2 focus:outline-none focus:border-amber-600 resize-none"
          />
        </div>

        {/* Size upgrade */}
        {ship.size !== "colossal" && (() => {
          const currentIdx = SHIP_SIZES_ORDERED.indexOf(ship.size);
          // exclude colossal (requires Anexo Insular mechanism)
          const upgrades = SHIP_SIZES_ORDERED.slice(currentIdx + 1).filter(s => s !== "colossal");
          if (upgrades.length === 0) return null;
          const currentPrice = SHIP_SIZES[ship.size].price;
          return (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-xs font-semibold text-slate-400 mb-2">Upgrade de Tamanho</p>
              <div className="space-y-2">
                {upgrades.map(size => {
                  const data = SHIP_SIZES[size];
                  const cost = data.price - currentPrice;
                  return (
                    <div key={size} className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg">
                      <div>
                        <span className="text-xs font-medium text-slate-200">{data.name}</span>
                        <span className="text-[10px] text-slate-500 ml-2">
                          {data.maxCrew} tripulantes · {data.comodoSlots} slots
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-green-400">
                          +{formatBerries(cost)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => upgradeShipSize(ship.id, size)}
                        >
                          Fazer upgrade
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-600 mt-2">
                ⓘ Mantém todos os aprimoramentos instalados. Colossal requer Mecanismo Anexo Insular.
              </p>
            </div>
          );
        })()}
      </SectionCard>
    </div>
  );
}
