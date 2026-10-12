import { useCallback, useState } from "react";

/**
 * Estado de uma importação por arquivo ou área de transferência.
 * `importFile`/`importClipboard` são os importers da feature (personagem, navio…).
 */
export function useFileImport<R>(
  importFile: (file: File) => Promise<R>,
  importClipboard: () => Promise<R>,
) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<R | null>(null);

  const run = useCallback(async (load: () => Promise<R>) => {
    setLoading(true);
    setResult(null);
    setResult(await load());
    setLoading(false);
  }, []);

  const fromFile = useCallback((file: File) => run(() => importFile(file)), [run, importFile]);
  const fromClipboard = useCallback(() => run(importClipboard), [run, importClipboard]);

  return { loading, result, fromFile, fromClipboard };
}
