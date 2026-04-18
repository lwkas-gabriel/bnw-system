import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCharacterStore } from "../features/character/store/characterStore";
import { GemBudgetBar, Button, Tabs, Input } from "../shared/components";
import { AttributesSection } from "../features/character/components/AttributesSection";
import { HakiSection } from "../features/character/components/HakiSection";
import { AkumaSection } from "../features/character/components/AkumaSection";
import { ArtesMarciaisSection } from "../features/character/components/ArtesMarcaisSection";
import { TechniquesSection } from "../features/character/components/TechniquesSection";
import { PericiasSection } from "../features/character/components/PericiasSection";
import { ProfissoesSection } from "../features/character/components/ProfissoesSection";
import { EquipmentSection } from "../features/character/components/EquipmentSection";

const TABS = [
  { id: "attributes",    label: "Atributos",    icon: "📊" },
  { id: "pericias",      label: "Perícias",     icon: "🧠" },
  { id: "haki",          label: "Haki",         icon: "🌊" },
  { id: "akuma",         label: "Akuma no Mi",  icon: "🍎" },
  { id: "artes",         label: "Artes Marciais", icon: "🥋" },
  { id: "techniques",   label: "Técnicas",     icon: "⚡" },
  { id: "profissoes",   label: "Profissões",   icon: "📜" },
  { id: "equipment",    label: "Equipamentos", icon: "🛡️" },
];

export default function CharacterBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { draft, budget, newCharacter, loadCharacter, saveDraft, updateDraft } = useCharacterStore();
  const [activeTab, setActiveTab] = useState("attributes");
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (id && id !== "new") {
      loadCharacter(id);
    } else if (!id || id === "new") {
      if (!draft) setShowNameModal(true);
    }
  }, [id]);

  function handleCreate() {
    if (!nameInput.trim()) return;
    newCharacter(nameInput.trim(), 20);
    setShowNameModal(false);
  }

  function handleSave() {
    saveDraft();
    navigate("/characters");
  }

  if (showNameModal) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="card w-96">
          <h2 className="text-base font-bold text-slate-200 mb-4">Novo Personagem</h2>
          <Input
            label="Nome do personagem"
            placeholder="Ex: Dogmeat"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" onClick={() => navigate("/characters")} className="flex-1">
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreate} className="flex-1" disabled={!nameInput.trim()}>
              Criar
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
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <input
                className="bg-transparent text-lg font-bold text-slate-100 focus:outline-none border-b border-transparent focus:border-amber-600 transition-colors placeholder:text-slate-600"
                value={draft.name}
                placeholder="Nome do personagem"
                onChange={e => updateDraft(c => { c.name = e.target.value; })}
              />
              <div className="flex items-center gap-2">
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
              <select
                value={draft.location}
                onChange={e => updateDraft(c => { c.location = e.target.value as typeof draft.location; })}
                className="bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 px-2 py-1 focus:outline-none focus:border-amber-600"
              >
                <option value="blues">Blues</option>
                <option value="grand_line">Grand Line</option>
                <option value="new_world">New World</option>
              </select>
            </div>
            {budget && <GemBudgetBar spent={budget.spent} total={budget.total} />}
          </div>
          <div className="flex gap-2">
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
      </div>
    </div>
  );
}
