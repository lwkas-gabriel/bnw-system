import { useState } from "react";
import { ToggleButton } from "../../../../shared/components";
import type { AkumaModuleOption } from "../../../../data/akumaModules";
import { ATTR_KEYS, ATTR_SHORT_LABELS, type AttrKey } from "../../../../data/attributes";

// ─── Small helpers ────────────────────────────────────────────────────────────

export function AttrPicker({ value, color, onChange }: { value: string; color: string; onChange: (a: AttrKey) => void }) {
  return (
    <div className="flex gap-1">
      {ATTR_KEYS.map(a => (
        <ToggleButton
          key={a}
          active={value === a}
          activeClassName={`${color} text-white`}
          onClick={() => onChange(a)}
          className="flex-1 py-1 rounded text-[9px] font-bold"
        >
          {ATTR_SHORT_LABELS[a]}
        </ToggleButton>
      ))}
    </div>
  );
}

// Module badge with remove button
export function ModuleBadge({ module, onRemove }: { module: AkumaModuleOption; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-900/40 border border-amber-800/50 rounded text-[10px] text-amber-300">
      {module.label}
      <button onClick={onRemove} className="text-amber-500 hover:text-red-400 leading-none">×</button>
    </span>
  );
}

// Module picker dropdown
export function ModulePicker({
  modules,
  usedSlots,
  maxSlots,
  onAdd,
  isMythical,
}: {
  modules: AkumaModuleOption[];
  usedSlots: number;
  maxSlots: number;
  onAdd: (moduleId: string) => void;
  isMythical?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const remaining = maxSlots - usedSlots;
  const available = modules.filter(m => {
    if (m.mythicalOnly && !isMythical) return false;
    return m.slots <= remaining;
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={remaining <= 0}
        className="text-[10px] px-2 py-1 rounded border border-dashed border-amber-700/60 text-amber-500 hover:border-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        + Módulo ({remaining} slot{remaining !== 1 ? "s" : ""} livre{remaining !== 1 ? "s" : ""})
      </button>
      {open && (
        <div className="absolute z-10 top-7 left-0 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 max-h-52 overflow-y-auto">
          {available.length === 0 ? (
            <p className="text-[10px] text-slate-500 px-3 py-2">Nenhum módulo disponível para os slots restantes.</p>
          ) : (
            available.map(m => (
              <button
                key={m.id + m.slots}
                onClick={() => { onAdd(m.id); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-200">{m.label}</span>
                  <span className="text-[9px] text-slate-500">{m.slots} slot{m.slots !== 1 ? "s" : ""}</span>
                </div>
                <p className="text-[9px] text-slate-500">{m.description}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
