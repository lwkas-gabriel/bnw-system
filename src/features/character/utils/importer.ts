import { z } from "zod";
import type { Character, PericiaId } from "../../../shared/types/character";
import type { ExportedCharacter } from "./exporter";
import { blankPericias, CYBORG_ENERGY_BONUS, energyMax } from "./attrCalc";
import { validateCharacterFull, type ValidationReport } from "./validator";
import { GEM_BUDGET_MIN } from "../../../data/gemCosts";
import type { ImportStatus } from "../../../shared/types/io";
import { readClipboardText, readFileAsText, regexCapture, validateImportFile } from "../../../shared/utils/importIO";
import type { AMFaixaId, CyborgShiftLocation, LocationId, RaceId } from "../../../shared/types/character";
import { invertLabels } from "../../../shared/utils/labels";
import { RACES, raceForumLabel } from "../../../data/races";
import { LOCATION_LABELS } from "../../../data/locations";
import { AM_FAIXA_ORDER, faixaForumLabel } from "../../../data/artesMarciais";
import { AKUMA_TYPE_LABELS } from "../../../data/akumaModules";
import { CYBORG_LOCATIONS } from "../../../data/cyborg";

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
    gemBudget:   Number(raw.gemBudget)   || GEM_BUDGET_MIN,
    location:    (raw.location as any)   ?? "blues",
    companions:  Array.isArray(raw.companions) ? (raw.companions as any[]) : [],
    ...(raw.faction && typeof raw.faction === "object" ? { faction: raw.faction as Character["faction"] } : {}),
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

