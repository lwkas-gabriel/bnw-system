import { SectionCard, Switch } from "../../../../shared/components";
import { ZOAN_MODULES } from "../../../../data/akumaModules";
import type { ZoanAkuma, ZoanAbility } from "../../../../shared/types/character";
import { ZOAN_CLASSES, RANK_ORDER_MAP } from "./constants";
import { AttrPicker, ModuleBadge, ModulePicker } from "./AkumaFields";

// ─── Zoan sub-component ───────────────────────────────────────────────────────

export function ZoanConfig({ zoan, onUpdate }: { zoan: ZoanAkuma; onUpdate: (fn: (z: ZoanAkuma) => void) => void }) {
  const rankIdx = RANK_ORDER_MAP[zoan.rank];

  function addAbility(isAwakened = false) {
    onUpdate(z => {
      z.abilities.push({
        id: crypto.randomUUID(),
        name: isAwakened ? "Habilidade Desperta" : `Habilidade ${z.abilities.filter(a => !a.isAwakened).length + 1}`,
        description: "",
        modules: [],
        energyCost: 1,
        condition: "",
        isAwakened,
      });
    });
  }

  function removeAbility(id: string) {
    onUpdate(z => { z.abilities = z.abilities.filter(a => a.id !== id); });
  }

  function updateAbility(id: string, patch: Partial<ZoanAbility>) {
    onUpdate(z => {
      const idx = z.abilities.findIndex(a => a.id === id);
      if (idx !== -1) Object.assign(z.abilities[idx], patch);
    });
  }

  function addModule(abilityId: string, moduleId: string) {
    onUpdate(z => {
      const ab = z.abilities.find(a => a.id === abilityId);
      if (ab) ab.modules.push(moduleId);
    });
  }

  function removeModule(abilityId: string, moduleIdx: number) {
    onUpdate(z => {
      const ab = z.abilities.find(a => a.id === abilityId);
      if (ab) ab.modules.splice(moduleIdx, 1);
    });
  }

  const regularAbilities = zoan.abilities.filter(a => !a.isAwakened);
  const awakenedAbility   = zoan.abilities.find(a => a.isAwakened);

  // Mythical: up to 2 regular abilities at Rank A+; 1 awakened at Rank S
  const canAddRegular  = zoan.isMythical && rankIdx >= RANK_ORDER_MAP["A"] && regularAbilities.length < 2;
  const canAddAwakened = zoan.isMythical && rankIdx >= RANK_ORDER_MAP["S"] && !awakenedAbility;

  return (
    <>
      <SectionCard title="Configuração Zoan" icon="🐉">
        {/* Classe */}
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Classe Animal</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {ZOAN_CLASSES.map(cls => (
            <button
              key={cls.id}
              onClick={() => onUpdate(z => { z.animalClass = cls.id; })}
              className={`p-2 rounded-lg border text-left transition-all ${
                zoan.animalClass === cls.id
                  ? "border-amber-600 bg-amber-900/20"
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              <p className="text-xs font-medium text-slate-300">{cls.label}</p>
              <p className="text-[10px] text-sky-400 mt-0.5">{cls.bonus}</p>
            </button>
          ))}
        </div>

        {/* Toggles */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-300">Mitológica</p>
              <p className="text-[10px] text-slate-500">Módulos exclusivos + Retém 1 CON</p>
            </div>
            <Switch checked={zoan.isMythical} onChange={() => onUpdate(z => { z.isMythical = !z.isMythical; })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-300">Ancestral</p>
              <p className="text-[10px] text-slate-500">Variante ancestral da espécie</p>
            </div>
            <Switch checked={zoan.isAncestral} onChange={() => onUpdate(z => { z.isAncestral = !z.isAncestral; })} />
          </div>
        </div>

        {/* Vigor Animal */}
        <div className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
          <div>
            <p className="text-xs text-slate-300">Vigor Animal</p>
            <p className="text-[10px] text-slate-500">CON bônus em todas as formas  ·  C=+2  B=+4  A/S=+6</p>
          </div>
          <span className="text-sm font-bold font-mono text-green-400">+{zoan.vigorAnimalBonus} CON</span>
        </div>
      </SectionCard>

      {/* Points */}
      <SectionCard title="Points de Transformação" icon="🔄">
        <p className="text-[10px] text-slate-500 mb-3">
          Bônus por rank: C=+1 · B=+3 · A=+4 · Desperto=+8. Troca de point: 1× por turno, sem custo de EN.
        </p>
        {zoan.points.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Altere o rank para inicializar os points.</p>
        ) : (
          <div className="space-y-3">
            {zoan.points.map((point, i) => (
              <div key={point.id} className={`p-3 rounded-lg border ${point.id === "awakened" ? "border-amber-800/40 bg-amber-950/10" : "border-slate-700 bg-slate-800"}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-300">
                    Point {point.id === "hybrid" ? "Híbrido" : point.id === "animal" ? "Animal" : "Desperto ✨"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-amber-400">+{point.bonus}/+{point.bonus}</span>
                    {point.id === "awakened" && <span className="text-[9px] text-amber-500/70">5 EN/turno</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] text-slate-600 mb-1">Principal</p>
                    <AttrPicker
                      value={point.primaryAttr}
                      color="bg-amber-600"
                      onChange={attr => onUpdate(z => { z.points[i].primaryAttr = attr; })}
                    />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-600 mb-1">Complementar</p>
                    <AttrPicker
                      value={point.complementaryAttr}
                      color="bg-blue-600"
                      onChange={attr => onUpdate(z => { z.points[i].complementaryAttr = attr; })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Habilidades Mitológicas */}
      {zoan.isMythical && (
        <SectionCard title="Habilidades Mitológicas" icon="✨">
          <p className="text-[10px] text-slate-500 mb-3">
            Desbloqueadas no Rank A · 1 módulo cada · 1 EN · Habilidade Desperta no Rank S (2 módulos).
          </p>

          {rankIdx < RANK_ORDER_MAP["A"] ? (
            <p className="text-xs text-slate-600 text-center py-3">Disponível a partir do Rank A.</p>
          ) : (
            <div className="space-y-3">
              {regularAbilities.map(ab => (
                <ZoanAbilityEditor
                  key={ab.id}
                  ability={ab}
                  maxModules={1}
                  isMythical={zoan.isMythical}
                  onUpdate={patch => updateAbility(ab.id, patch)}
                  onRemove={() => removeAbility(ab.id)}
                  onAddModule={moduleId => addModule(ab.id, moduleId)}
                  onRemoveModule={idx => removeModule(ab.id, idx)}
                />
              ))}
              {canAddRegular && (
                <button
                  onClick={() => addAbility(false)}
                  className="w-full py-2 rounded-lg border border-dashed border-slate-700 text-[10px] text-slate-500 hover:border-amber-700 hover:text-amber-500 transition-colors"
                >
                  + Adicionar Habilidade ({2 - regularAbilities.length} restante{regularAbilities.length < 1 ? "s" : ""})
                </button>
              )}
            </div>
          )}

          {/* Habilidade Desperta */}
          {rankIdx >= RANK_ORDER_MAP["S"] && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-[10px] uppercase tracking-wider text-amber-600/70 mb-2">Habilidade Desperta</p>
              {awakenedAbility ? (
                <ZoanAbilityEditor
                  ability={awakenedAbility}
                  maxModules={2}
                  isMythical={zoan.isMythical}
                  isAwakened
                  onUpdate={patch => updateAbility(awakenedAbility.id, patch)}
                  onRemove={() => removeAbility(awakenedAbility.id)}
                  onAddModule={moduleId => addModule(awakenedAbility.id, moduleId)}
                  onRemoveModule={idx => removeModule(awakenedAbility.id, idx)}
                />
              ) : canAddAwakened ? (
                <button
                  onClick={() => addAbility(true)}
                  className="w-full py-2 rounded-lg border border-dashed border-amber-800/50 text-[10px] text-amber-600/70 hover:border-amber-600 hover:text-amber-400 transition-colors"
                >
                  + Adicionar Habilidade Desperta (2 módulos)
                </button>
              ) : null}
            </div>
          )}
        </SectionCard>
      )}
    </>
  );
}

export function ZoanAbilityEditor({
  ability, maxModules, isMythical, isAwakened,
  onUpdate, onRemove, onAddModule, onRemoveModule,
}: {
  ability: ZoanAbility;
  maxModules: number;
  isMythical: boolean;
  isAwakened?: boolean;
  onUpdate: (patch: Partial<ZoanAbility>) => void;
  onRemove: () => void;
  onAddModule: (moduleId: string) => void;
  onRemoveModule: (idx: number) => void;
}) {
  const usedSlots = ability.modules.length;
  const modules = ZOAN_MODULES;

  return (
    <div className={`p-3 rounded-lg border ${isAwakened ? "border-amber-800/50 bg-amber-950/10" : "border-slate-700 bg-slate-800"}`}>
      <div className="flex items-start justify-between mb-2">
        <input
          className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none border-b border-transparent focus:border-amber-600 flex-1"
          value={ability.name}
          placeholder="Nome da habilidade"
          onChange={e => onUpdate({ name: e.target.value })}
        />
        <button onClick={onRemove} className="text-slate-600 hover:text-red-400 text-xs ml-2">✕</button>
      </div>

      <input
        className="w-full bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-amber-600 mb-2"
        placeholder="Descrição..."
        value={ability.description}
        onChange={e => onUpdate({ description: e.target.value })}
      />

      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-slate-500">EN:</span>
          <input
            type="number"
            min={0} max={10}
            className="w-10 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-[10px] text-center text-slate-200 focus:outline-none"
            value={ability.energyCost}
            onChange={e => onUpdate({ energyCost: Number(e.target.value) })}
          />
        </div>
        {!isAwakened && (
          <input
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded px-2 py-0.5 text-[10px] text-slate-400 focus:outline-none focus:border-amber-600"
            placeholder="Condição (opcional)"
            value={ability.condition ?? ""}
            onChange={e => onUpdate({ condition: e.target.value })}
          />
        )}
        {isAwakened && (
          <span className="text-[9px] text-amber-500/70 italic">Condição: forma desperta ativa</span>
        )}
      </div>

      {/* Módulos */}
      <div className="flex flex-wrap gap-1 mb-2">
        {ability.modules.map((modId, idx) => {
          const m = modules.find(m => m.id === modId);
          return m ? (
            <ModuleBadge key={idx} module={m} onRemove={() => onRemoveModule(idx)} />
          ) : null;
        })}
      </div>

      {usedSlots < maxModules && (
        <ModulePicker
          modules={modules}
          usedSlots={usedSlots}
          maxSlots={maxModules}
          onAdd={onAddModule}
          isMythical={isMythical}
        />
      )}
    </div>
  );
}
