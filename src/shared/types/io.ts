/** Resultado geral de uma importação */
export type ImportStatus = "success" | "success_with_warnings" | "error";

/** Envelope dos arquivos JSON exportados pelo sistema */
export type ExportEnvelope<System extends string, Key extends string, T> = {
  /** Versão do esquema, para compatibilidade futura */
  _version: "1.0";
  _exportedAt: string;
  _system: System;
} & { [K in Key]: T };