export function parseImportForumHTML(text: string): ImportResult {
  const parseErrors: string[] = [
    "Importado via formato de fórum — campos narrativos não importados.",
  ];

  const name    = rx1(text, /<div class="toptitle">([^<]+)<\/div>/) ?? "Personagem Importado";
  const raceRaw = rx1(text, /<e>Ra[çc]a:\s*<\/e>([^.\n<]+)/)?.toLowerCase() ?? "";
  const locRaw  = rx1(text, /<e>Localiza[çc][ãa]o:\s*<\/e>([^.\n<]+)/)?.toLowerCase() ?? "";

  const race     = RACE_MAP[raceRaw]     ?? "human";
  const location = LOCATION_MAP[locRaw] ?? "blues";

  const level     = Number(rx1(text, /<e>N[ií]vel:\s*<\/e>(\d+)/))   || 1;
  const gemBudget = Number(rx1(text, /<e>Gemas Totais:\s*<\/e>(\d+)/)) || GEM_BUDGET_MIN;
  const gemsSpent = Number(rx1(text, /<e>Gemais? Gastas:\s*<\/e>(\d+)/)) || 0;

  const totalPow = Number(rx1(text, /<e>Poder\s*\(PDR\):\s*<\/e>(\d+)/)) || 1;
  const totalPre = Number(rx1(text, /<e>Precis[ãa]o\s*\(PRE\):\s*<\/e>(\d+)/)) || 1;
  const totalDef = Number(rx1(text, /<e>Defesa\s*\(DEF\):\s*<\/e>(\d+)/)) || 1;
  const totalCon = Number(rx1(text, /<e>Constitui[çc][ãa]o[^<]*<\/e>(\d+)/)) || 3;

  const investedAttributes = {
    power:        Math.max(0, totalPow - 1),
    precision:    Math.max(0, totalPre - 1),
    defense:      Math.max(0, totalDef - 1),
    constitution: Math.max(0, totalCon - 3),
  };

  const PERICID_LABELS: Array<[PericiaId, RegExp]> = [
    ["ambicao",      /<e>Ambi[çc][ãa]o:\s*<\/e>(\d+)/],
    ["atletismo",    /<e>Atletismo:\s*<\/e>(\d+)/],
    ["destreza",     /<e>Destreza:\s*<\/e>(\d+)/],
    ["erudicao",     /<e>Erudi[çc][ãa]o:\s*<\/e>(\d+)/],
    ["expressao",    /<e>Express[ãa]o:\s*<\/e>(\d+)/],
    ["furtividade",  /<e>Furtividade:\s*<\/e>(\d+)/],
    ["investigacao", /<e>Investiga[çc][ãa]o:\s*<\/e>(\d+)/],
    ["logica",       /<e>L[oó]gica:\s*<\/e>(\d+)/],
    ["percepcao",    /<e>Percep[çc][ãa]o:\s*<\/e>(\d+)/],
    ["persuasao",    /<e>Persuas[ãa]o:\s*<\/e>(\d+)/],
    ["sobrevivencia",/<e>Sobreviv[eê]ncia:\s*<\/e>(\d+)/],
  ];

  const pericias = blankPericias();
  for (const [id, pattern] of PERICID_LABELS) {
    const v = Number(rx1(text, pattern));
    if (!isNaN(v)) pericias[id] = v;
  }

  // Techniques
  const techniques: unknown[] = [];
  const techRankBlocks = [...text.matchAll(/<e>Rank ([EDCBA])<\/e>([\s\S]*?)(?=<e>Rank [EDCBA]<\/e>|<\/div>)/g)];
  for (const [, rank, block] of techRankBlocks) {
    for (const techBlock of block.split(/(?=\[b\]Nome:\[\/b\])/)) {
      const tName = rx1(techBlock, /\[b\]Nome:\[\/b\]\s*([^\n]+)/);
      if (!tName || tName === "Nome da técnica") continue;
      const energyCost = Number(rx1(techBlock, /\[b\]Energia:\[\/b\]\s*(\d+)/)) || 1;
      techniques.push({
        id: crypto.randomUUID(),
        name: tName,
        description: rx1(techBlock, /\[b\]Descri[çc][ãa]o:\[\/b\]\s*([^\n]+)/) ?? "",
        rank,
        type: "offensive",
        targetAttr: "power",
        baseBonus: 1,
        energyCost,
        adherences: [],
        source: "purchased",
      });
    }
  }

  // Akuma no Mi
  let akuma: unknown = null;
  // Formato atual do exporter: <d>Akuma no Mi — Nome (Tipo Rank X — N gemas)</d>
  const akumaHeader = /<d>Akuma no Mi — (.+?) \((\w+) Rank ([SABC])\b[^)]*\)<\/d>/.exec(text);
  // Formato legado: <d>Akuma no Mi</d> seguido de [b]Nome/Tipo/Rank:[/b]
  const akumaBlock = rx1(text, /<d>Akuma no Mi<\/d>([\s\S]*?)(?=<\/div>)/);
  if (akumaHeader || akumaBlock) {
    const akumaName = akumaHeader?.[1].trim() ?? rx1(akumaBlock ?? "", /\[b\]Nome:\[\/b\]\s*([^.\n]+)/);
    const akumaType = (akumaHeader?.[2] ?? rx1(akumaBlock ?? "", /\[b\]Tipo:\[\/b\]\s*([^.\n]+)/) ?? "").toLowerCase();
    const akumaRank = akumaHeader?.[3] ?? rx1(akumaBlock ?? "", /\[b\]Rank:\[\/b\]\s*([SABC])/);
    if (akumaName && AKUMA_TYPE_MAP[akumaType]) {
      akuma = { type: AKUMA_TYPE_MAP[akumaType], name: akumaName, rank: akumaRank ?? "C",
        ...(AKUMA_TYPE_MAP[akumaType] === "zoan"
          ? { animalClass: "herbivore", isMythical: false, isAncestral: false, points: [], abilities: [], vigorAnimalBonus: 0 }
          : AKUMA_TYPE_MAP[akumaType] === "logia"
            ? { elementalNatureAttr: "power", statusEnhanced: { name: "", description: "", combination: [""] }, intangibilityBonus: { defense: 4, constitution: 4 } }
            : { parameciaClass: "corporeal", specialAdherence: "", passives: [], actives: [] }
        ),
      };
    }
  }

  // Haki
  let haki: unknown = null;
  const hakiArmBlock  = rx1(text, /<d>Haki do Armamento<\/d>([\s\S]*?)(?=<d>Haki|<\/div>)/);
  const hakiObsBlock  = rx1(text, /<d>Haki da Observa[çc][ãa]o<\/d>([\s\S]*?)(?=<d>Haki|<\/div>)/);
  const hakiKingBlock = text.includes("<d>Haki do Rei</d>");

  if (hakiArmBlock || hakiObsBlock) {
    const armStage = Number(rx1(hakiArmBlock ?? "", /\[b\]N[ií]vel:\s*\[\/b\]\s*(\d+)/)) || 0;
    const obStage  = Number(rx1(hakiObsBlock  ?? "", /\[b\]N[ií]vel:\s*\[\/b\]\s*(\d+)/)) || 0;
    const armCost  = Number(rx1(hakiArmBlock  ?? "", /\[b\]Custo:\s*\[\/b\]\s*(\d+)/))    || 0;

    const primaryType   = armCost > 0 ? "armament" : "observation";
    const secondaryType = primaryType === "armament" ? "observation" : "armament";

    haki = {
      primaryType,
      primaryStage:   primaryType === "armament" ? armStage : obStage,
      secondaryType,
      secondaryStage: primaryType === "armament" ? obStage  : armStage,
      hasKing:        hakiKingBlock,
      kingStage:      hakiKingBlock ? "controlled" : null,
      advancedType:   null,
    };
  }

  // Cyborg
  let cyborg: unknown = null;
  const cyborgBlocks = [...text.matchAll(/<d>Ciborgue<\/d>([\s\S]*?)(?=<d>Ciborgue<\/d>|<\/div>)/g)];
  if (cyborgBlocks.length > 0) {
    const shifts = cyborgBlocks.map((m, i) => {
      const block = m[1];
      const locRawC = rx1(block, /\[b\]Local:\s*\[\/b\]\s*([^.\n]+)/)?.toLowerCase().trim() ?? "";
      return {
        shiftNumber: (i + 1) as 1|2|3|4|5|6,
        location: CYBORG_LOC_MAP[locRawC] ?? "torso",
        name: rx1(block, /\[b\]Nome:\s*\[\/b\]\s*([^.\n]+)/) ?? "",
        description: rx1(block, /\[b\]Descri[çc][ãa]o:\s*\[\/b\]\s*([^.\n]+)/) ?? "",
        bugigangaId: null,
      };
    });
    const shift3Raw = rx1(text, /\[b\]Bônus do Shift 3:\s*\[\/b\]\s*([^.\n]+)/)?.toLowerCase() ?? "";
    const shift3Bonus = shift3Raw.includes("energia") ? "energy" : shift3Raw.includes("técnicas") ? "techniques" : null;
    cyborg = { shifts, shift3Bonus, gear: null, usesFuel: shifts.length >= 3 };
  }

  // Energia exportada = Lv×3 + investida + bônus do Shift 3 (ver characterMaxEnergy)
  const exportedEnergy = Number(rx1(text, /<e>Energia\s*\(EN\):\s*<\/e>(\d+)/)) || level * 3;
  const cyborgEnergyBonus = (cyborg as { shift3Bonus?: string } | null)?.shift3Bonus === "energy" ? CYBORG_ENERGY_BONUS : 0;
  const energyInvested = Math.max(0, exportedEnergy - level * 3 - cyborgEnergyBonus);

  // Artes Marciais
  let artesMarciais: unknown = null;
  const amBlock = rx1(text, /<d>Artes Marciais<\/d>([\s\S]*?)(?=<\/div>)/);
  if (amBlock) {
    const faixaRaw = rx1(amBlock, /\[b\]Faixa:\s*\[\/b\]\s*([^.\n]+)/)?.toLowerCase().trim() ?? "";
    const faixa = FAIXA_MAP[faixaRaw] ?? null;
    if (faixa) artesMarciais = { currentFaixa: faixa, laranjaChoice: null };
  }

  const rawChar: Record<string, unknown> = {
    name,
    level,
    race,
    investedAttributes,
    racialBonus: {},
    pericias,
    professions: [],
    energy: { energy: energyMax(level, energyInvested), energyInvested },
    haki,
    akuma,
    artesMarciais,
    cyborg,
    techniques,
    equippedWeapon:    null,
    equippedDefensive: [null, null],
    gemsSpent,
    gemBudget,
    location,
    companions: [],
  };

  const character = migrateCharacter(rawChar);
  const validation = validateCharacterFull(character);

  const status: ImportStatus = !validation.isValid
    ? "success_with_warnings"
    : validation.hasWarnings
      ? "success_with_warnings"
      : "success_with_warnings"; // always warn since narratives are missing

  return { status, character, parseErrors, validation };
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
