/** Nome de arquivo a partir de um nome livre: "Roronoa Zoro" → "roronoa_zoro" */
export function slugify(name: string): string {
  return name.replace(/\s+/g, "_").toLowerCase();
}

/** Dispara o download de um texto como arquivo no navegador */
export function downloadText(content: string, filename: string, mime = "text/plain;charset=utf-8"): void {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
