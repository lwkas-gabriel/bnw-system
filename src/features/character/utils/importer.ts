import { z } from "zod";
import type { Character, PericiaId } from "../../../shared/types/character";
import type { ExportedCharacter } from "./exporter";
import { blankPericias } from "./attrCalc";
import { validateCharacterFull, type ValidationReport } from "./validator";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImportStatus = "success" | "success_with_warnings" | "error";

export interface ImportResult {
  status: ImportStatus;
  character: Character | null;
  /** Parse/schema errors before validation */
  parseErrors: string[];
  /** Full validation report (null if parse failed) */
  validation: ValidationReport | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 512 * 1024; // 512 KB

// ─── Zod schema ───────────────────────────────────────────────────────────────

// Loose schema: validates shape and limits only — BNW rules are handled by validator.ts
const RawCharacterSchema = z
  .object({
    id:    z.string().max(128).optional(),
    name:  z.string().min(1).max(100),
    level: z.number().int().min(1).max(200),
    race:  z.string().max(32),
    investedAttributes: z.object({
      power:        z.number().min(0).max(999),
      precision:    z.number().min(0).max(999),
      defense:      z.number().min(0).max(999),
      constitution: z.number().min(0).max(999),
    }),
    racialBonus:        z.record(z.unknown()).optional(),
    pericias:           z.record(z.number().min(0).max(99)).optional(),
    humanPericiaChoice: z.string().max(32).nullable().optional(),
    professions:        z.array(z.unknown()).max(7).optional(),
    energy: z
      .object({
        energy:         z.number().min(0).max(9999),
        energyInvested: z.number().min(0).max(9999),
      })
      .optional(),
    haki:          z.unknown().optional(),
    akuma:         z.unknown().optional(),
    artesMarciais: z.unknown().optional(),
    cyborg:        z.unknown().optional(),
    techniques: z
      .array(
        z
          .object({
            name:   z.string().max(100),
            rank:   z.string().max(10),
            effect: z.string().max(1000).optional(),
          })
          .passthrough()
      )
      .max(50)
      .optional(),
    equippedWeapon:    z.unknown().optional(),
    equippedDefensive: z.array(z.unknown()).max(2).optional(),
    gemsSpent:         z.number().min(0).max(9999).optional(),
    gemBudget:         z.number().min(0).max(9999).optional(),
    location:          z.string().max(32).optional(),
    faction:           z.unknown().optional(),
  })
  .passthrough(); // forward-compat: unknown fields are allowed

function formatZodIssue(issue: z.ZodIssue): string {
  const path = issue.path.join(".") || "raiz";
  switch (issue.code) {
    case z.ZodIssueCode.too_big:
      return `'${path}': valor muito grande (máx ${(issue as z.ZodTooBigIssue).maximum})`;
    case z.ZodIssueCode.too_small:
      return `'${path}': valor muito pequeno (mín ${(issue as z.ZodTooSmallIssue).minimum})`;
    case z.ZodIssueCode.invalid_type:
      return `'${path}': tipo inválido (esperado ${(issue as z.ZodInvalidTypeIssue).expected}, recebido ${(issue as z.ZodInvalidTypeIssue).received})`;
    default:
      return `'${path}': ${issue.message}`;
  }
}

// ─── Migration ────────────────────────────────────────────────────────────────

function migrateCharacter(raw: Record<string, unknown>): Character {
  return {
    id:          (raw.id as string) ?? crypto.randomUUID(),
    name:        (raw.name as string) ?? "Personagem Importado",
    level:       Number(raw.level) || 1,
    race:        (raw.race as any) ?? "human",
    investedAttributes: {
      power:        Number((raw.investedAttributes as any)?.power)        || 0,
      precision:    Number((raw.investedAttributes as any)?.precision)    || 0,
      defense:      Number((raw.investedAttributes as any)?.defense)      || 0,
      constitution: Number((raw.investedAttributes as any)?.constitution) || 0,
    },
    racialBonus:    (raw.racialBonus    as any) ?? {},
    pericias: (() => {
      const base = blankPericias();
      if (raw.pericias && typeof raw.pericias === "object") {
        for (const key of Object.keys(base) as PericiaId[]) {
          const v = (raw.pericias as any)[key];
          if (typeof v === "number") base[key] = v;
        }
      } else if (typeof (raw as any).ambition === "number") {
        // Backward compat: migrate old ambition field
        base.ambicao = Number((raw as any).ambition) || 0;
      }
      return base;
    })(),
    humanPericiaChoice: (raw.humanPericiaChoice as any) ?? null,
    professions: Array.isArray(raw.professions) ? (raw.professions as any[]) : [],
    energy: {
      bpn:             0,
      energy:          Number((raw.energy as any)?.energy)          || 0,
      energyInvested:  Number((raw.energy as any)?.energyInvested)  || 0,
    },
    haki:           (raw.haki          as any) ?? null,
    akuma:          (raw.akuma         as any) ?? null,
    artesMarciais:  (raw.artesMarciais as any) ?? null,
    cyborg:         (raw.cyborg        as any) ?? null,
    techniques:     Array.isArray(raw.techniques) ? (raw.techniques as any[]) : [],
    equippedWeapon: (raw.equippedWeapon as any) ?? null,
    equippedDefensive: Array.isArray(raw.equippedDefensive)
      ? [(raw.equippedDefensive as any[])[0] ?? null, (raw.equippedDefensive as any[])[1] ?? null]
      : [null, null],
    gemsSpent:   Number(raw.gemsSpent)   || 0,
    gemBudget:   Number(raw.gemBudget)   || 20,
    location:    (raw.location as any)   ?? "blues",
  };
}

// ─── Parse JSON ───────────────────────────────────────────────────────────────

export function parseImportJSON(raw: string): ImportResult {
  const parseErrors: string[] = [];

  // 1. JSON parse
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return {
      status: "error",
      character: null,
      parseErrors: ["JSON inválido: " + (e instanceof Error ? e.message : String(e))],
      validation: null,
    };
  }

