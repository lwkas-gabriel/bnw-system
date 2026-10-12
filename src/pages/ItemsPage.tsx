import { useState } from "react";
import { PageHeader, SectionCard, Badge } from "../shared/components";
import { BUGIGANGAS } from "../data/bugigangas";
import { UNIQUE_WEAPONS } from "../data/uniqueWeapons";
import type { BugigangaEffect } from "../data/bugigangas";
import type { EquipmentQuality } from "../shared/types/character";
import { EQUIPMENT_PRICES, QUALITY_LABELS } from "../data/equipment";
import { STANDARD_CRAFT_DC } from "../data/professions";

// ─── Labels ───────────────────────────────────────────────────────────────────

const EFFECT_LABELS: Record<BugigangaEffect, string> = {
  pericia_bonus: "Bônus de Perícia",
  interpretive:  "Efeito Interpretativo",
};

const QUALITY_COLORS: Record<EquipmentQuality, string> = {
  common:    "text-slate-400",
  splendid:  "text-sky-400",
  legendary: "text-amber-400",
};

const SLOT_INFO = [
  { slot: "weapon", label: "Arma",      attrs: "PRE ou POD" },
  { slot: "head",   label: "Cabeça",    attrs: "PRE ou CON" },
  { slot: "arms",   label: "Braços",    attrs: "PRE ou DEF" },
  { slot: "torso",  label: "Torso",     attrs: "CON ou DEF" },
  { slot: "legs",   label: "Pernas",    attrs: "PRE ou DEF" },
];

// ─── Consumíveis data ─────────────────────────────────────────────────────────

const CONSUMIVEIS = [
  {
    category: "Pomada",
    icon:     "💊",
    craftor:  "Médico",
    skill:    "Erudição",
    effect:   "Cura CON",
    items: [
      { quality: "common",    label: "Comum",      bonus: "+1 CON",      price: 50_000    },
      { quality: "splendid",  label: "Esplêndido", bonus: "+2 CON",      price: 500_000   },
      { quality: "legendary", label: "Lendário",   bonus: "+3 CON",      price: 1_000_000 },
    ],
  },
  {
    category: "Lanche",
    icon:     "🍖",
    craftor:  "Cozinheiro",
    skill:    "Expressão",
    effect:   "Restaura EN",
    items: [
      { quality: "common",    label: "Comum",      bonus: "+3 EN",       price: 50_000    },
      { quality: "splendid",  label: "Esplêndido", bonus: "+6 EN",       price: 500_000   },
      { quality: "legendary", label: "Lendário",   bonus: "+9 EN",       price: 1_000_000 },
    ],
  },
  {
    category: "Banquete",
    icon:     "🍽️",
    craftor:  "Cozinheiro",
    skill:    "Expressão",
    effect:   "CON temporária (descontada primeiro; some ao dormir ou ao fim do tópico)",
    items: [
      { quality: "common",    label: "Comum",      bonus: "+1 CON temp", price: 500_000   },
      { quality: "splendid",  label: "Esplêndido", bonus: "+2 CON temp", price: 2_500_000 },
      { quality: "legendary", label: "Lendário",   bonus: "+3 CON temp", price: 5_000_000 },
    ],
  },
] as const;

const CONSUMIVEIS_ITEM_COUNT = CONSUMIVEIS.reduce((n, c) => n + c.items.length, 0);

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "bugigangas" | "armas_unicas" | "consumiveis";

const uniqueWeaponList = Object.values(UNIQUE_WEAPONS).sort((a, b) => a.name.localeCompare(b.name));

