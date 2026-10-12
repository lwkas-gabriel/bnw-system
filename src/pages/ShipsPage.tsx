import { useState } from "react";
import { useShipStore } from "../features/ships/store/shipStore";
import { PageHeader, Button, Input, Tabs } from "../shared/components";
import { SHIP_SIZES, SHIP_SIZES_ORDERED } from "../data/ships";
import type { ShipSize } from "../shared/types/ship";
import { formatBerries } from "../shared/utils/format";
import { OverviewTab } from "../features/ships/components/OverviewTab";
import { CrewTab } from "../features/ships/components/CrewTab";
import { MechanismsTab } from "../features/ships/components/MechanismsTab";
import { ComodosTab } from "../features/ships/components/ComodosTab";
import { KlabautermannTab } from "../features/ships/components/KlabautermannTab";

const SHIP_TABS = [
  { id: "overview",      label: "Visão Geral",  icon: "⛵" },
  { id: "crew",          label: "Tripulação",   icon: "👥" },
  { id: "mechanisms",    label: "Mecanismos",   icon: "⚙️" },
  { id: "comodos",       label: "Cômodos",      icon: "🏠" },
  { id: "klabautermann", label: "Klabautermann",icon: "👻" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShipsPage() {
  const { ships, activeShipId, addShip, setActiveShip } = useShipStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSize, setNewSize] = useState<ShipSize>("pequeno");
  const [builtByEngineer, setBuiltByEngineer] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const activeShip = ships.find(s => s.id === activeShipId) ?? null;

  function handleCreate() {
    if (!newName.trim()) return;
    addShip(newName.trim(), newSize, builtByEngineer);
    setNewName("");
    setNewSize("pequeno");
    setBuiltByEngineer(false);
    setShowCreate(false);
    setActiveTab("overview");
  }

  function selectShip(id: string) {
    setActiveShip(id);
    setActiveTab("overview");
    setMobileView("detail");
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Embarcações"
        subtitle="Gerencie sua frota, tripulação e mecanismos"
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            + Nova Embarcação
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Ship list — full width on mobile, fixed sidebar on desktop */}
        <div className={[
          "lg:w-64 lg:flex-shrink-0 border-r border-slate-800 overflow-y-auto p-3 space-y-1.5",
          mobileView === "list" ? "w-full" : "hidden lg:block",
        ].join(" ")}>
          {ships.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-8">Nenhuma embarcação ainda.</p>
          ) : (
            ships.map(ship => (
              <button
                key={ship.id}
                onClick={() => selectShip(ship.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeShipId === ship.id
                    ? "bg-amber-600/15 text-amber-400 border border-amber-700/30"
                    : "text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                <p className="font-medium truncate">{ship.name}</p>
                <p className="text-[10px] text-slate-500">
                  {SHIP_SIZES[ship.size].name} · {ship.crew.length} tripulantes
                  {ship.klabautermann.active && " · 👻"}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Main content — hidden on mobile when list is shown */}
        <div className={[
          "flex-1 overflow-y-auto",
          mobileView === "list" ? "hidden lg:block" : "block",
        ].join(" ")}>
          {/* Create form */}
          {showCreate && (
            <div className="m-4 p-4 bg-slate-900 border border-slate-700 rounded-xl max-w-md">
              <h3 className="text-sm font-bold text-slate-200 mb-3">Nova Embarcação</h3>
              <div className="space-y-3">
                <Input
                  label="Nome"
                  placeholder="Ex: Thousand Sunny"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()}
                  autoFocus
                />
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Tamanho</label>
                  <select
                    value={newSize}
                    onChange={e => setNewSize(e.target.value as ShipSize)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 px-3 py-2 focus:outline-none focus:border-amber-600"
                  >
                    {SHIP_SIZES_ORDERED.map(size => {
                      const data = SHIP_SIZES[size];
                      return (
                        <option key={size} value={size}>
                          {data.name} — {formatBerries(data.price)} · Percepção {data.percepaoRequired}+
                        </option>
                      );
                    })}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={builtByEngineer}
                    onChange={e => setBuiltByEngineer(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-700 accent-amber-600"
                  />
                  <span className="text-xs text-slate-400">
                    Construída por Engenheiro
                    <span className="text-green-400 ml-1">(−30% no preço)</span>
                  </span>
                </label>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)} className="flex-1">Cancelar</Button>
                <Button variant="primary" size="sm" onClick={handleCreate} className="flex-1" disabled={!newName.trim()}>Criar</Button>
              </div>
            </div>
          )}

          {!activeShip ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">⛵</p>
              <p className="text-slate-500 text-sm">Selecione ou crie uma embarcação.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Tab bar */}
              <div className="px-5 pt-4 pb-2 border-b border-slate-800 flex-shrink-0">
                <button
                  className="lg:hidden flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-3"
                  onClick={() => setMobileView("list")}
                >
                  ← Embarcações
                </button>
                <Tabs tabs={SHIP_TABS} active={activeTab} onChange={setActiveTab} />
              </div>
              {/* Tab content */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl">
                  {activeTab === "overview"      && <OverviewTab      shipId={activeShip.id} />}
                  {activeTab === "crew"          && <CrewTab          shipId={activeShip.id} />}
                  {activeTab === "mechanisms"    && <MechanismsTab    shipId={activeShip.id} />}
                  {activeTab === "comodos"       && <ComodosTab       shipId={activeShip.id} />}
                  {activeTab === "klabautermann" && <KlabautermannTab shipId={activeShip.id} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
