import { z } from "zod";
import type { Character, PericiaId } from "../../../shared/types/character";
import type { ExportedCharacter } from "./exporter";
import { blankPericias, CYBORG_ENERGY_BONUS, energyMax } from "./attrCalc";
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

const RACE_MAP: Record<string, string> = {
  "humano": "human", "tritão": "fishman", "fishman": "fishman",
  "sireno": "siren", "siren": "siren", "lunar": "lunar",
  "mink": "mink", "anão": "dwarf", "gigante": "giant",
  "meio-gigante": "half_giant", "meio gigante": "half_giant",
};

const LOCATION_MAP: Record<string, string> = {
  "blues": "blues", "grand line": "grand_line", "paradise": "grand_line",
  "new world": "new_world", "novo mundo": "new_world",
};

const FAIXA_MAP: Record<string, string> = {
  "branca": "branca", "cinza": "cinza", "azul clara": "azul_clara",
  "azul escura": "azul_escura", "amarela": "amarela", "laranja": "laranja",
  "verde": "verde", "roxa": "roxa", "marrom": "marrom", "preta": "preta",
  "coral": "coral", "rajada": "rajada", "vermelha": "vermelha",
  "grão mestre": "grao_mestre", "grao mestre": "grao_mestre",
};

const AKUMA_TYPE_MAP: Record<string, string> = {
  "zoan": "zoan", "logia": "logia", "paramecia": "paramecia",
};

function rx1(text: string, pattern: RegExp): string | null {
  return text.match(pattern)?.[1]?.trim() ?? null;
}

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
  const gemBudget = Number(rx1(text, /<e>Gemas Totais:\s*<\/e>(\d+)/)) || 20;
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
    const CYBORG_LOC_MAP: Record<string, string> = {
      "cabeça": "head", "braço direito": "right_arm", "braço esquerdo": "left_arm",
      "perna direita": "right_leg", "perna esquerda": "left_leg", "tronco": "torso",
    };
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

  const isTxt  = file.name.endsWith(".txt");
  const isJson = file.name.endsWith(".json");

  if (!isJson && !isTxt) {
    return {
      status: "error",
      character: null,
      parseErrors: ["Formato de arquivo inválido. Apenas arquivos .json ou .txt são aceitos."],
      validation: null,
    };
  }

  try {
    const text = await readFileAsText(file);
    return parseImportAuto(text);
  } catch (e) {
    return {
      status: "error",
      character: null,
      parseErrors: ["Erro ao ler o arquivo: " + (e instanceof Error ? e.message : String(e))],
      validation: null,
    };
  }
}

function parseImportAuto(text: string): ImportResult {
  return text.trim().startsWith("[dohtml]")
    ? parseImportForumHTML(text)
    : parseImportJSON(text);
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
    return parseImportAuto(text);
  } catch {
    return {
      status: "error",
      character: null,
      parseErrors: ["Sem acesso à área de transferência. Use o upload de arquivo."],
      validation: null,
    };
  }
}
