import type { Ship, ShipSize, ShipOwnership, ShipRole } from "../../../shared/types/ship";
import { SHIP_MAX_HULL, SHIP_MECHANISMS, SHIP_COMODOS } from "../../../data/ships";
import { readFileAsText } from "../../character/utils/importer";

// ─── Result type ──────────────────────────────────────────────────────────────

export type ShipImportStatus = "success" | "success_with_warnings" | "error";

export interface ShipImportResult {
  status: ShipImportStatus;
  ship: Ship | null;
  parseErrors: string[];
  warnings: string[];
}

// ─── Reverse label maps ───────────────────────────────────────────────────────

const SIZE_BY_LABEL: Record<string, ShipSize> = {
  "individual": "individual", "pequeno": "pequeno", "médio": "medio",
  "grande": "grande", "gigante": "gigante", "colossal": "colossal",
};

const OWNERSHIP_BY_LABEL: Record<string, ShipOwnership> = {
  "próprio": "owned",
  "comissionado (marinha)": "navy_permanent",
  "temporário (cp — 1 aventura)": "cp_temporary",
  "galeão emprestado (cp comandante)": "cp_galeon",
};

const ROLE_BY_LABEL: Record<string, ShipRole> = {
  "capitão": "captain", "imediato": "first_mate", "navegante": "navigator",
  "médico": "doctor", "cozinheiro": "cook", "carpinteiro": "shipwright",
  "músico": "musician", "atirador": "sniper", "arqueólogo(a)": "archaeologist",
  "tripulante": "crew",
};

// ─── JSON import ──────────────────────────────────────────────────────────────

function parseShipJSON(text: string): ShipImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { status: "error", ship: null, parseErrors: ["JSON inválido."], warnings: [] };
  }

  const obj = parsed as Record<string, unknown>;
  if (obj._system !== "bnw-ship-system" || typeof obj.ship !== "object" || !obj.ship) {
    return { status: "error", ship: null, parseErrors: ["Arquivo não é uma ficha de navio BNW válida."], warnings: [] };
  }

  const ship = obj.ship as Ship;
  if (!ship.id) ship.id = crypto.randomUUID();
  if (!ship.klabautermann) ship.klabautermann = { active: false, voyageCount: 0 };
  if (!ship.mechanisms) ship.mechanisms = [];
  if (!ship.comodoIds) ship.comodoIds = [];
  if (!ship.crew) ship.crew = [];
  if (!ship.notes) ship.notes = "";

  const status = warnings.length > 0 ? "success_with_warnings" : "success";
  return { status, ship, parseErrors: errors, warnings };
}

// ─── dohtml import ────────────────────────────────────────────────────────────

