import { useCallback, useEffect, useState } from "react";
import { copyToClipboard } from "../utils/download";

/** Copia texto e expõe `copied` = true por `resetMs` (feedback "Copiado!") */
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), resetMs);
    return () => clearTimeout(timer);
  }, [copied, resetMs]);

  const copy = useCallback(async (text: string) => {
    await copyToClipboard(text);
    setCopied(true);
  }, []);

  return { copied, copy };
}