  // 2. System wrapper or bare character
  let rawChar: Record<string, unknown>;

  if (parsed && typeof parsed === "object" && "_system" in (parsed as object)) {
    const exported = parsed as Partial<ExportedCharacter>;
    if (exported._system !== "bnw-character-system") {
      parseErrors.push(`Sistema desconhecido: "${exported._system}". Esperado: "bnw-character-system".`);
    }
    if (!exported.character) {
      return {
        status: "error",
        character: null,
        parseErrors: ["Campo 'character' ausente no arquivo exportado."],
        validation: null,
      };
    }
    rawChar = exported.character as unknown as Record<string, unknown>;
  } else if (parsed && typeof parsed === "object") {
    rawChar = parsed as Record<string, unknown>;
    parseErrors.push("Arquivo sem cabeçalho de sistema — importado como personagem direto.");
  } else {
    return {
      status: "error",
      character: null,
      parseErrors: ["O arquivo não contém um objeto JSON válido."],
      validation: null,
    };
  }

  // 3. Schema validation
  const zodResult = RawCharacterSchema.safeParse(rawChar);
  if (!zodResult.success) {
    return {
      status: "error",
      character: null,
      parseErrors: [
        ...parseErrors,
        ...zodResult.error.issues.map(formatZodIssue),
      ],
      validation: null,
    };
  }

  // 4. Migrate / fill defaults
  const character = migrateCharacter(zodResult.data as Record<string, unknown>);

  // 5. Full rule validation
  const validation = validateCharacterFull(character);

  const status: ImportStatus =
    parseErrors.some(e => !e.startsWith("Arquivo sem cabeçalho")) || !validation.isValid
      ? "error"
      : validation.hasWarnings
        ? "success_with_warnings"
        : "success";

  return { status, character, parseErrors, validation };
}

// ─── File reader ──────────────────────────────────────────────────────────────

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsText(file);
  });
}

export async function importFromFile(file: File): Promise<ImportResult> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      status: "error",
      character: null,
      parseErrors: [`Arquivo muito grande (${Math.round(file.size / 1024)} KB). Máximo: ${MAX_FILE_SIZE / 1024} KB.`],
      validation: null,
    };
  }

  if (!file.name.endsWith(".json")) {
    return {
      status: "error",
      character: null,
      parseErrors: ["Formato de arquivo inválido. Apenas arquivos .json são aceitos."],
      validation: null,
    };
  }

  // file.type can be empty string on some OSes for .json — only reject known-wrong MIME types
  if (file.type && file.type !== "application/json") {
    return {
      status: "error",
      character: null,
      parseErrors: [`Tipo de arquivo inválido (${file.type}). Esperado: application/json.`],
      validation: null,
    };
  }

  try {
    const text = await readFileAsText(file);
    return parseImportJSON(text);
  } catch (e) {
    return {
      status: "error",
      character: null,
      parseErrors: ["Erro ao ler o arquivo: " + (e instanceof Error ? e.message : String(e))],
      validation: null,
    };
  }
}

export async function importFromClipboard(): Promise<ImportResult> {
  try {
    const text = await navigator.clipboard.readText();
    if (!text.trim()) {
      return {
        status: "error",
        character: null,
        parseErrors: ["Área de transferência vazia."],
        validation: null,
      };
    }
    if (text.length > MAX_FILE_SIZE) {
      return {
        status: "error",
        character: null,
        parseErrors: [`Conteúdo muito grande. Máximo: ${MAX_FILE_SIZE / 1024} KB.`],
        validation: null,
      };
    }
    return parseImportJSON(text);
  } catch {
    return {
      status: "error",
      character: null,
      parseErrors: ["Sem acesso à área de transferência. Use o upload de arquivo."],
      validation: null,
    };
  }
}
