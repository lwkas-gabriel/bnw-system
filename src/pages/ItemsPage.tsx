import { useState } from "react";
import { PageHeader, SectionCard, Badge } from "../shared/components";
import { BUGIGANGAS } from "../data/bugigangas";
import type { BugigangaEffect } from "../data/bugigangas";
import type { EquipmentQuality } from "../shared/types/character";

// ─── Labels ───────────────────────────────────────────────────────────────────

const QUALITY_LABELS: Record<EquipmentQuality, string> = {
  common:    "Comum",
  splendid:  "Esplêndido",
  legendary: "Lendário",
};

const EFFECT_LABELS: Record<BugigangaEffect, string> = {
  pericia_bonus: "Bônus de Perícia",
  interpretive:  "Efeito Interpretativo",
};

const QUALITY_COLORS: Record<EquipmentQuality, string> = {
  common:    "text-slate-400",
  splendid:  "text-sky-400",
  legendary: "text-amber-400",
};

const WEAPON_PRICES: Record<EquipmentQuality, number> = {
  common: 500_000, splendid: 10_000_000, legendary: 80_000_000,
};

const DEFENSIVE_PRICES: Record<EquipmentQuality, number> = {
  common: 500_000, splendid: 5_000_000, legendary: 40_000_000,
};

const SLOT_INFO = [
  { slot: "weapon", label: "Arma",      attrs: "PRE ou POD" },
  { slot: "head",   label: "Cabeça",    attrs: "PRE ou CON" },
  { slot: "arms",   label: "Braços",    attrs: "PRE ou DEF" },
  { slot: "torso",  label: "Torso",     attrs: "CON ou DEF" },
  { slot: "legs",   label: "Pernas",    attrs: "PRE ou DEF" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ItemsPage() {
  const [effectFilter, setEffectFilter] = useState<BugigangaEffect | "all">("all");
  const [qualityFilter, setQualityFilter] = useState<EquipmentQuality | "all">("all");

  const filtered = BUGIGANGAS.filter(b => {
    if (effectFilter !== "all" && b.effect !== effectFilter) return false;
    if (qualityFilter !== "all" && b.quality !== qualityFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Itens & Equipamentos"
        subtitle="Catálogo de bugigangas, preços e regras de slot"
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        {/* Slot & Price Table */}
        <SectionCard title="Slots de Equipamento" icon="⚔️">
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Cada personagem possui 3 slots: <span className="text-slate-300">1 arma</span> + <span className="text-slate-300">2 peças defensivas</span>.
              Qualidade Esplêndida = +1 atributo; Lendária = +2. <span className="text-amber-400/80">Sem custo em gemas.</span>
            </p>

            {/* Slot → Attrs table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 pr-4 text-slate-500 font-medium uppercase tracking-widest text-[10px]">Slot</th>
                    <th className="text-left py-2 pr-4 text-slate-500 font-medium uppercase tracking-widest text-[10px]">Atributo</th>
                    <th className="text-right py-2 pr-4 text-slate-500 font-medium uppercase tracking-widest text-[10px]">Comum</th>
                    <th className="text-right py-2 pr-4 text-slate-500 font-medium uppercase tracking-widest text-[10px]">Esplêndido</th>
                    <th className="text-right py-2 text-slate-500 font-medium uppercase tracking-widest text-[10px]">Lendário</th>
                  </tr>
                </thead>
                <tbody>
                  {SLOT_INFO.map((s, i) => {
                    const isWeapon = s.slot === "weapon";
                    const prices = isWeapon ? WEAPON_PRICES : DEFENSIVE_PRICES;
                    return (
                      <tr key={s.slot} className={i % 2 === 0 ? "bg-slate-800/30" : ""}>
                        <td className="py-2 pr-4 text-slate-300 font-medium">{s.label}</td>
                        <td className="py-2 pr-4 text-slate-500">{s.attrs}</td>
                        <td className="py-2 pr-4 text-right font-mono text-slate-400">₿{(prices.common / 1000).toFixed(0)}k</td>
                        <td className="py-2 pr-4 text-right font-mono text-sky-400">₿{(prices.splendid / 1_000_000).toFixed(0)}M</td>
                        <td className="py-2 text-right font-mono text-amber-400">₿{(prices.legendary / 1_000_000).toFixed(0)}M</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>

        {/* Craft rules */}
        <SectionCard title="Regras de Craft" icon="🔨">
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
            <div className="space-y-1.5">
              <p className="font-medium text-slate-300">Ferreiro</p>
              <p>Perícia: <span className="text-amber-400">Destreza</span></p>
              <p>Cria armas e peças defensivas.</p>
              <div className="grid grid-cols-3 gap-1 mt-2">
                {[{l:"Comum", dc:9},{l:"Esplêndido",dc:18},{l:"Lendário",dc:27}].map(t => (
                  <div key={t.l} className="bg-slate-800 rounded p-1.5 text-center">
                    <p className="text-[10px] text-slate-500">{t.l}</p>
                    <p className="font-mono font-bold text-amber-400">DC {t.dc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-slate-300">Engenheiro</p>
              <p>Perícia: <span className="text-amber-400">Lógica</span></p>
              <p>Cria bugigangas e embarcações (30% desconto).</p>
              <div className="grid grid-cols-3 gap-1 mt-2">
                {[{l:"Comum", dc:9},{l:"Esplêndido",dc:18},{l:"Lendário",dc:27}].map(t => (
                  <div key={t.l} className="bg-slate-800 rounded p-1.5 text-center">
                    <p className="text-[10px] text-slate-500">{t.l}</p>
                    <p className="font-mono font-bold text-amber-400">DC {t.dc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 mt-3">
            Teste de Craft: 3d6 + (graduação da perícia × 3) · 2 slots por aventura.
          </p>
        </SectionCard>

        {/* Bugigangas catalog */}
        <SectionCard
          title="Catálogo de Bugigangas"
          icon="🔧"
          action={<Badge variant="amber">{filtered.length} itens</Badge>}
        >
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex gap-1">
              {(["all", "pericia_bonus", "interpretive"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setEffectFilter(f)}
                  className={`px-2 py-1 rounded text-[10px] transition-colors ${
                    effectFilter === f
                      ? "bg-amber-600 text-white"
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  }`}
                >
                  {f === "all" ? "Todos" : EFFECT_LABELS[f]}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {(["all", "common", "splendid", "legendary"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setQualityFilter(f)}
                  className={`px-2 py-1 rounded text-[10px] transition-colors ${
                    qualityFilter === f
                      ? "bg-amber-600 text-white"
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  }`}
                >
                  {f === "all" ? "Todas qualidades" : QUALITY_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-2">
            {filtered.map(b => (
              <div
                key={b.id}
                className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-200">{b.name}</span>
                    <span className={`text-[10px] font-medium ${QUALITY_COLORS[b.quality]}`}>
                      {QUALITY_LABELS[b.quality]}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded-full">
                      {EFFECT_LABELS[b.effect]}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{b.description}</p>
                  {b.periciaBonus && (
                    <p className="text-[10px] text-green-400 mt-0.5">
                      +{b.periciaBonus.value} {b.periciaBonus.pericia}
                    </p>
                  )}
                  {b.interpretive && (
                    <p className="text-[10px] text-sky-400/80 mt-0.5">{b.interpretive}</p>
                  )}
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-[10px] font-mono text-slate-400">
                    ₿{b.price.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {b.ciborgueShifts} shift{b.ciborgueShifts > 1 ? "s" : ""} ciborgue
                  </p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-6">Nenhum item com esses filtros.</p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
