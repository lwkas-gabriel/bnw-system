import { useDraft } from "../hooks/useDraft";
import { SectionCard, Badge, NumberStepper, ToggleButton, Callout } from "../../../shared/components";
import {
  PERICIAS,
  PERICIAS_DC,
  RACE_PERICIA_BONUS,
  ZOAN_CLASS_PERICIA_BONUS,
  periciaRollBonus,
} from "../../../data/pericias";
import { totalPericiaPoints } from "../utils/attrCalc";
import type { PericiaId, ZoanAkuma } from "../../../shared/types/character";

const PERICIA_IDS = Object.keys(PERICIAS) as PericiaId[];

export function PericiasSection() {
  const { draft, updateDraft } = useDraft();
  if (!draft) return null;

  const maxPoints = totalPericiaPoints(draft.level);
  const totalInvested = PERICIA_IDS.reduce((sum, id) => sum + draft.pericias[id], 0);
  const remaining = maxPoints - totalInvested;

  // Racial bonus (outside the pool)
  const racialPericiaId: PericiaId | undefined =
    draft.race === "human"
      ? (draft.humanPericiaChoice ?? undefined)
      : RACE_PERICIA_BONUS[draft.race];

  // Zoan class bonus (outside the pool)
  const zoanPericiaId: PericiaId | undefined =
    draft.akuma?.type === "zoan"
      ? ZOAN_CLASS_PERICIA_BONUS[(draft.akuma as ZoanAkuma).animalClass]
      : undefined;

  function getEffectiveValue(id: PericiaId): number {
    const invested = draft!.pericias[id];
    const racial = racialPericiaId === id ? 1 : 0;
    const zoan = zoanPericiaId === id ? 1 : 0;
    return Math.min(5, invested + racial + zoan);
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header card */}
      <SectionCard
        title="Perícias"
        icon="🧠"
        action={
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold ${remaining < 0 ? "text-red-400" : remaining === 0 ? "text-slate-500" : "text-green-400"}`}>
              {remaining >= 0 ? remaining : 0} pts restantes
            </span>
            <Badge variant={remaining < 0 ? "red" : "amber"}>
              {totalInvested}/{maxPoints}
            </Badge>
          </div>
        }
      >
        <p className="text-xs text-slate-500 mb-4">
          Roll: 3d6 + (graduação × 3). Pontos iniciais: 3. Ganho: +1 a cada nível par.
        </p>

        {/* Human choice */}
        {draft.race === "human" && (
          <Callout className="mb-4 p-3 rounded-lg">
            <p className="text-xs font-medium text-amber-400 mb-2">
              Bônus Racial Humano — Escolha 1 perícia para +1 (fora do pool)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PERICIA_IDS.map(id => (
                <ToggleButton
                  key={id}
                  active={draft.humanPericiaChoice === id}
                  onClick={() => updateDraft(c => { c.humanPericiaChoice = c.humanPericiaChoice === id ? null : id; })}
                  className="px-2 py-1 rounded text-xs"
                >
                  {PERICIAS[id].name}
                </ToggleButton>
              ))}
            </div>
          </Callout>
        )}

        {/* Péricias grid */}
        <div className="space-y-2">
          {PERICIA_IDS.map(id => {
            const data = PERICIAS[id];
            const invested = draft.pericias[id];
            const hasRacialBonus = racialPericiaId === id;
            const hasZoanBonus = zoanPericiaId === id;
            const effective = getEffectiveValue(id);
            const rollBonus = periciaRollBonus(effective);

            return (
              <div
                key={id}
                className="flex items-center gap-3 p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/50"
              >
                {/* Name + description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-slate-200">{data.name}</span>
                    {hasRacialBonus && (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded-full">
                        +1 racial
                      </span>
                    )}
                    {hasZoanBonus && (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded-full">
                        +1 zoan
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{data.description}</p>
                </div>

                {/* Roll preview */}
                <div className="text-center w-16 shrink-0">
                  <p className="text-[10px] text-slate-600">roll</p>
                  <p className="text-xs font-mono text-slate-400">
                    3d6{rollBonus > 0 ? `+${rollBonus}` : ""}
                  </p>
                </div>

                {/* Stepper */}
                <NumberStepper
                  value={invested}
                  min={0}
                  max={5}
                  onChange={v => {
                    if (v > invested && remaining <= 0) return; // no points left
                    updateDraft(c => { c.pericias[id] = v; });
                  }}
                />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* DC reference */}
      <SectionCard title="Classes de Dificuldade" icon="🎯">
        <div className="grid grid-cols-2 gap-1.5">
          {PERICIAS_DC.map(dc => (
            <div key={dc.label} className="flex items-center justify-between px-2 py-1.5 bg-slate-800 rounded text-xs">
              <span className="text-slate-400">{dc.label}</span>
              <span className="font-mono font-bold text-amber-400">{dc.dc}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
