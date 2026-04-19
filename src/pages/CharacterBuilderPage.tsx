import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCharacterStore } from "../features/character/store/characterStore";
import { GemBudgetBar, Button, Tabs, Input } from "../shared/components";
import { getFactionRank } from "../data/factions";
import { AttributesSection } from "../features/character/components/AttributesSection";
import { HakiSection } from "../features/character/components/HakiSection";
import { AkumaSection } from "../features/character/components/AkumaSection";
import { ArtesMarciaisSection } from "../features/character/components/ArtesMarcaisSection";
import { TechniquesSection } from "../features/character/components/TechniquesSection";
import { PericiasSection } from "../features/character/components/PericiasSection";
import { ProfissoesSection } from "../features/character/components/ProfissoesSection";
import { EquipmentSection } from "../features/character/components/EquipmentSection";
import { FaccoesSection } from "../features/character/components/FaccoesSection";
import { EmbarcacaoSection } from "../features/character/components/EmbarcacaoSection";
import { CyborgSection } from "../features/character/components/CyborgSection";
import { CompanheirosSection } from "../features/character/components/CompanheirosSection";

const BASE_TABS = [
  { id: "attributes",  label: "Atributos",      icon: "📊" },
  { id: "pericias",    label: "Perícias",        icon: "🧠" },
  { id: "haki",        label: "Haki",            icon: "🌊" },
  { id: "akuma",       label: "Akuma no Mi",     icon: "🍎" },
  { id: "artes",       label: "Artes Marciais",  icon: "🥋" },
  { id: "techniques",  label: "Técnicas",        icon: "⚡" },
  { id: "profissoes",  label: "Profissões",      icon: "📜" },
  { id: "equipment",   label: "Equipamentos",    icon: "🛡️" },
  { id: "faccao",      label: "Facção",          icon: "⚑" },
  { id: "ciborgue",    label: "Ciborgue",        icon: "🦾" },
  { id: "companheiros",label: "Companheiros",    icon: "🐾" },
];

