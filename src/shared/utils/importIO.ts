/** Tamanho máximo aceito em imports (arquivo ou área de transferência) */
export const MAX_IMPORT_SIZE = 512 * 1024; // 512 KB

const ACCEPTED_EXTENSIONS = [".json", ".txt"];

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsText(file);
  });
}

/** Valida tamanho e extensão do arquivo. Retorna a mensagem de erro, ou null se válido. */
export function validateImportFile(file: File): string | null {
  if (file.size > MAX_IMPORT_SIZE) {
    return `Arquivo muito grande (${Math.round(file.size / 1024)} KB). Máximo: ${MAX_IMPORT_SIZE / 1024} KB.`;
  }
  if (!ACCEPTED_EXTENSIONS.some(ext => file.name.endsWith(ext))) {
    return "Formato de arquivo inválido. Apenas arquivos .json ou .txt são aceitos.";
  }
  return null;
}

export type ClipboardReadResult = { ok: true; text: string } | { ok: false; error: string };

/** Lê a área de transferência, rejeitando conteúdo vazio ou grande demais */
export async function readClipboardText(): Promise<ClipboardReadResult> {
  let text: string;
  try {
    text = await navigator.clipboard.readText();
  } catch {
    return { ok: false, error: "Sem acesso à área de transferência. Use o upload de arquivo." };
  }
  if (!text.trim()) return { ok: false, error: "Área de transferência vazia." };
  if (text.length > MAX_IMPORT_SIZE) {
    return { ok: false, error: `Conteúdo muito grande. Máximo: ${MAX_IMPORT_SIZE / 1024} KB.` };
  }
  return { ok: true, text };
}

/** Primeiro grupo capturado de `pattern` em `text` (sem espaços nas pontas), ou null */
export function regexCapture(text: string, pattern: RegExp): string | null {
  return text.match(pattern)?.[1]?.trim() ?? null;
}
