import { useState } from "react";
import { useShipStore } from "../features/ships/store/shipStore";
import { useCharacterStore } from "../features/character/store/characterStore";
import { PageHeader, Button, SectionCard, Badge, Input, Tabs, CopyButton } from "../shared/components";
import {
  SHIP_SIZES,
  SHIP_SIZES_ORDERED,
  SHIP_MECHANISMS,
  SHIP_COMODOS,
  SHIP_COMODOS_BY_ID,
  SHIP_ROLE_LABELS,
  ENGINEER_DISCOUNT,
  KLABAUTERMANN_VOYAGES,
} from "../data/ships";
import { COMMISSIONED_SHIP_PRESET } from "../data/factions";
import type { ShipSize, ShipRole } from "../shared/types/ship";
import { downloadShipJSON, exportShipToJSONString, downloadShipForumHTML } from "../features/ships/utils/shipExporter";
import { formatBerries, formatBerriesShort } from "../shared/utils/format";
import { engineerDiscount, shipHullPrice, usedComodoSlots } from "../features/ships/utils/shipCalc";

// Comodo → profession badge mapping
const COMODO_PROFESSION: Record<string, string> = {
  cozinha_industrial: "Cozinheiro",
  oficina:            "Engenheiro",
  forja:              "Ferreiro",
  laboratorio:        "Médico",
  escritorio:         "Navegador / Arqueólogo",
  biblioteca:         "Arqueólogo",
  picadeiro:          "Adestrador",
  motor:              "Ciborgue",
  remos:              "Haki / AM",
  turbina:            "Akuma no Mi",
  brigue:             "Caçador",
  antena:             "Ciborgue (Gear Drone)",
  tanque_reserva:     "Ciborgue (Combustível)",
  enfermaria:         "Médico",
};

const SHIP_ROLES = Object.keys(SHIP_ROLE_LABELS) as ShipRole[];

const SHIP_TABS = [
  { id: "overview",      label: "Visão Geral",  icon: "⛵" },
  { id: "crew",          label: "Tripulação",   icon: "👥" },
  { id: "mechanisms",    label: "Mecanismos",   icon: "⚙️" },
  { id: "comodos",       label: "Cômodos",      icon: "🏠" },
  { id: "klabautermann", label: "Klabautermann",icon: "👻" },
];


// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ shipId }: { shipId: string }) {
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
            <div key={s.label} className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
              <p className="text-sm font-bold font-mono text-slate-200">{s.value}</p>
            </div>
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
          <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${
                hullPct > 60 ? "bg-green-500" : hullPct > 30 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${hullPct}%` }}
            />
          </div>
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

// ─── Tab: Crew ────────────────────────────────────────────────────────────────

function CrewTab({ shipId }: { shipId: string }) {
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
        <p className="text-xs text-slate-600 text-center py-4">Nenhum tripulante ainda.</p>
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

// ─── Tab: Mechanisms ──────────────────────────────────────────────────────────

function MechanismsTab({ shipId }: { shipId: string }) {
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

// ─── Tab: Cômodos ─────────────────────────────────────────────────────────────

function ComodosTab({ shipId }: { shipId: string }) {
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
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${remainingSlots === 0 ? "bg-red-500" : "bg-amber-500"}`}
            style={{ width: `${Math.min(100, (usedSlots / sizeData.comodoSlots) * 100)}%` }}
          />
        </div>
      </div>

      {/* Size filters */}
      <div className="flex gap-1.5 mb-4">
        {(["all", 1, 2, 3] as const).map(f => (
          <button
            key={f}
            onClick={() => setSizeFilter(f)}
            className={`px-2.5 py-1 rounded text-[10px] transition-colors ${
              sizeFilter === f
                ? "bg-amber-600 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            {f === "all" ? "Todos" : `${f} slot${f > 1 ? "s" : ""}`}
          </button>
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

// ─── Tab: Klabautermann ───────────────────────────────────────────────────────

function KlabautermannTab({ shipId }: { shipId: string }) {
  const { ships, incrementVoyage } = useShipStore();
  const ship = ships.find(s => s.id === shipId);
  if (!ship) return null;

  const { klabautermann } = ship;
  const progress = Math.min(10, klabautermann.voyageCount);
  const pct = (progress / 10) * 100;

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
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              klabautermann.active ? "bg-amber-500" : "bg-sky-600"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
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
