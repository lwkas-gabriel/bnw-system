import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacterStore } from "../store/characterStore";
import { useShipStore } from "../../ships/store/shipStore";
import { getFactionRank, COMMISSIONED_SHIP_PRESET } from "../../../data/factions";
import { SHIP_SIZES, SHIP_MECHANISMS, SHIP_COMODOS_BY_ID } from "../../../data/ships";
import { Button, Input, Badge, SectionCard } from "../../../shared/components";
import type { ShipOwnership } from "../../../shared/types/ship";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OWNERSHIP_LABELS: Record<Exclude<ShipOwnership, "owned">, { label: string; color: string; restriction: string }> = {
  navy_permanent: {
    label:       "Comissão Permanente · Marinha",
    color:       "text-amber-400",
    restriction: "Melhorias permitidas às suas custas",
  },
  cp_temporary: {
    label:       "Comissão Temporária · CP",
    color:       "text-sky-400",
    restriction: "Sem melhorias — válida por 1 aventura",
  },
  cp_galeon: {
    label:       "Galeão Emprestado · CP Comandante",
    color:       "text-sky-400",
    restriction: "Sem melhorias — embarcação emprestada",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function EmbarcacaoSection() {
  const navigate = useNavigate();
  const { draft, setCommissionedShip, saveDraft } = useCharacterStore();
  const { ships, addCommissionedShip } = useShipStore();
  const [shipName, setShipName] = useState("");

  if (!draft?.faction) return null;

  const rankDef      = getFactionRank(draft.faction.type, draft.faction.rank);
  const commission   = rankDef?.shipCommission as Exclude<ShipOwnership, "owned"> | undefined;
  if (!commission) return null;

  const ownershipInfo = OWNERSHIP_LABELS[commission];
  const linkedShip    = draft.commissionedShipId
    ? ships.find(s => s.id === draft.commissionedShipId)
    : null;

  // ─── Estado B: navio já criado ─────────────────────────────────────────────
  if (linkedShip) {
    const sizeData = SHIP_SIZES[linkedShip.size];
    return (
      <div className="space-y-4">
        <SectionCard title="Embarcação Comissionada" icon="⚓">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base font-bold text-slate-200">{linkedShip.name}</p>
              <p className={`text-xs mt-0.5 ${ownershipInfo.color}`}>{ownershipInfo.label}</p>
            </div>
            <Badge variant="amber">{sizeData.name}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Tripulação máx.", value: String(sizeData.maxCrew) },
              { label: "Casco",           value: `${linkedShip.currentHull}/${linkedShip.maxHull}` },
              { label: "Cômodos",         value: `${linkedShip.comodoIds.length} instalado(s)` },
            ].map(s => (
              <div key={s.label} className="bg-slate-800 rounded-lg p-2.5 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                <p className="text-xs font-bold font-mono text-slate-200">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => navigate("/ships")}
            >
              Ver no módulo de embarcações →
            </Button>
            <Button
              variant="danger"
              onClick={() => { setCommissionedShip(undefined); saveDraft(); }}
            >
              Desvincular
            </Button>
          </div>
        </SectionCard>
      </div>
    );
  }

  // ─── Estado A: sem navio criado ────────────────────────────────────────────
  const presetSize      = SHIP_SIZES[COMMISSIONED_SHIP_PRESET.size];
  const presetMechanism = SHIP_MECHANISMS.find(m => m.id === COMMISSIONED_SHIP_PRESET.mechanisms[0]);
  const presetComodos   = COMMISSIONED_SHIP_PRESET.comodoIds
    .map(id => SHIP_COMODOS_BY_ID[id])
    .filter(Boolean);

  function handleCommission() {
    if (!shipName.trim() || !draft) return;
    const shipId = addCommissionedShip(shipName.trim(), commission!, draft.id);
    setCommissionedShip(shipId);
    saveDraft();
    setShipName("");
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Embarcação Comissionada" icon="⚓">
        {/* Ownership badge */}
        <div className="mb-4 p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
          <p className={`text-xs font-semibold ${ownershipInfo.color} mb-0.5`}>{ownershipInfo.label}</p>
          <p className="text-[10px] text-slate-500">{ownershipInfo.restriction}</p>
        </div>

        {/* Preset info */}
        <p className="text-xs font-semibold text-slate-400 mb-2">Equipamento incluído</p>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-500">Tamanho</span>
            <span className="font-medium">{presetSize.name}</span>
            <span className="text-slate-600">· {presetSize.maxCrew} tripulantes · {presetSize.comodoSlots} slots</span>
          </div>
          {presetMechanism && (
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="text-slate-500">Mecanismo</span>
              <span className="font-medium">{presetMechanism.name}</span>
            </div>
          )}
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <span className="text-slate-500 shrink-0">Cômodos</span>
            <div className="flex flex-wrap gap-1">
              {presetComodos.map(c => (
                <span key={c!.id} className="bg-slate-700/60 px-1.5 py-0.5 rounded text-[10px]">
                  {c!.name}
                </span>
              ))}
            </div>
          </div>
        </div>


        {/* Commission form */}
        <Input
          label="Nome da embarcação"
          placeholder="Ex: Thousand Sunny"
          value={shipName}
          onChange={e => setShipName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCommission()}
        />
        <div className="mt-3">
          <Button
            variant="primary"
            className="w-full"
            disabled={!shipName.trim()}
            onClick={handleCommission}
          >
            ⚓ Comissionar embarcação
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