export default function CharacterBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { draft, budget, newCharacter, loadCharacter, saveDraft, updateDraft } = useCharacterStore();
  const [activeTab, setActiveTab] = useState("attributes");
  const [showNameModal, setShowNameModal] = useState(false);

  const shipCommission = draft?.faction
    ? getFactionRank(draft.faction.type, draft.faction.rank)?.shipCommission
    : undefined;

  const TABS = useMemo(() => {
    if (!shipCommission) return BASE_TABS;
    return [...BASE_TABS, { id: "embarcacao", label: "Embarcação", icon: "⚓" }];
  }, [shipCommission]);
  const [nameInput, setNameInput] = useState("");
  type CreationMode = "novato" | "custom" | "max";
  const [mode, setMode] = useState<CreationMode>("novato");
  const [levelInput, setLevelInput] = useState(1);
  const [gemsInput, setGemsInput] = useState(20);

  useEffect(() => {
    if (id && id !== "new") {
      loadCharacter(id);
    } else if (!id || id === "new") {
      if (!draft) setShowNameModal(true);
    }
  }, [id]);

  function handleCreate() {
    if (!nameInput.trim()) return;
    const level = mode === "custom" ? Math.min(40, Math.max(1, levelInput)) : 1;
    const gems  = mode === "novato" ? 20 : mode === "max" ? 400 : Math.min(400, Math.max(20, gemsInput));
    newCharacter(nameInput.trim(), gems, level);
    setShowNameModal(false);
  }

  function handleSave() {
    saveDraft();
    navigate("/characters");
  }

  if (showNameModal) {
    const MODES: { id: CreationMode; label: string; icon: string; sub: string }[] = [
      { id: "novato", icon: "⚓", label: "Jogador Novo",   sub: "Nível 1 · 20 gemas" },
      { id: "custom", icon: "⚙️", label: "Personalizado",  sub: "Nível e gemas livres" },
      { id: "max",    icon: "💎", label: "Máximo",          sub: "Nível 1 · 400 gemas" },
    ];

    return (
      <div className="flex items-center justify-center h-full">
        <div className="card w-full max-w-[480px] mx-4">
          <h2 className="text-base font-bold text-slate-200 mb-5">Novo Personagem</h2>

          <Input
            label="Nome do personagem"
            placeholder="Ex: Dogmeat"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            autoFocus
          />

          <p className="text-xs font-semibold text-slate-400 mt-5 mb-2">Modo de criação</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all
                  ${mode === m.id
                    ? "border-amber-500 bg-amber-950/20 text-amber-300"
                    : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500"}
                `}
              >
                <span className="text-xl">{m.icon}</span>
                <span className="text-xs font-semibold">{m.label}</span>
                <span className="text-[10px] opacity-70">{m.sub}</span>
              </button>
            ))}
          </div>

          {mode === "custom" && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nível (1–40)</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={levelInput}
                  onChange={e => setLevelInput(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Gemas (20–400)</label>
                <input
                  type="number"
                  min={20}
                  max={400}
                  value={gemsInput}
                  onChange={e => setGemsInput(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-5">
            <Button variant="ghost" onClick={() => navigate("/characters")} className="flex-1">
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreate} className="flex-1" disabled={!nameInput.trim()}>
              Criar ficha →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!draft) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Builder header */}
      <div className="flex-shrink-0 px-4 lg:px-6 pt-14 lg:pt-4 pb-4 border-b border-slate-800 bg-slate-900/50">
        {/* Info: 2-col grid below 425px, flex row above */}
        <div className="grid grid-cols-2 min-[579px]:flex min-[579px]:flex-wrap min-[579px]:items-center gap-x-4 gap-y-2">
          {/* Name */}
          <input
            className="bg-transparent text-lg font-bold text-slate-100 focus:outline-none border-b border-transparent focus:border-amber-600 transition-colors placeholder:text-slate-600 w-full min-[579px]:w-auto min-w-0 max-w-full"
            value={draft.name}
            placeholder="Nome"
            size={Math.max(6, draft.name.length)}
            onChange={e => updateDraft(c => { c.name = e.target.value; })}
          />
          {/* Level */}
          <div className="flex items-center justify-end min-[579px]:justify-start gap-2 flex-shrink-0">
            <span className="text-xs text-slate-500">Lv.</span>
            <input
              type="number"
              min={1}
              max={40}
              value={draft.level}
              onChange={e => updateDraft(c => { c.level = Math.max(1, Math.min(40, Number(e.target.value))); })}
              className="w-12 bg-slate-800 border border-slate-700 rounded text-center text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-600"
            />
          </div>
          {/* Location */}
          <select
            value={draft.location}
            onChange={e => updateDraft(c => { c.location = e.target.value as typeof draft.location; })}
            className="bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 px-2 py-1 focus:outline-none focus:border-amber-600 w-full min-[579px]:w-auto"
          >
            <option value="blues">Blues</option>
            <option value="grand_line">Grand Line</option>
            <option value="new_world">New World</option>
          </select>
          {/* Gem counter (all non-desktop) / bar (desktop) */}
          {budget && (
            <>
              <span className={`lg:hidden flex justify-end min-[579px]:justify-start flex-shrink-0 text-xs font-mono font-bold ${budget.isOverBudget ? "text-red-400" : "text-amber-400"}`}>
                {budget.spent}<span className="text-slate-500">/{budget.total}g</span>
              </span>
              <div className="hidden lg:block flex-1 min-w-[120px]">
                <GemBudgetBar spent={budget.spent} total={budget.total} />
              </div>
            </>
          )}
          {/* Actions — spans both cols below 425px, pushes right above */}
          <div className="col-span-2 min-[579px]:col-span-1 flex justify-end gap-2 min-[579px]:ml-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate("/characters")}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              💾 Salvar
            </Button>
          </div>
        </div>

        <div className="mt-3">
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === "attributes"  && <AttributesSection />}
        {activeTab === "pericias"    && <PericiasSection />}
        {activeTab === "haki"        && <HakiSection />}
        {activeTab === "akuma"       && <AkumaSection />}
        {activeTab === "artes"       && <ArtesMarciaisSection />}
        {activeTab === "techniques"  && <TechniquesSection />}
        {activeTab === "profissoes"  && <ProfissoesSection />}
        {activeTab === "equipment"   && <EquipmentSection />}
        {activeTab === "faccao"       && <FaccoesSection />}
        {activeTab === "embarcacao"  && <EmbarcacaoSection />}
        {activeTab === "ciborgue"    && <CyborgSection />}
        {activeTab === "companheiros"&& <CompanheirosSection />}
      </div>
    </div>
  );
}