function parseShipDoHTML(text: string): ShipImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  function extract(pattern: RegExp): string | null {
    return pattern.exec(text)?.[1]?.trim() ?? null;
  }

  const name = extract(/<div class="toptitle">([^<]+)/) ?? extract(/<e>Nome: <\/e>([^\n<]+)/);
  if (!name) {
    return { status: "error", ship: null, parseErrors: ["Nome do navio não encontrado."], warnings: [] };
  }

  const sizeRaw = extract(/<e>Tamanho: <\/e>([^\n<]+)/)?.toLowerCase();
  const size: ShipSize = (sizeRaw && SIZE_BY_LABEL[sizeRaw]) ? SIZE_BY_LABEL[sizeRaw] : "medio";
  if (!sizeRaw || !SIZE_BY_LABEL[sizeRaw]) warnings.push("Tamanho não reconhecido — assumido Médio.");

  const hullMatch = /<e>Casco \(Hull\): <\/e>(\d+)\/(\d+)/.exec(text);
  const maxHull = hullMatch ? parseInt(hullMatch[2]) : SHIP_MAX_HULL[size];
  const currentHull = hullMatch ? parseInt(hullMatch[1]) : maxHull;

  const builtByEngineer = /<e>Construído por Engenheiro: <\/e>Sim/.test(text);
  const klabActive = /<e>Klabautermann: <\/e>Ativo/.test(text);
  const voyageMatch = /\((\d+)\/10 viagens\)/.exec(text);
  const voyageCount = voyageMatch ? parseInt(voyageMatch[1]) : (klabActive ? 10 : 0);

  const ownershipRaw = extract(/<e>Aquisição: <\/e>([^\n<]+)/)?.toLowerCase();
  const ownership: ShipOwnership = (ownershipRaw && OWNERSHIP_BY_LABEL[ownershipRaw])
    ? OWNERSHIP_BY_LABEL[ownershipRaw]
    : "owned";

  // Mechanisms — extract from [b]Name:[/b] blocks inside Mecanismos section
  const mechanismsSection = /<d>Mecanismos Avançados[^<]*<\/d>([\s\S]*?)(?:<d>|<\/div>)/.exec(text)?.[1] ?? "";
  const mechanisms: string[] = [];
  const mecNameReg = /\[b\]([^\[:\]]+):\[\/b\]/g;
  let mecMatch: RegExpExecArray | null;
  while ((mecMatch = mecNameReg.exec(mechanismsSection)) !== null) {
    const name_ = mecMatch[1].trim().toLowerCase();
    const found = SHIP_MECHANISMS.find(m => m.name.toLowerCase() === name_);
    if (found) mechanisms.push(found.id);
    else warnings.push(`Mecanismo não reconhecido: "${mecMatch[1]}"`);
  }

  // Cômodos — extract from [b]Name (Tamanho N):[/b] blocks inside Cômodos section
  const comodosSection = /<d>Cômodos[^<]*<\/d>([\s\S]*?)(?:<\/div>)/.exec(text)?.[1] ?? "";
  const comodoIds: string[] = [];
  const comNameReg = /\[b\]([^([\]]+)\s*\(Tamanho\s*\d+\):\[\/b\]/g;
  let comMatch: RegExpExecArray | null;
  while ((comMatch = comNameReg.exec(comodosSection)) !== null) {
    const name_ = comMatch[1].trim().toLowerCase();
    const found = SHIP_COMODOS.find(c => c.name.toLowerCase() === name_);
    if (found) comodoIds.push(found.id);
    else warnings.push(`Cômodo não reconhecido: "${comMatch[1]}"`);
  }

  // Crew — extract from [b]Role:[/b] Name lines inside Tripulação section
  const crewSection = /<d>Tripulação[^<]*<\/d>([\s\S]*?)(?:<\/div>)/.exec(text)?.[1] ?? "";
  const crew: Ship["crew"] = [];
  const crewReg = /\[b\]([^\[\]]+):\[\/b\]\s*([^\n]+)/g;
  let crewMatch: RegExpExecArray | null;
  while ((crewMatch = crewReg.exec(crewSection)) !== null) {
    const roleLabel = crewMatch[1].trim().toLowerCase();
    const memberName = crewMatch[2].trim();
    const role: ShipRole = ROLE_BY_LABEL[roleLabel] ?? "crew";
    crew.push({ id: crypto.randomUUID(), name: memberName, role });
  }

  // Notes — extract from Observações section
  const notesSection = /<d>Observações<\/d>\n?([^<]*)/.exec(text)?.[1]?.trim() ?? "";
  const notes = notesSection === "[PREENCHER]" ? "" : notesSection;

  warnings.push("Importado via formato de fórum — campos de Klabautermann podem precisar de revisão.");

  const ship: Ship = {
    id: crypto.randomUUID(),
    name,
    size,
    currentHull,
    maxHull,
    mechanisms,
    comodoIds,
    crew,
    klabautermann: { active: klabActive, voyageCount },
    notes,
    builtByEngineer,
    ownership,
    klabautermannUnlockedWithDiscount: false,
  };

  const status = errors.length > 0 ? "error" : warnings.length > 0 ? "success_with_warnings" : "success";
  return { status, ship: errors.length > 0 ? null : ship, parseErrors: errors, warnings };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function parseShipImport(text: string): ShipImportResult {
  const trimmed = text.trim();
  if (trimmed.startsWith("[dohtml]") && trimmed.includes("Informações do Navio")) {
    return parseShipDoHTML(trimmed);
  }
  return parseShipJSON(trimmed);
}

export async function importShipFromFile(file: File): Promise<ShipImportResult> {
  try {
    const text = await readFileAsText(file);
    return parseShipImport(text);
  } catch {
    return { status: "error", ship: null, parseErrors: ["Erro ao ler arquivo."], warnings: [] };
  }
}

export async function importShipFromClipboard(): Promise<ShipImportResult> {
  try {
    const text = await navigator.clipboard.readText();
    return parseShipImport(text);
  } catch {
    return { status: "error", ship: null, parseErrors: ["Não foi possível acessar a área de transferência."], warnings: [] };
  }
}
