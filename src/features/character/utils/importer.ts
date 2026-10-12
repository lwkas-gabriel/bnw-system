import { z } from "zod";
import type {
  AkumaNoMi, AkumaRank, AkumaType, AMFaixaId, ArtesMarciais, BaseAttributes, Character,
  CharacterPericias, CharacterProfession, CompanionData, CyborgPath, CyborgShift, CyborgShiftData,
  CyborgShiftLocation, Equipment, FactionData, HakiPath, HakiStage, LocationId, PericiaId, RaceId,
  Technique, TechniqueRank, UniqueWeapon,
} from "../../../shared/types/character";
import type { ImportStatus } from "../../../shared/types/io";
import { AKUMA_TYPE_LABELS } from "../../../data/akumaModules";
import { AM_FAIXA_ORDER, faixaForumLabel } from "../../../data/artesMarciais";
import { BASE_ATTRIBUTES } from "../../../data/attributes";
import { CYBORG_LOCATIONS } from "../../../data/cyborg";
import { GEM_BUDGET_MIN } from "../../../data/gemCosts";
import { LOCATION_LABELS } from "../../../data/locations";
import { RACES, raceForumLabel } from "../../../data/races";
import { readClipboardText, readFileAsText, regexCapture, validateImportFile } from "../../../shared/utils/importIO";
import { invertLabels } from "../../../shared/utils/labels";
import { blankPericias, CYBORG_ENERGY_BONUS, energyMax } from "./attrCalc";
import type { ExportedCharacter } from "./exporter";
import { validateCharacterFull, type ValidationReport } from "./validator";

// ─── Types ────────────────────────────────────────────────────────────────────

export type { ImportStatus };

export interface ImportResult {
  status: ImportStatus;
  character: Character | null;
  /** Parse/schema errors before validation */
  parseErrors: string[];
  /** Full validation report (null if parse failed) */
  validation: ValidationReport | null;
}

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

// O formato já foi validado pelo schema zod e as regras são checadas pelo
// validator; aqui só preenchemos padrões para campos ausentes.

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function asList<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

/** Campo do JSON importado, ou `fallback` se ausente/nulo */
function fieldOr<T>(raw: Record<string, unknown>, key: string, fallback: T): T {
  return (raw[key] ?? fallback) as T;
}

function migratePericias(raw: Record<string, unknown>): CharacterPericias {
  const pericias = blankPericias();
  if (raw.pericias && typeof raw.pericias === "object") {
    const source = asRecord(raw.pericias);
    for (const key of Object.keys(pericias) as PericiaId[]) {
      if (typeof source[key] === "number") pericias[key] = source[key] as number;
    }
  } else if (typeof raw.ambition === "number") {
    // Compat: fichas antigas tinham só o campo `ambition`
    pericias.ambicao = raw.ambition || 0;
  }
  return pericias;
}

