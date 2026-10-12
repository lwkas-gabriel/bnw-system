import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacterStore } from "../features/character/store/characterStore";
import { useShipStore } from "../features/ships/store/shipStore";
import { importFromFile, importFromClipboard } from "../features/character/utils/importer";
import { downloadCharacterJSON, exportToJSONString, downloadCharacterForumHTML } from "../features/character/utils/exporter";
import { importShipFromFile, importShipFromClipboard } from "../features/ships/utils/shipImporter";
import { downloadShipJSON, exportShipToJSONString, downloadShipForumHTML } from "../features/ships/utils/shipExporter";
import {
  PageHeader, Button, Callout, EmptyState, ExportActions, FileDropZone, ImportStatusBanner, MessageList, OrDivider,
} from "../shared/components";
import { ValidationPanel } from "../features/character/components/ValidationPanel";
import { useFileImport } from "../shared/hooks/useFileImport";
import type { ImportStatus } from "../shared/types/io";

export default function ImportPage() {
  return (
    <div>
      <PageHeader
        title="Importar / Exportar Fichas"
        subtitle="Importe fichas em JSON e valide contra as regras do sistema"
      />

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        <CharacterImportSection />

        <div className="mt-10">
          <h2 className="text-base font-semibold text-slate-300 mb-4">⛵ Embarcações</h2>
          <ShipImportSection />
        </div>
      </div>
    </div>
  );
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

interface ImportActionsProps {
  status: ImportStatus;
  imported: boolean;
  importLabel: string;
  onImport: () => void;
  /** Mostrado após importar (mensagem de sucesso e ações seguintes) */
  done: ReactNode;
  /** Já existe um item salvo com o mesmo ID */
  overwrites: boolean;
  overwriteMessage: string;
}

/** Botões de confirmação da importação + aviso de sobrescrita */
function ImportActions({ status, imported, importLabel, onImport, done, overwrites, overwriteMessage }: ImportActionsProps) {
  return (
    <>
      <div className="flex gap-3">
        {imported ? done : (
          <>
            <Button variant="primary" className="flex-1" onClick={onImport}>{importLabel}</Button>
            {status !== "success" && (
              <Button variant="amber" className="flex-1" onClick={onImport}>⚠️ Importar mesmo assim</Button>
            )}
          </>
        )}
      </div>
      {overwrites && !imported && (
        <Callout className="p-3 rounded-xl">
          <p className="text-xs text-amber-400">⚠️ {overwriteMessage}</p>
        </Callout>
      )}
    </>
  );
}

function SuccessMessage({ children }: { children: ReactNode }) {
  return (
    <Callout tone="green" className="flex-1 flex items-center gap-2 p-3 rounded-xl">
      <span className="text-green-400">✓</span>
      <p className="text-xs text-green-400 font-medium">{children}</p>
    </Callout>
  );
}

function ExportList<T extends { id: string }>({ title, items, emptyMessage, renderRow, className = "mt-2" }: {
  title: string;
  items: T[];
  emptyMessage: string;
  renderRow: (item: T) => ReactNode;
  className?: string;
}) {
  return (
    <div className={`card ${className}`}>
      <p className="text-xs font-semibold text-slate-400 mb-3">{title}</p>
      {items.length === 0
        ? <EmptyState compact title={emptyMessage} />
        : <div className="space-y-2">{items.map(renderRow)}</div>}
    </div>
  );
}

function ExportRow({ title, subtitle, actions }: { title: string; subtitle: string; actions: ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
      <div>
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
}

// ─── Personagens ─────────────────────────────────────────────────────────────

function CharacterImportSection() {
  const navigate = useNavigate();
  const { saved } = useCharacterStore();
  const { loading, result, fromFile, fromClipboard } = useFileImport(importFromFile, importFromClipboard);
  const [imported, setImported] = useState(false);
  const character = result?.character ?? null;

  function handleImport() {
    if (!character) return;
    useCharacterStore.setState(state => ({
      draft: character,
      saved: state.saved.some(c => c.id === character.id) ? state.saved : [...state.saved, character],
    }));
    setImported(true);
  }

  return (
    <>
      <FileDropZone
        icon="📂"
        label="Arraste um arquivo .json ou .txt (ficha de fórum) aqui"
        loadingLabel="Validando ficha..."
        loading={loading}
        onFile={fromFile}
      />
      <OrDivider />
      <Button variant="ghost" className="w-full" onClick={fromClipboard}>
        📋 Importar da área de transferência (JSON copiado)
      </Button>

      {result && (
        <div className="space-y-4">
          <ImportStatusBanner
            status={result.status}
            subtitle={character && `${character.name} — Nível ${character.level}`}
          />
          <MessageList title="Erros de leitura" messages={result.parseErrors} tone="red" />
          {result.validation && (
            <div className="card">
              <p className="text-xs font-semibold text-slate-400 mb-3">Validação de regras</p>
              <ValidationPanel report={result.validation} />
            </div>
          )}
          {character && (
            <ImportActions
              status={result.status}
              imported={imported}
              importLabel="✓ Importar ficha"
              onImport={handleImport}
              overwrites={saved.some(c => c.id === character.id)}
              overwriteMessage="Uma ficha com o mesmo ID já existe. Importar irá sobrescrever a versão salva."
              done={
                <>
                  <SuccessMessage>Ficha salva com sucesso!</SuccessMessage>
                  <Button variant="primary" onClick={() => navigate(`/characters/${character.id}`)}>
                    Editar ficha →
                  </Button>
                </>
              }
            />
          )}
        </div>
      )}

      <ExportList
        title="Exportar fichas salvas"
        className="mt-6"
        items={saved}
        emptyMessage="Nenhuma ficha salva para exportar."
        renderRow={char => (
          <ExportRow
            key={char.id}
            title={char.name}
            subtitle={`Nível ${char.level}`}
            actions={
              <ExportActions
                onDownloadJSON={() => downloadCharacterJSON(char)}
                getJSON={() => exportToJSONString(char)}
                onDownloadForum={() => downloadCharacterForumHTML(char)}
              />
            }
          />
        )}
      />
    </>
  );
}

// ─── Embarcações ─────────────────────────────────────────────────────────────

function ShipImportSection() {
  const { ships } = useShipStore();
  const { loading, result, fromFile, fromClipboard } = useFileImport(importShipFromFile, importShipFromClipboard);
  const [imported, setImported] = useState(false);
  const ship = result?.ship ?? null;

  function handleImport() {
    if (!ship) return;
    useShipStore.setState(state => ({
      ships: state.ships.some(s => s.id === ship.id) ? state.ships : [...state.ships, ship],
    }));
    setImported(true);
  }

  return (
    <div className="space-y-5">
      <FileDropZone
        icon="⛵"
        label="Arraste um arquivo .json ou .txt (ficha de navio) aqui"
        loadingLabel="Lendo ficha de navio..."
        loading={loading}
        onFile={fromFile}
      />
      <OrDivider />
      <Button variant="ghost" className="w-full" onClick={fromClipboard}>
        📋 Importar da área de transferência (JSON ou dohtml copiado)
      </Button>

      {result && (
        <div className="space-y-4">
          <ImportStatusBanner status={result.status} subtitle={ship && `${ship.name} — ${ship.size}`} />
          <MessageList title="Erros de leitura" messages={result.parseErrors} tone="red" />
          <MessageList title="Avisos" messages={result.warnings} tone="amber" />
          {ship && (
            <ImportActions
              status={result.status}
              imported={imported}
              importLabel="✓ Importar navio"
              onImport={handleImport}
              overwrites={ships.some(s => s.id === ship.id)}
              overwriteMessage="Um navio com o mesmo ID já existe. Importar irá sobrescrever a versão salva."
              done={<SuccessMessage>Navio salvo! Acesse em Embarcações.</SuccessMessage>}
            />
          )}
        </div>
      )}

      <ExportList
        title="Exportar navios salvos"
        items={ships}
        emptyMessage="Nenhum navio salvo para exportar."
        renderRow={s => (
          <ExportRow
            key={s.id}
            title={s.name}
            subtitle={s.size}
            actions={
              <ExportActions
                onDownloadJSON={() => downloadShipJSON(s)}
                getJSON={() => exportShipToJSONString(s)}
                onDownloadForum={() => downloadShipForumHTML(s)}
              />
            }
          />
        )}
      />
    </div>
  );
}
