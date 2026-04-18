import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Badge, Button } from "../../../shared/components";
import {
  FACTIONS,
  getFactionRank,
  pilhagemIncome,
  type FactionDefinition,
} from "../../../data/factions";
import { computeFactionDiscount } from "../utils/gemBudget";
import type { FactionType } from "../../../shared/types/character";

// ─── Discount target labels ───────────────────────────────────────────────────

const DISCOUNT_TARGETS = [
  "Akuma no Mi",
  "Haki",
  "Artes Marciais (2 faixas)",
  "Ciborgue",
  "Arma Única",
  "2 Técnicas Rank A",
  "Companheiro",
  "+20 EN",
  "Navio Desperto",
];

// ─── Faction picker ───────────────────────────────────────────────────────────

function FactionPicker() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  return (
    <SectionCard title="Escolha sua Facção" icon="⚑">
      <p className="text-xs text-slate-500 mb-4">
        A facção define sua carreira, prestígio e benefícios especiais.
      </p>
      <div className="grid grid-cols-1 gap-2">
        {(Object.values(FACTIONS) as FactionDefinition[]).map(fac => (
          <button
            key={fac.type}
            onClick={() => updateDraft(c => {
              c.faction = {
                type: fac.type,
                rank: fac.ranks[0].id,
                prestige: 0,
                discountUsed: false,
              };
            })}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors
              ${fac.bgClass} ${fac.borderClass} hover:opacity-90`}
          >
            <span className="text-xl">{fac.icon}</span>
            <div>
              <p className={`text-sm font-bold ${fac.colorClass}`}>{fac.name}</p>
              <p className="text-[10px] text-slate-500">
                {fac.ranks.length} ranks · Desconto no rank {fac.ranks.find(r => r.grantsDiscount)?.label ?? "—"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Benefits block ───────────────────────────────────────────────────────────

function BenefitsBlock({ type, rankId }: { type: FactionType; rankId: string }) {
  const rankDef = getFactionRank(type, rankId);
  if (!rankDef) return null;

  const fac = FACTIONS[type];

  return (
    <div className="space-y-2">
      {/* Pirate */}
      {type === "pirata" && (
        <>
          {rankDef.bountyMax != null && rankDef.bountyMax > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Recompensa máx.</span>
              <span className={`font-mono font-bold ${fac.colorClass}`}>
                ₿{rankDef.bountyMax.toLocaleString("pt-BR")}
              </span>
            </div>
          )}
          {rankDef.shipCrewBonus != null && rankDef.shipCrewBonus > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Tripulantes no navio</span>
              <span className={`font-mono font-bold ${fac.colorClass}`}>
                +{rankDef.shipCrewBonus}
                <span className="text-slate-500 text-[10px] ml-1">(só comandante conta em grupo)</span>
              </span>
            </div>
          )}
          {rankDef.followerBonus != null && rankDef.followerBonus > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Seguidores em terra</span>
              <span className={`font-mono font-bold ${fac.colorClass}`}>
                +{rankDef.followerBonus} / aventura
              </span>
            </div>
          )}
          {rankDef.shipCrewBonus != null && rankDef.followerBonus != null && rankDef.shipCrewBonus > 0 && (
            <div className="flex justify-between text-xs pt-1 border-t border-slate-700">
              <span className="text-slate-400">Pilhagem estimada</span>
              <span className="font-mono text-slate-300">
                ₿{pilhagemIncome(rankDef.shipCrewBonus, rankDef.followerBonus).toLocaleString("pt-BR")} / aventura
              </span>
            </div>
          )}
        </>
      )}

      {/* Navy / CP */}
      {(type === "marinha" || type === "governo") && (
        <>
          {rankDef.salary != null && rankDef.salary > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Salário</span>
              <span className={`font-mono font-bold ${fac.colorClass}`}>
                ₿{rankDef.salary.toLocaleString("pt-BR")} / aventura
              </span>
            </div>
          )}
          {rankDef.shipCommission === "navy_permanent" && (
            <Badge variant="blue">Comissão Permanente Disponível</Badge>
          )}
          {rankDef.shipCommission === "cp_temporary" && (
            <Badge variant="amber">Comissão Temporária (1 aventura)</Badge>
          )}
          {rankDef.shipCommission === "cp_galeon" && (
            <Badge variant="blue">Galeão Emprestado</Badge>
          )}
        </>
      )}

      {/* Bounty Hunter */}
      {type === "cacador" && rankDef.contractMax != null && rankDef.contractMax > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Contrato máx.</span>
          <span className={`font-mono font-bold ${fac.colorClass}`}>
            ₿{rankDef.contractMax.toLocaleString("pt-BR")}
          </span>
        </div>
      )}

      {/* Revolutionary */}
      {type === "revolucionario" && rankDef.missionIncome != null && rankDef.missionIncome > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Renda de missão</span>
          <span className={`font-mono font-bold ${fac.colorClass}`}>
            ₿{rankDef.missionIncome.toLocaleString("pt-BR")} / aventura
          </span>
        </div>
      )}

      {/* Prestige rate */}
      {rankDef.prestigePerAdventure > 0 && (
        <div className="flex justify-between text-xs pt-1 border-t border-slate-700">
          <span className="text-slate-400">Prestígio / aventura</span>
          <span className="font-mono text-slate-300">+{rankDef.prestigePerAdventure}</span>
        </div>
      )}
    </div>
  );
}

// ─── Discount block ───────────────────────────────────────────────────────────

function DiscountBlock() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft?.faction) return null;

  const discountInfo = computeFactionDiscount(draft);
  if (!discountInfo.hasDiscount) return null;

  if (discountInfo.used) {
    return (
      <div className="mt-3 p-3 bg-slate-800/40 border border-slate-700/40 rounded-lg">
        <p className="text-xs font-medium text-slate-400 mb-1">Desconto de Facção</p>
        <p className="text-[10px] text-slate-500">
          Utilizado em: <span className="text-slate-400">{draft.faction.discountAppliedTo ?? "—"}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-amber-950/20 border border-amber-800/30 rounded-lg">
      <p className="text-xs font-bold text-amber-400 mb-1">Desconto de Facção — +20g</p>
      <p className="text-[10px] text-slate-400 mb-3">
        20 gemas adicionais, fora do limite de 400g. Uso único por personagem.
      </p>
      <label className="block text-[10px] text-slate-400 mb-1.5">Aplicar em:</label>
      <select
        defaultValue=""
        className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 px-2 py-1.5 mb-2 focus:outline-none focus:border-amber-600"
        onChange={e => {
          if (!e.target.value) return;
          updateDraft(c => {
            if (!c.faction) return;
            c.faction.discountUsed = true;
            c.faction.discountAppliedTo = e.target.value;
          });
        }}
      >
        <option value="">Selecionar destino...</option>
        {DISCOUNT_TARGETS.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function FaccoesSection() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  if (!draft.faction) return <FactionPicker />;

  const fac = FACTIONS[draft.faction.type];
  const currentRankDef = getFactionRank(draft.faction.type, draft.faction.rank);
  const nextRank = fac.ranks.find(r =>
    r.requiredLevel > draft.level || r.requiredPrestige > draft.faction!.prestige
  );
  const discountInfo = computeFactionDiscount(draft);

  return (
    <div className="space-y-4">
      {/* Faction identity */}
      <SectionCard
        title={fac.name}
        icon={fac.icon}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateDraft(c => {
              const wasDiscountUsed = c.faction?.discountUsed ?? false;
              const wasDiscountAppliedTo = c.faction?.discountAppliedTo;
              c.faction = undefined;
              // preserve discount info if it was used (it's never lost)
              if (wasDiscountUsed) {
                // faction reset, but user can see the old discount was used
                void wasDiscountAppliedTo;
              }
            })}
          >
            Trocar Facção
          </Button>
        }
      >
        {/* Rank selector */}
        <div className="mb-4">
          <label className="block text-xs text-slate-400 mb-1.5">Cargo Atual</label>
          <select
            value={draft.faction.rank}
            onChange={e => updateDraft(c => { if (c.faction) c.faction.rank = e.target.value; })}
            className={`w-full bg-slate-800 border ${fac.borderClass} rounded-lg text-sm text-slate-200 px-3 py-2 focus:outline-none focus:border-amber-600`}
          >
            {fac.ranks.map(r => (
              <option key={r.id} value={r.id} disabled={r.requiredLevel > draft.level}>
                {r.label}{r.requiredLevel > draft.level ? ` (Nível ${r.requiredLevel}+)` : ""}
                {r.grantsDiscount ? " ★" : ""}
              </option>
            ))}
            {fac.lateralRank && (
              <option value={fac.lateralRank.id} disabled={fac.lateralRank.requiredLevel > draft.level}>
                {fac.lateralRank.label} (Lateral)
                {fac.lateralRank.requiredLevel > draft.level ? ` — Nível ${fac.lateralRank.requiredLevel}+` : ""}
              </option>
            )}
          </select>
        </div>

        {/* Prestige */}
        <div className="mb-4">
          <label className="block text-xs text-slate-400 mb-1.5">Prestígio</label>
          <input
            type="number"
            min={0}
            max={100}
            value={draft.faction.prestige}
            onChange={e => updateDraft(c => { if (c.faction) c.faction.prestige = Math.max(0, Number(e.target.value)); })}
            className="w-32 bg-slate-800 border border-slate-700 rounded text-sm text-amber-400 font-mono px-3 py-1.5 focus:outline-none focus:border-amber-600"
          />
          {nextRank && (
            <p className="text-[10px] text-slate-500 mt-1.5">
              Próximo: {nextRank.label} — Nível {nextRank.requiredLevel} + Prestígio {nextRank.requiredPrestige}
            </p>
          )}
        </div>

        {/* Discount badges */}
        {discountInfo.hasDiscount && !discountInfo.used && (
          <Badge variant="amber">★ Desconto de Facção Disponível (+20g)</Badge>
        )}
        {discountInfo.used && (
          <Badge variant="slate">Desconto utilizado em: {draft.faction.discountAppliedTo}</Badge>
        )}
      </SectionCard>

      {/* Benefits */}
      <SectionCard title="Benefícios do Cargo" icon="🎖️">
        {currentRankDef
          ? <BenefitsBlock type={draft.faction.type} rankId={draft.faction.rank} />
          : <p className="text-xs text-slate-500">Selecione um cargo acima.</p>
        }
      </SectionCard>

      {/* Discount */}
      <DiscountBlock />
    </div>
  );
}