function migrateCharacter(raw: Record<string, unknown>): Character {
  const attrs = asRecord(raw.investedAttributes);
  const energy = asRecord(raw.energy);
  const defensive = asList<Equipment | null>(raw.equippedDefensive);
  return {
    id:          fieldOr(raw, "id", crypto.randomUUID()),
    name:        fieldOr(raw, "name", "Personagem Importado"),
    level:       Number(raw.level) || 1,
    race:        fieldOr<RaceId>(raw, "race", "human"),
    investedAttributes: {
      power:        Number(attrs.power)        || 0,
      precision:    Number(attrs.precision)    || 0,
      defense:      Number(attrs.defense)      || 0,
      constitution: Number(attrs.constitution) || 0,
    },
    racialBonus:        fieldOr<Partial<BaseAttributes>>(raw, "racialBonus", {}),
    pericias:           migratePericias(raw),
    humanPericiaChoice: fieldOr<PericiaId | null>(raw, "humanPericiaChoice", null),
    professions:        asList<CharacterProfession>(raw.professions),
    energy: {
      bpn:            0,
      energy:         Number(energy.energy)         || 0,
      energyInvested: Number(energy.energyInvested) || 0,
    },
    haki:              fieldOr<HakiPath | null>(raw, "haki", null),
    akuma:             fieldOr<AkumaNoMi | null>(raw, "akuma", null),
    artesMarciais:     fieldOr<ArtesMarciais | null>(raw, "artesMarciais", null),
    cyborg:            fieldOr<CyborgPath | null>(raw, "cyborg", null),
    techniques:        asList<Technique>(raw.techniques),
    equippedWeapon:    fieldOr<Equipment | UniqueWeapon | null>(raw, "equippedWeapon", null),
    equippedDefensive: [defensive[0] ?? null, defensive[1] ?? null],
    gemsSpent:   Number(raw.gemsSpent) || 0,
    gemBudget:   Number(raw.gemBudget) || GEM_BUDGET_MIN,
    location:    fieldOr<LocationId>(raw, "location", "blues"),
    companions:  asList<CompanionData>(raw.companions),
    ...(raw.faction && typeof raw.faction === "object" ? { faction: raw.faction as FactionData } : {}),
    ...(typeof raw.commissionedShipId === "string" ? { commissionedShipId: raw.commissionedShipId } : {}),
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

// ─── Parse Forum HTML (dohtml) ────────────────────────────────────────────────

// Rótulos da ficha → id, derivados dos mesmos dados que o exporter usa,
// mais grafias alternativas aceitas em fichas antigas/escritas à mão.
const RACE_MAP: Record<string, RaceId> = {
  ...invertLabels(Object.fromEntries((Object.keys(RACES) as RaceId[]).map(id => [id, raceForumLabel(id)])) as Record<RaceId, string>),
  "fishman": "fishman", "siren": "siren", "meio gigante": "half_giant",
};

const LOCATION_MAP: Record<string, LocationId> = {
  ...invertLabels(LOCATION_LABELS),
  "paradise": "grand_line", "novo mundo": "new_world",
};

const FAIXA_MAP: Record<string, AMFaixaId> = {
  ...invertLabels(Object.fromEntries(AM_FAIXA_ORDER.map(id => [id, faixaForumLabel(id)])) as Record<AMFaixaId, string>),
  "grao mestre": "grao_mestre",
};

const AKUMA_TYPE_MAP = invertLabels(AKUMA_TYPE_LABELS);

const CYBORG_LOC_MAP = invertLabels(
  Object.fromEntries(CYBORG_LOCATIONS.map(l => [l.id, l.label])) as Record<CyborgShiftLocation, string>,
);

const rx1 = regexCapture;

/** Número capturado por `pattern`, ou `fallback` se ausente/zero */
function rxNumber(text: string, pattern: RegExp, fallback: number): number {
  return Number(rx1(text, pattern)) || fallback;
}

function parseForumAttributes(text: string): BaseAttributes {
  // O primeiro número de cada linha é o valor base (1/1/1/3 + investido), sem bônus raciais/AM
  const total = {
    power:        rxNumber(text, /<e>Poder\s*\(PDR\):\s*<\/e>(\d+)/, BASE_ATTRIBUTES.power),
    precision:    rxNumber(text, /<e>Precis[ãa]o\s*\(PRE\):\s*<\/e>(\d+)/, BASE_ATTRIBUTES.precision),
    defense:      rxNumber(text, /<e>Defesa\s*\(DEF\):\s*<\/e>(\d+)/, BASE_ATTRIBUTES.defense),
    constitution: rxNumber(text, /<e>Constitui[çc][ãa]o[^<]*<\/e>(\d+)/, BASE_ATTRIBUTES.constitution),
  };
  return {
    power:        Math.max(0, total.power        - BASE_ATTRIBUTES.power),
    precision:    Math.max(0, total.precision    - BASE_ATTRIBUTES.precision),
    defense:      Math.max(0, total.defense      - BASE_ATTRIBUTES.defense),
    constitution: Math.max(0, total.constitution - BASE_ATTRIBUTES.constitution),
  };
}

/** Regex de cada perícia na ficha (aceita grafias com e sem acento) */
const PERICIA_PATTERNS: Array<[PericiaId, RegExp]> = [
  ["ambicao",       /<e>Ambi[çc][ãa]o:\s*<\/e>(\d+)/],
  ["atletismo",     /<e>Atletismo:\s*<\/e>(\d+)/],
  ["destreza",      /<e>Destreza:\s*<\/e>(\d+)/],
  ["erudicao",      /<e>Erudi[çc][ãa]o:\s*<\/e>(\d+)/],
  ["expressao",     /<e>Express[ãa]o:\s*<\/e>(\d+)/],
  ["furtividade",   /<e>Furtividade:\s*<\/e>(\d+)/],
  ["investigacao",  /<e>Investiga[çc][ãa]o:\s*<\/e>(\d+)/],
  ["logica",        /<e>L[oó]gica:\s*<\/e>(\d+)/],
  ["percepcao",     /<e>Percep[çc][ãa]o:\s*<\/e>(\d+)/],
  ["persuasao",     /<e>Persuas[ãa]o:\s*<\/e>(\d+)/],
  ["sobrevivencia", /<e>Sobreviv[eê]ncia:\s*<\/e>(\d+)/],
];

function parseForumPericias(text: string): CharacterPericias {
  const pericias = blankPericias();
  for (const [id, pattern] of PERICIA_PATTERNS) {
    const value = Number(rx1(text, pattern));
    if (!isNaN(value)) pericias[id] = value;
  }
  return pericias;
}

function parseForumTechniques(text: string): Technique[] {
  const techniques: Technique[] = [];
  const rankBlocks = text.matchAll(/<e>Rank ([EDCBA])<\/e>([\s\S]*?)(?=<e>Rank [EDCBA]<\/e>|<\/div>)/g);
  for (const [, rank, block] of rankBlocks) {
    for (const techBlock of block.split(/(?=\[b\]Nome:\[\/b\])/)) {
      const name = rx1(techBlock, /\[b\]Nome:\[\/b\]\s*([^\n]+)/);
      if (!name || name === "Nome da técnica") continue;
      techniques.push({
        id: crypto.randomUUID(),
        name,
        description: rx1(techBlock, /\[b\]Descri[çc][ãa]o:\[\/b\]\s*([^\n]+)/) ?? "",
        rank: rank as TechniqueRank,
        type: "offensive",
        targetAttr: "power",
        baseBonus: 1,
        energyCost: rxNumber(techBlock, /\[b\]Energia:\[\/b\]\s*(\d+)/, 1),
        adherences: [],
        source: "purchased",
      });
    }
  }
  return techniques;
}

/** Akuma com os campos específicos do tipo em branco (o fórum só traz nome/tipo/rank) */
function blankAkuma(type: AkumaType, name: string, rank: AkumaRank): AkumaNoMi {
  switch (type) {
    case "zoan":
      return { type, name, rank, animalClass: "herbivore", isMythical: false, isAncestral: false, points: [], abilities: [], vigorAnimalBonus: 0 };
    case "logia":
      return { type, name, rank, elementalNatureAttr: "power", statusEnhanced: { name: "", description: "", combination: [""] }, intangibilityBonus: { defense: 4, constitution: 4 } };
    case "paramecia":
      return { type, name, rank, parameciaClass: "corporeal", specialAdherence: "", passives: [], actives: [] };
  }
}

function parseForumAkuma(text: string): AkumaNoMi | null {
  // Formato atual do exporter: <d>Akuma no Mi — Nome (Tipo Rank X — N gemas)</d>
  const header = /<d>Akuma no Mi — (.+?) \((\w+) Rank ([SABC])\b[^)]*\)<\/d>/.exec(text);
  // Formato legado: <d>Akuma no Mi</d> seguido de [b]Nome/Tipo/Rank:[/b]
  const legacy = rx1(text, /<d>Akuma no Mi<\/d>([\s\S]*?)(?=<\/div>)/) ?? "";
  if (!header && !legacy) return null;

  const name = header?.[1].trim() ?? rx1(legacy, /\[b\]Nome:\[\/b\]\s*([^.\n]+)/);
  const type = AKUMA_TYPE_MAP[(header?.[2] ?? rx1(legacy, /\[b\]Tipo:\[\/b\]\s*([^.\n]+)/) ?? "").toLowerCase()];
  const rank = (header?.[3] ?? rx1(legacy, /\[b\]Rank:\[\/b\]\s*([SABC])/) ?? "C") as AkumaRank;
  return name && type ? blankAkuma(type, name, rank) : null;
}

function parseForumHaki(text: string): HakiPath | null {
  const armBlock = rx1(text, /<d>Haki do Armamento<\/d>([\s\S]*?)(?=<d>Haki|<\/div>)/);
  const obsBlock = rx1(text, /<d>Haki da Observa[çc][ãa]o<\/d>([\s\S]*?)(?=<d>Haki|<\/div>)/);
  if (!armBlock && !obsBlock) return null;

  const stageOf = (block: string | null) => rxNumber(block ?? "", /\[b\]N[ií]vel:\s*\[\/b\]\s*(\d+)/, 0) as HakiStage;
  const armStage = stageOf(armBlock);
  const obsStage = stageOf(obsBlock);
  // O primário é o que tem custo (o secundário é gratuito)
  const armCost = rxNumber(armBlock ?? "", /\[b\]Custo:\s*\[\/b\]\s*(\d+)/, 0);
  const armamentIsPrimary = armCost > 0;
  const hasKing = text.includes("<d>Haki do Rei</d>");

  return {
    primaryType:    armamentIsPrimary ? "armament" : "observation",
    primaryStage:   armamentIsPrimary ? armStage : obsStage,
    secondaryType:  armamentIsPrimary ? "observation" : "armament",
    secondaryStage: armamentIsPrimary ? obsStage : armStage,
    hasKing,
    kingStage:      hasKing ? "controlled" : null,
    advancedType:   null,
  };
}

function parseForumCyborg(text: string): CyborgPath | null {
  const blocks = [...text.matchAll(/<d>Ciborgue<\/d>([\s\S]*?)(?=<d>Ciborgue<\/d>|<\/div>)/g)];
  if (blocks.length === 0) return null;

  const shifts: CyborgShiftData[] = blocks.map(([, block], i) => ({
    shiftNumber: (i + 1) as CyborgShift,
    location:    CYBORG_LOC_MAP[rx1(block, /\[b\]Local:\s*\[\/b\]\s*([^.\n]+)/)?.toLowerCase() ?? ""] ?? "torso",
    name:        rx1(block, /\[b\]Nome:\s*\[\/b\]\s*([^.\n]+)/) ?? "",
    description: rx1(block, /\[b\]Descri[çc][ãa]o:\s*\[\/b\]\s*([^.\n]+)/) ?? "",
    bugigangaId: null,
  }));
  const shift3Raw = rx1(text, /\[b\]Bônus do Shift 3:\s*\[\/b\]\s*([^.\n]+)/)?.toLowerCase() ?? "";
  const shift3Bonus = shift3Raw.includes("energia") ? "energy" : shift3Raw.includes("técnicas") ? "techniques" : null;
  return { shifts, shift3Bonus, gear: null, usesFuel: shifts.length >= 3 };
}

function parseForumArtesMarciais(text: string): ArtesMarciais | null {
  const block = rx1(text, /<d>Artes Marciais<\/d>([\s\S]*?)(?=<\/div>)/);
  const faixa = block ? FAIXA_MAP[rx1(block, /\[b\]Faixa:\s*\[\/b\]\s*([^.\n]+)/)?.toLowerCase() ?? ""] : undefined;
  return faixa ? { currentFaixa: faixa, laranjaChoice: null } : null;
}

export function parseImportForumHTML(text: string): ImportResult {
  const parseErrors = ["Importado via formato de fórum — campos narrativos não importados."];

  const level  = rxNumber(text, /<e>N[ií]vel:\s*<\/e>(\d+)/, 1);
  const cyborg = parseForumCyborg(text);

  // Energia exportada = Lv×3 + investida + bônus do Shift 3 (ver characterMaxEnergy)
  const exportedEnergy = rxNumber(text, /<e>Energia\s*\(EN\):\s*<\/e>(\d+)/, level * 3);
  const cyborgEnergyBonus = cyborg?.shift3Bonus === "energy" ? CYBORG_ENERGY_BONUS : 0;
  const energyInvested = Math.max(0, exportedEnergy - level * 3 - cyborgEnergyBonus);

  const character = migrateCharacter({
    name:               rx1(text, /<div class="toptitle">([^<]+)<\/div>/) ?? "Personagem Importado",
    level,
    race:               RACE_MAP[rx1(text, /<e>Ra[çc]a:\s*<\/e>([^.\n<]+)/)?.toLowerCase() ?? ""] ?? "human",
    location:           LOCATION_MAP[rx1(text, /<e>Localiza[çc][ãa]o:\s*<\/e>([^.\n<]+)/)?.toLowerCase() ?? ""] ?? "blues",
    investedAttributes: parseForumAttributes(text),
    racialBonus:        {},
    pericias:           parseForumPericias(text),
    professions:        [],
    energy:             { energy: energyMax(level, energyInvested), energyInvested },
    haki:               parseForumHaki(text),
    akuma:              parseForumAkuma(text),
    artesMarciais:      parseForumArtesMarciais(text),
    cyborg,
    techniques:         parseForumTechniques(text),
    equippedWeapon:     null,
    equippedDefensive:  [null, null],
    gemsSpent:          rxNumber(text, /<e>Gemais? Gastas:\s*<\/e>(\d+)/, 0),
    gemBudget:          rxNumber(text, /<e>Gemas Totais:\s*<\/e>(\d+)/, GEM_BUDGET_MIN),
    companions:         [],
  });

  // Sempre com avisos: campos narrativos (aparência, história…) não vêm do fórum
  return { status: "success_with_warnings", character, parseErrors, validation: validateCharacterFull(character) };
}

// ─── File / clipboard ─────────────────────────────────────────────────────────

function importError(message: string): ImportResult {
  return { status: "error", character: null, parseErrors: [message], validation: null };
}

export async function importFromFile(file: File): Promise<ImportResult> {
  const invalid = validateImportFile(file);
  if (invalid) return importError(invalid);

  try {
    return parseImportAuto(await readFileAsText(file));
  } catch (e) {
    return importError("Erro ao ler o arquivo: " + (e instanceof Error ? e.message : String(e)));
  }
}

function parseImportAuto(text: string): ImportResult {
  return text.trim().startsWith("[dohtml]")
    ? parseImportForumHTML(text)
    : parseImportJSON(text);
}

export async function importFromClipboard(): Promise<ImportResult> {
  const clip = await readClipboardText();
  return clip.ok ? parseImportAuto(clip.text) : importError(clip.error);
}
