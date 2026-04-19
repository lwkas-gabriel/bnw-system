import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacterStore } from "../features/character/store/characterStore";
import { importFromFile, importFromClipboard, type ImportResult } from "../features/character/utils/importer";
import { downloadCharacterJSON, exportToJSONString, exportToForumHTML, copyToClipboard } from "../features/character/utils/exporter";
import { PageHeader, Button } from "../shared/components";
import { ValidationPanel } from "../features/character/components/ValidationPanel";

type DragState = "idle" | "over" | "loading";

export default function ImportPage() {
  const navigate = useNavigate();
  const { saved } = useCharacterStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [drag, setDrag]         = useState<DragState>("idle");
  const [result, setResult]     = useState<ImportResult | null>(null);
  const [imported, setImported] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setDrag("loading");
    setResult(null);
    const r = await importFromFile(file);
    setResult(r);
    setDrag("idle");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }, [processFile]);

  const handleClipboard = useCallback(async () => {
    setDrag("loading");
    const r = await importFromClipboard();
    setResult(r);
    setDrag("idle");
  }, []);

  function handleImport() {
    if (!result?.character) return;
    // Save the character and navigate to edit
    useCharacterStore.setState(state => ({
      draft: result.character,
      saved: state.saved.some(c => c.id === result.character!.id)
        ? state.saved
        : [...state.saved, result.character!],
    }));
    setImported(true);
  }

  function handleGoEdit() {
    if (!result?.character) return;
    navigate(`/characters/${result.character.id}`);
  }

  const statusConfig = {
    success: {
      bg: "bg-green-950/30", border: "border-green-800/40",
      icon: "✓", text: "Importação bem-sucedida!", color: "text-green-400",
    },
    success_with_warnings: {
      bg: "bg-amber-950/20", border: "border-amber-800/40",
      icon: "!", text: "Importado com avisos — verifique abaixo.", color: "text-amber-400",
    },
    error: {
      bg: "bg-red-950/30", border: "border-red-800/50",
      icon: "✕", text: "Falha na importação.", color: "text-red-400",
    },
  };

  return (
    <div>
      <PageHeader
        title="Importar / Exportar Fichas"
        subtitle="Importe fichas em JSON e valide contra as regras do sistema"
      />

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDrag("over"); }}
          onDragLeave={() => setDrag("idle")}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-150
            ${drag === "over"    ? "border-amber-500 bg-amber-950/20" : ""}
            ${drag === "idle"    ? "border-slate-700 hover:border-slate-500 hover:bg-slate-800/30" : ""}
            ${drag === "loading" ? "border-slate-700 bg-slate-900/50 cursor-wait" : ""}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".json,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          {drag === "loading" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Validando ficha...</p>
            </div>
          ) : (
            <>
              <span className="text-4xl mb-4 block opacity-40">📂</span>
              <p className="text-sm font-medium text-slate-300 mb-1">Arraste um arquivo .json ou .txt (ficha de fórum) aqui</p>
              <p className="text-xs text-slate-500">ou clique para selecionar</p>
            </>
          )}
        </div>

        {/* Clipboard import */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-600">ou</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <Button variant="ghost" className="w-full" onClick={handleClipboard}>
          📋 Importar da área de transferência (JSON copiado)
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Status banner */}
            {(() => {
              const s = statusConfig[result.status];
              return (
                <div className={`${s.bg} ${s.border} border rounded-xl p-4 flex items-center gap-3`}>
                  <span className={`text-xl ${s.color}`}>{s.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${s.color}`}>{s.text}</p>
                    {result.character && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {result.character.name} — Nível {result.character.level}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Parse errors */}
            {result.parseErrors.length > 0 && (
              <div className="card space-y-1">
                <p className="text-xs font-semibold text-slate-400 mb-2">Erros de leitura</p>
                {result.parseErrors.map((e, i) => (
                  <p key={i} className="text-xs text-red-400 font-mono">{e}</p>
                ))}
              </div>
            )}

            {/* Validation report */}
            {result.validation && (
              <div className="card">
                <p className="text-xs font-semibold text-slate-400 mb-3">Validação de regras</p>
                <ValidationPanel report={result.validation} />
              </div>
            )}

            {/* Actions */}
            {result.character && (
              <div className="flex gap-3">
                {!imported ? (
                  <>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleImport}
                    >
                      ✓ Importar ficha
                    </Button>
                    {result.status !== "success" && (
                      <Button
                        variant="amber"
                        className="flex-1"
                        onClick={handleImport}
                      >
                        ⚠️ Importar mesmo assim
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex-1 flex items-center gap-2 p-3 bg-green-950/30 border border-green-800/40 rounded-xl">
                      <span className="text-green-400">✓</span>
                      <p className="text-xs text-green-400 font-medium">Ficha salva com sucesso!</p>
                    </div>
                    <Button variant="primary" onClick={handleGoEdit}>
                      Editar ficha →
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Saved chars warning */}
            {result.character && saved.some(c => c.id === result.character!.id) && !imported && (
              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl">
                <p className="text-xs text-amber-400">
                  ⚠️ Uma ficha com o mesmo ID já existe. Importar irá sobrescrever a versão salva.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Export section */}
        <div className="card mt-6">
          <p className="text-xs font-semibold text-slate-400 mb-3">Exportar fichas salvas</p>
          {saved.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-4">Nenhuma ficha salva para exportar.</p>
          ) : (
            <div className="space-y-2">
              {saved.map(char => (
                <ExportRow key={char.id} char={char} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Export row ───────────────────────────────────────────────────────────────

function ExportRow({ char }: { char: import("../shared/types/character").Character }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyJSON() {
    await copyToClipboard(exportToJSONString(char));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
      <div>
        <p className="text-sm font-medium text-slate-200">{char.name}</p>
        <p className="text-xs text-slate-500">Nível {char.level}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => downloadCharacterJSON(char)}>
          ⬇ JSON
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCopyJSON}>
          {copied ? "✓ Copiado!" : "📋 Copiar JSON"}
        </Button>
        <Button
          size="sm"
          variant="amber"
          onClick={async () => {
            await copyToClipboard(exportToForumHTML(char));
          }}
        >
          📜 Ficha Fórum (dohtml)
        </Button>
      </div>
    </div>
  );
}