export default function ItemsPage() {
  const [tab, setTab] = useState<Tab>("bugigangas");
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
        title="Catálogo de Craft"
        subtitle="Bugigangas, consumíveis, armas únicas e regras de fabricação por profissão"
      />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 space-y-6">

        {/* Slot & Price Table */}
        <SectionCard title="Slots de Equipamento" icon="⚔️">
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Cada personagem possui 3 slots: <span className="text-slate-300">1 arma</span> + <span className="text-slate-300">2 peças defensivas</span>.
              Qualidade Esplêndida = +1 atributo; Lendária = +2. <span className="text-amber-400/80">Sem custo em gemas.</span>
            </p>

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
                    const prices = EQUIPMENT_PRICES[isWeapon ? "weapon" : "defensive"];
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
            {[
              { name: "Ferreiro",    skill: "Destreza",  crafts: "Armas e peças defensivas." },
              { name: "Engenheiro",  skill: "Lógica",    crafts: "Bugigangas e embarcações (30% desconto)." },
              { name: "Cozinheiro",  skill: "Expressão", crafts: "Lanches (+EN) e banquetes (+CON temporária)." },
              { name: "Médico",      skill: "Erudição",  crafts: "Pomadas (+CON)." },
            ].map(p => (
              <div key={p.name} className="space-y-1.5">
                <p className="font-medium text-slate-300">{p.name}</p>
                <p>Perícia: <span className="text-amber-400">{p.skill}</span></p>
                <p>{p.crafts}</p>
                <div className="grid grid-cols-3 gap-1 mt-2">
                  {(Object.keys(STANDARD_CRAFT_DC) as EquipmentQuality[]).map(q => ({ l: QUALITY_LABELS[q], dc: STANDARD_CRAFT_DC[q] })).map(t => (
                    <div key={t.l} className="bg-slate-800 rounded p-1.5 text-center">
                      <p className="text-[10px] text-slate-500">{t.l}</p>
                      <p className="font-mono font-bold text-amber-400">DC {t.dc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-3">
            Teste de Craft: 3d6 + (graduação da perícia × 3) · 2 slots por aventura · em falha o slot não é perdido.
          </p>
        </SectionCard>

        {/* Catalog tabs */}
        <div>
          {/* Tab bar */}
          <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-none">
            {([
              { id: "bugigangas",   label: "Bugigangas",   count: BUGIGANGAS.length },
              { id: "consumiveis",  label: "Consumíveis",  count: CONSUMIVEIS_ITEM_COUNT },
              { id: "armas_unicas", label: "Armas Únicas", count: uniqueWeaponList.length },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-t-lg text-xs font-medium transition-colors ${
                  tab === t.id
                    ? "bg-amber-900/30 border border-b-transparent border-amber-800/50 text-amber-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t.label}
                <span className="ml-1.5 text-[9px] opacity-60">{t.count}</span>
              </button>
            ))}
          </div>

          {/* Bugigangas tab */}
          {tab === "bugigangas" && (
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
          )}

          {/* Consumíveis tab */}
          {tab === "consumiveis" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Limite em combate: <span className="text-slate-300">3 consumíveis totais</span> por personagem (qualquer combinação).
              </p>
              {CONSUMIVEIS.map(c => (
                <SectionCard key={c.category} title={c.category} icon={c.icon}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] text-slate-500">Criado por</span>
                    <span className="text-xs font-medium text-amber-400">{c.craftor}</span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500">Perícia:</span>
                    <span className="text-[10px] font-medium text-slate-300">{c.skill}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-3">{c.effect}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {c.items.map(item => (
                      <div key={item.quality} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/40">
                        <p className={`text-[10px] font-semibold mb-1 ${QUALITY_COLORS[item.quality]}`}>
                          {item.label}
                        </p>
                        <p className="text-sm font-bold text-slate-200 mb-2">{item.bonus}</p>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-slate-500">
                            Mercado: <span className="font-mono text-slate-400">₿{item.price.toLocaleString("pt-BR")}</span>
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Custo: <span className="font-mono text-slate-400">₿{(item.price / 2).toLocaleString("pt-BR")}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ))}
            </div>
          )}

          {/* Armas Únicas tab */}
          {tab === "armas_unicas" && (
            <SectionCard
              title="Armas Únicas"
              icon="⚔️"
              action={<Badge variant="amber">{uniqueWeaponList.length} armas · 20g cada</Badge>}
            >
              <p className="text-xs text-slate-500 mb-4">
                Todas as Armas Únicas custam <span className="text-amber-400">20g</span>. Cada uma possui uma mecânica exclusiva de combate.
                Podem ser obtidas no Character Builder na aba Equipamentos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {uniqueWeaponList.map(w => {
                  const activeFlags = Object.entries(w.mechanics)
                    .filter(([, v]) => v === true)
                    .map(([k]) => k);
                  return (
                    <div
                      key={w.id}
                      className="p-3 bg-slate-800/60 rounded-lg border border-amber-800/30 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-200">{w.name}</p>
                        <span className="text-[10px] font-mono text-amber-500 shrink-0">20g</span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">{w.origin}</p>
                      <p className="text-[10px] text-amber-300/80">{w.effect}</p>
                      {activeFlags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {activeFlags.map(flag => (
                            <span
                              key={flag}
                              className="inline-block px-1.5 py-0.5 bg-amber-900/30 border border-amber-800/40 rounded text-[9px] text-amber-500/80"
                            >
                              {flag.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
