import { SectionCard, SegmentedControl } from "../../../../shared/components";
import type { LogiaAkuma } from "../../../../shared/types/character";
import { ATTR_KEYS, ATTR_SHORT_LABELS } from "../../../../data/attributes";

// ─── Logia sub-component ──────────────────────────────────────────────────────

export function LogiaConfig({ logia, onUpdate }: { logia: LogiaAkuma; onUpdate: (fn: (l: LogiaAkuma) => void) => void }) {
  return (
    <SectionCard title="Configuração Logia" icon="⚡">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Natureza Elemental (+5 ao atributo)</p>
      <SegmentedControl
        className="flex gap-2 mb-4"
        buttonClassName="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase"
        options={ATTR_KEYS.map(a => ({ value: a, label: ATTR_SHORT_LABELS[a] }))}
        value={logia.elementalNatureAttr}
        onChange={a => onUpdate(l => { l.elementalNatureAttr = a; })}
      />

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 bg-slate-800 rounded-lg text-center">
          <p className="text-[10px] text-slate-500">Intangibilidade</p>
          <p className="text-xs font-bold text-blue-400">+4 DEF +4 CON</p>
        </div>
        <div className="p-2 bg-slate-800 rounded-lg text-center">
          <p className="text-[10px] text-slate-500">Área grátis</p>
          <p className="text-xs font-bold text-green-400">técnicas ofensivas</p>
        </div>
        <div className="p-2 bg-slate-800 rounded-lg text-center">
          <p className="text-[10px] text-slate-500">Elementalista</p>
          <p className="text-xs font-bold text-amber-400">1 EN/uso</p>
        </div>
      </div>

      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Status Aprimorado</p>
      <div className="space-y-2">
        <input
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600"
          placeholder="Nome do status (ex: Queimadura, Cegueira...)"
          value={logia.statusEnhanced?.name ?? ""}
          onChange={e => onUpdate(l => { l.statusEnhanced.name = e.target.value; })}
        />
        <input
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-amber-600"
          placeholder="Descrição do efeito..."
          value={logia.statusEnhanced?.description ?? ""}
          onChange={e => onUpdate(l => { l.statusEnhanced.description = e.target.value; })}
        />
        <p className="text-[10px] text-slate-600">
          Combine 2 efeitos aderidos ou dobre 1 (Vulnerabilidade, Confusão, Fraqueza, Fragilidade, Exaustão, Ferimento).
        </p>
      </div>
    </SectionCard>
  );
}
