import type {
  AkumaNoMi, AMFaixaId, ArtesMarciais, BaseAttributes, Character, CyborgPath, Equipment,
  HakiPath, LogiaAkuma, ParameciaAkuma, PericiaId, PrimaryHakiType, ZoanAkuma,
} from "../../../shared/types/character";
import type { ExportEnvelope } from "../../../shared/types/io";
import { AKUMA_TYPE_LABELS, PARAMECIA_MODULES, ZOAN_MODULES } from "../../../data/akumaModules";
import { faixaForumLabel, faixasUpTo, faixaStatBonuses, hasReachedFaixa } from "../../../data/artesMarciais";
import { ATTR_KEYS, ATTR_SHORT_LABELS, type AttrKey } from "../../../data/attributes";
import { CYBORG_LOCATIONS_BY_ID, cyborgBonusLabel } from "../../../data/cyborg";
import { EQUIPMENT_PRICES, QUALITY_LABELS } from "../../../data/equipment";
import { FACTIONS, getFactionLabel } from "../../../data/factions";
import { GEM_COSTS } from "../../../data/gemCosts";
import { HAKI_ARMAMENT_STAGES, HAKI_OBSERVATION_STAGES, HAKI_TYPE_NAMES } from "../../../data/haki";
import { LOCATION_LABELS } from "../../../data/locations";
import { PERICIAS, RACE_PERICIA_BONUS, ZOAN_CLASS_PERICIA_BONUS } from "../../../data/pericias";
import { raceForumLabel } from "../../../data/races";
import { TECHNIQUE_RANKS, TECHNIQUE_SOURCE_LABELS } from "../../../data/techniques";
import { UNIQUE_WEAPONS } from "../../../data/uniqueWeapons";
import { downloadText, slugify } from "../../../shared/utils/download";
import { formatBerries, pad2 } from "../../../shared/utils/format";
import { isUniqueWeaponFromLaranja } from "./artesMarciais";
import { baseAttributes, bpn, characterMaxEnergy, CYBORG_ENERGY_BONUS } from "./attrCalc";
import { isUniqueWeapon } from "./equipment";
import { computeGemBudget, type GemBudgetResult } from "./gemBudget";
import { hakiStageNum } from "./haki";
import { computePericiaBonuses } from "./pericias";

// ─── JSON export ──────────────────────────────────────────────────────────────

export type ExportedCharacter = ExportEnvelope<"bnw-character-system", "character", Character>;

export function exportToJSON(char: Character): ExportedCharacter {
  return {
    _version: "1.0",
    _exportedAt: new Date().toISOString(),
    _system: "bnw-character-system",
    character: structuredClone(char),
  };
}

export function exportToJSONString(char: Character): string {
  return JSON.stringify(exportToJSON(char), null, 2);
}

export function downloadCharacterJSON(char: Character): void {
  downloadText(exportToJSONString(char), `${slugify(char.name)}_ficha.json`, "application/json");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function attrLabel(key: string): string {
  return ATTR_SHORT_LABELS[key as AttrKey] ?? key;
}

/** Preço formatado ("B$ 500.000"), ou marcador se ausente */
function formatBerriesOr(value: number | undefined): string {
  return value === undefined ? "[PREENCHER]" : formatBerries(value);
}


function attrDisplay(base: number, racial: number, raceName: string, am: number): string {
  let s = `${base}`;
  if (racial > 0) s += ` +${racial} [Racial: ${raceName}]`;
  if (am > 0) s += ` +${am} [Bônus AM]`;
  return s;
}

function bonusWithAM(base: number, am: number, attr: string): string {
  return am > 0 ? `+${base} +${am} [Bônus AM] ${attr}` : `+${base} ${attr}`;
}

// ─── Akuma table formatters ───────────────────────────────────────────────────

const ZOAN_POINT_LABELS: Record<string, string> = {
  hybrid: "Híbrido", animal: "Animal", awakened: "Desperto",
};

function resolvedModules(
  ids: string[],
  pool: typeof PARAMECIA_MODULES | typeof ZOAN_MODULES,
): string {
  if (!ids.length) return "[PREENCHER]";
  return ids.map(id => pool.find(m => m.id === id)?.description ?? id).join("; ");
}

function formatZoanTable(zoan: ZoanAkuma, charName: string): string[] {
  const ls: string[] = [];
  const add = (...parts: string[]) => ls.push(parts.join(""));

  const nonAwakenedPoints = zoan.points.filter(p => p.id !== "awakened");
  const awakenedPoint     = zoan.points.find(p => p.id === "awakened");
  const regularAbilities  = zoan.abilities.filter(a => !a.isAwakened);
  const awakenedAbility   = zoan.abilities.find(a => a.isAwakened);
  const rankOrder = { C: 0, B: 1, A: 2, S: 3 } as const;

  add(`<d>ZOAN</d>`);
  add(`[SIZE=1]Comida por: ${charName}[/SIZE]`);
  add();
  add(`Permite ao usuário se transformar em um [PREENCHER].`);
  add();
  add(`<e>1. Points</e>`);
  add(`[b]Rank C:[/b] + 1 nos atributos de cada point.`);
  add(`[b]Rank B:[/b] + 3 nos atributos de cada point.`);
  add(`[b]Rank A:[/b] + 4 nos atributos de cada point.`);
  add();
  add(`[QUOTE]`);
  nonAwakenedPoints.forEach((p, i) => {
    add(`[b]Point 0${i + 1} - ${ZOAN_POINT_LABELS[p.id] ?? p.id}:[/b]`);
    add(`[B]${attrLabel(p.primaryAttr)}[/B]: +${p.bonus}`);
    add(`[b]${attrLabel(p.complementaryAttr)}:[/b] +${p.bonus}`);
    if (i < nonAwakenedPoints.length - 1) add();
  });
  add(`[/QUOTE]`);
  add();
  add(`<e>2. Efeito Aderido Especial</e>`);
  add(`[QUOTE][b]♦ Bestialidade:[/b]`);
  add(`A técnica apresenta toda a bestialidade de um usuário Zoan, com as melhores características do animal que a representa. Melhora o bônus da técnica em +1 para o atributo primário durante a criação da ficha. Este é o único Efeito Aderido que funciona tanto em técnicas defensivas como ofensivas, ou seja, se usado em ambas em um mesmo turno, proporcionam um bônus total de +2.[/QUOTE]`);
  add();
  add(`<e>3. Vigor Animal</e>`);
  add(`[b]Rank C:[/b] + 2 de Constituição`);
  add(`[b]Rank B:[/b] + 4 de Constituição`);
  add(`[b]Rank A:[/b] + 6 de Constituição`);

  if (rankOrder[zoan.rank] >= rankOrder["A"] && regularAbilities.length > 0) {
    add();
    add(`<d>Rank A</d>`);
    add(`<e>4. Habilidades:</e>`);
    add(`[QUOTE]`);
    regularAbilities.forEach((ab, i) => {
      add(`[b]${ab.name}:[/b]`);
      add(`[b]Bônus:[/b] ${resolvedModules(ab.modules, ZOAN_MODULES)}`);
      add(`[b]Custo:[/b] 1 de energia`);
      add(`[b]Condição:[/b] ${ab.condition || "[PREENCHER]"}`);
      if (i < regularAbilities.length - 1) add();
    });
    add(`[/QUOTE]`);
  }

  if (zoan.rank === "S") {
    add();
    add(`<d>Rank S</d>`);
    add(`<e>5. Despertar:</e>`);
    add(`[QUOTE]`);
    if (awakenedPoint) {
      add(`[b]Point 03 - Desperto:[/b]`);
      add(`[b]${attrLabel(awakenedPoint.primaryAttr)}:[/b] +${awakenedPoint.bonus}`);
      add(`[b]${attrLabel(awakenedPoint.complementaryAttr)}:[/b] +${awakenedPoint.bonus}`);
      add(`[b]Custo:[/b] +${awakenedPoint.bonus}`);
    } else {
      add(`[b]Point 03 - Desperto:[/b]`);
      add(`[b]Atributo Principal:[/b] +8`);
      add(`[b]Atributo Complementar:[/b] +8`);
      add(`[b]Custo:[/b] +8`);
    }
    if (awakenedAbility) {
      add();
      add(`[b]${awakenedAbility.name}:[/b]`);
      add(`[b]Bônus:[/b] ${resolvedModules(awakenedAbility.modules, ZOAN_MODULES)}`);
      add(`[b]Condição:[/b] Estar na Forma Desperta.`);
    }
    add(`[/QUOTE]`);
  }

  return ls;
}

function formatLogiaTable(logia: LogiaAkuma, charName: string): string[] {
  const ls: string[] = [];
  const add = (...parts: string[]) => ls.push(parts.join(""));

  add(`<d>LOGIA</d>`);
  add(`[SIZE=1]Comida por: ${charName}[/SIZE]`);
  add();
  add(`Garante a seu usuário a capacidade de se transformar, controlar e criar [PREENCHER].`);
  add();
  add(`<e>1. Manipulação Elemental: </e>Interpretativamente as logias podem manipular, criar e controlar seu elemento à vontade. Você recebe também imunidade ao elemento principal de sua akuma, e isso também se estende ao status de seu elemento.`);
  add();
  add(`[QUOTE][b]♦️ Natureza Elemental:[/b] +5 em ${attrLabel(logia.elementalNatureAttr)}`);
  add();
  add(`[b]♦️ Elementalista:[/b] Pode gastar 1 de Energia para adicionar seu Status Aprimorado em qualquer ataque corpo a corpo que seja realizado, com ou sem o uso de técnicas.[/QUOTE]`);
  add();
  add(`<e>2. Invulnerabilidade: </e>Você se torna invulnerável! Usuários de Logias tornam-se intangíveis por ataques normais, apenas podendo ser atingidos por oponentes com Haki de nível 3 ou maior, armas de kairoseki, tecnologia laser ou por ataques provenientes de outra logia.`);
  add();
  add(`[QUOTE][b]♦️ Intangibilidade:[/b] +4 em Defesa e +4 em Constituição[/QUOTE]`);
  add();
  add(`<e>3. Status Aprimorado: </e>`);
  add();
  add(`[QUOTE][b]♦️ ${logia.statusEnhanced.name}:[/b] ${logia.statusEnhanced.description}[/QUOTE]`);
  add();
  add(`<e>4. Efeitos Aderidos Especiais:</e>`);
  add();
  add(`[QUOTE][b]♦️ Ataque em Área Controlado:[/b] Acerta todos os alvos que se encontrem a uma ação de movimento a frente do usuário e na ação de movimento seguinte à frente.[/QUOTE]`);

  if (logia.rank === "S") {
    add();
    add(`<d>Rank S</d>`);
    add();
    add(`<e>5. Despertar:</e>`);
    add();
    add(`[QUOTE][b]♦️ Domínio Elemental:[/b] +5 de Poder e +5 de Precisão por 5 de energia em uma área de 3 turnos de ação (efeitos permanecem enquanto houver investimento de energia)[/QUOTE]`);
  }

  return ls;
}

function formatParameciaTable(param: ParameciaAkuma, charName: string): string[] {
  const ls: string[] = [];
  const add = (...parts: string[]) => ls.push(parts.join(""));
  const RANK_BY_IDX = ["B", "A"] as const;

  // ParameciaHabilityPassive has no isAwakened field; only actives can be awakened
  const nonAwakenedActives = param.actives.filter(a => !a.isAwakened);
  const awakenedActive     = param.actives.find(a => a.isAwakened);

  add(`<d>PARAMECIA</d>`);
  add(`[SIZE=1]Comida por: ${charName}[/SIZE]`);
  add();
  add(`O usuário se torna capaz de [PREENCHER].`);
  add();
  add(`<e>1. Efeito aderido</e>`);
  add(`Todas as técnicas que receberem esse efeito aderido adicional também recebem +1 em seu bônus básico (PDR, PRE, DEF ou CON).`);
  add();
  add(`[QUOTE][b]♦️ ${param.specialAdherence}:[/b] [PREENCHER][/QUOTE]`);
  add();

  if (param.passives.length > 0) {
    add(`<e>2. Habilidades Passivas:</e>`);
    add();
    param.passives.forEach((p, i) => {
      if (i > 0 && i - 1 < RANK_BY_IDX.length) {
        add(`<d>Rank ${RANK_BY_IDX[i - 1]}</d>`);
        add();
      }
      add(`[QUOTE][b]${p.name}:[/b]`);
      add(`[b]Bônus:[/b] ${resolvedModules(p.modules, PARAMECIA_MODULES)}`);
      if (i === 2 || p.condition) add(`[b]Condição:[/b] ${p.condition || "[PREENCHER]"}`);
      add(`[/QUOTE]`);
      add();
    });
  }

  if (nonAwakenedActives.length > 0) {
    add(`<e>3. Habilidades Ativas:</e>`);
    add();
    nonAwakenedActives.forEach((a, i) => {
      if (i > 0 && i - 1 < RANK_BY_IDX.length) {
        add(`<d>Rank ${RANK_BY_IDX[i - 1]}</d>`);
        add();
      }
      add(`[QUOTE][b]${a.name}:[/b]`);
      add(`[b]Bônus:[/b] ${resolvedModules(a.modules, PARAMECIA_MODULES)}`);
      add(`[b]Custo:[/b] ${a.energyCost} de energia`);
      if (i === 2 || a.condition) add(`[b]Condição:[/b] ${a.condition || "[PREENCHER]"}`);
      add(`[/QUOTE]`);
      add();
    });
  }

  if (param.rank === "S" && awakenedActive) {
    add(`<d>Rank S</d>`);
    add();
    add(`<e>4. Despertar</e>`);
    add();
    add(`[QUOTE][b]Modo Desperto:[/b]`);
    add(`[b]Bônus:[/b] +5 de [PREENCHER]`);
    add(`[b]Custo:[/b] 5 de energia`);
    if (awakenedActive) {
      add();
      add(`[b]${awakenedActive.name}:[/b]`);
      add(`[b]Bônus:[/b] ${resolvedModules(awakenedActive.modules, PARAMECIA_MODULES)}`);
      add(`[b]Condição:[/b] Modo Desperto ativo.`);
    }
    add(`[/QUOTE]`);
  }

  return ls;
}

// ─── Forum HTML export (dohtml) ───────────────────────────────────────────────

/** Abertura padrão das caixas da ficha do fórum */
const BOX = `<div style=" border: 1px solid; padding: 10px; ">`;

/** Acumula linhas da ficha; `ln()` sem argumentos gera uma linha em branco */
function createLineBuilder() {
  const lines: string[] = [];
  return { lines, ln: (...parts: string[]) => { lines.push(parts.join("")); } };
}

type LineFn = (...parts: string[]) => void;

/** Bônus passivos de Artes Marciais exibidos na ficha */
interface AMForumBonuses {
  stats: Partial<BaseAttributes>;
  weapon: number;
  defensiveItem: number;
  offensiveTech: number;
  defensiveTech: number;
}

function amForumBonuses(char: Character): AMForumBonuses {
  const faixa = char.artesMarciais?.currentFaixa ?? null;
  const reached = (f: AMFaixaId) => hasReachedFaixa(faixa, f);
  return {
    stats: faixa ? faixaStatBonuses(faixa) : {},
    weapon: reached("branca") ? 2 : 0,
    defensiveItem: (reached("laranja") ? 1 : 0) + (reached("marrom") ? 1 : 0) + (reached("rajada") ? 1 : 0),
    offensiveTech: reached("roxa") ? 2 : 0,
    defensiveTech: reached("verde") ? 2 : 0,
  };
}

/** Dados calculados uma vez e compartilhados pelas seções da ficha */
interface ForumContext {
  char: Character;
  budget: GemBudgetResult;
  am: AMForumBonuses;
}

function sumBreakdown(budget: GemBudgetResult, categories: string[]): number {
  return budget.breakdown
    .filter(b => categories.includes(b.category))
    .reduce((s, b) => s + b.cost, 0);
}

function renderGeneralInfo({ char, budget }: ForumContext, ln: LineFn): void {
  ln(`<div class="post"><t>1 | Informações gerais</t>`);
  ln();
  ln(`${BOX}<e>Nome: </e>${char.name}.`);
  ln(`<e>Idade: </e>[PREENCHER].`);
  ln(`<e>Raça: </e>${raceForumLabel(char.race)}.`);
  ln(`<e>Localização: </e>${LOCATION_LABELS[char.location] ?? char.location}.`);
  ln(`<e>Alcunha: </e>[PREENCHER].`);
  if (char.faction) {
    ln(`<e>Facção: </e>${FACTIONS[char.faction.type]?.singularName ?? char.faction.type}.`);
    ln(`<e>Recompensa / Patente / Cargo / Rank: </e>${getFactionLabel(char.faction.type, char.faction.rank)}.`);
  } else {
    ln(`<e>Facção: </e>Aventureiro.`);
    ln(`<e>Recompensa / Patente / Cargo / Rank: </e>Aventureiro.`);
  }
  ln(`</div>`);
  ln();

  ln(`${BOX}<e>Nível: </e>${pad2(char.level)}`);
  ln(`<e>Experiência (XP): </e>[PREENCHER]`);
  ln(`<e>Gemas Totais: </e>${budget.total}`);
  ln(`<e>Gemais Gastas: </e>${budget.spent}`);
  ln(`<e>Gemas Atuais: </e>${budget.remaining}`);
  ln(`<e>Prestígio:  </e>${pad2(char.faction?.prestige ?? 0)}`);
  ln(`</div>`);
  ln();
}

/** "+2 PRE, +1 Percepção, +1 Furtividade (Zoan)" */
function racialGainsLabel(char: Character): string {
  const parts: string[] = [];
  for (const attr of ATTR_KEYS) {
    const value = char.racialBonus[attr] ?? 0;
    if (value) parts.push(`+${value} ${ATTR_SHORT_LABELS[attr]}`);
  }
  const racialPericiaId = char.race === "human" ? char.humanPericiaChoice : RACE_PERICIA_BONUS[char.race];
  if (racialPericiaId) parts.push(`+1 ${PERICIAS[racialPericiaId].name}`);
  if (char.akuma?.type === "zoan") {
    const zoanPericiaId = ZOAN_CLASS_PERICIA_BONUS[char.akuma.animalClass];
    if (zoanPericiaId) parts.push(`+1 ${PERICIAS[zoanPericiaId].name} (Zoan)`);
  }
  return parts.length > 0 ? parts.join(", ") : "Nenhum";
}

function renderAttributes({ char, budget, am }: ForumContext, ln: LineFn): void {
  const sectionCost = sumBreakdown(budget, ["Energia", "Profissão"]);
  ln(`<t>2 | Atributos e afins${sectionCost > 0 ? ` (${sectionCost} gemas)` : ""}</t>`);
  ln();
  const base = baseAttributes(char, false);
  const raceName = raceForumLabel(char.race);
  const attr = (key: AttrKey) => attrDisplay(base[key], char.racialBonus[key] ?? 0, raceName, am.stats[key] ?? 0);
  ln(`${BOX}<e>Poder (PDR): </e>${attr("power")}`);
  ln(`<e>Precisão (PRE): </e>${attr("precision")}`);
  ln(`<e>Defesa (DEF): </e>${attr("defense")}`);
  ln(`<e>Constituição (CON) </e>${attr("constitution")}`);
  ln(`<e>Energia (EN): </e>${characterMaxEnergy(char)}`);
  ln(`<e>Bônus por Nível: </e>${bpn(char.level)}`);
  ln(`<e>Ganhos raciais: </e>${racialGainsLabel(char)}.`);
  ln();
  if (char.professions && char.professions.length > 0) {
    ln(`<e>Profissões:</e> </e>`);
    for (const prof of char.professions) {
      ln(`- ${prof.name} (${GEM_COSTS.profession} gemas)`);
    }
  } else {
    ln(`<e>Profissões:</e> </e>Nenhuma.`);
  }
  ln(`</div>`);
  ln();
}

function renderPericias({ char }: ForumContext, ln: LineFn): void {
  const extras = computePericiaBonuses(char);
  ln(`<t>3 | Perícias</t>`);
  ln();
  ln(BOX);
  for (const id of Object.keys(PERICIAS) as PericiaId[]) {
    const extrasStr = (extras[id] ?? []).map(e => ` +${e.value} [${e.label}]`).join("");
    ln(`<e>${PERICIAS[id].name}: </e>${pad2(char.pericias?.[id] ?? 0)}${extrasStr}`);
  }
  ln(`</div>`);
  ln();
}

function renderTechniques({ char, am }: ForumContext, ln: LineFn): void {
  if (char.techniques.length === 0) return;
  const totalCost = char.techniques
    .filter(t => t.source === "purchased")
    .reduce((s, t) => s + (TECHNIQUE_RANKS[t.rank]?.gemCost ?? 0), 0);

  ln(`<t>4 | Técnicas (${totalCost} gemas)</t>`);
  ln();
  ln(BOX);
  for (const rank of ["E", "D", "C", "B", "A"] as const) {
    const rankTechs = char.techniques.filter(t => t.rank === rank);
    if (rankTechs.length === 0) continue;
    ln(`<e>Rank ${rank}</e>`);
    for (const tech of rankTechs) {
      const costStr = tech.source && tech.source !== "purchased"
        ? `Concedida por ${TECHNIQUE_SOURCE_LABELS[tech.source]}.`
        : `${TECHNIQUE_RANKS[rank].gemCost} gemas.`;
      const amTechBonus = tech.type === "offensive" ? am.offensiveTech : am.defensiveTech;
      ln(`[b]Nome:[/b] ${tech.name}`);
      ln(`[b]Descrição:[/b] ${tech.description || "[PREENCHER]"}`);
      ln(`[b]Custo:[/b] ${costStr}`);
      ln(`[b]Efeito:[/b] ${bonusWithAM(tech.baseBonus, amTechBonus, attrLabel(tech.targetAttr))}.`);
      ln(`[b]Energia:[/b] ${tech.energyCost}.`);
      ln();
    }
  }
  ln(`</div>`);
  ln();
}

function renderAkuma(akuma: AkumaNoMi, charName: string, ln: LineFn): void {
  const cost = GEM_COSTS.akumaTotal[akuma.rank] ?? 0;
  ln(`${BOX}<d>Akuma no Mi — ${akuma.name} (${AKUMA_TYPE_LABELS[akuma.type] ?? akuma.type} Rank ${akuma.rank} — ${cost} gemas)</d>`);
  ln();
  const table = akuma.type === "zoan"  ? formatZoanTable(akuma, charName)
              : akuma.type === "logia" ? formatLogiaTable(akuma, charName)
              : formatParameciaTable(akuma, charName);
  for (const line of table) ln(line);
  ln();
  ln(`</div>`);
  ln();
}

function renderCyborg(cyborg: CyborgPath, ln: LineFn): void {
  if (cyborg.shifts.length === 0) return;
  ln(BOX);
  for (const shift of cyborg.shifts) {
    const location = CYBORG_LOCATIONS_BY_ID[shift.location];
    ln(`<d>Ciborgue</d>`);
    ln(`[b]Nome: [/b]${shift.name || "[PREENCHER]"}.`);
    ln(`[b]Descrição: [/b]${shift.description || "[PREENCHER]"}.`);
    ln(`[b]Local: [/b]${location?.label ?? shift.location}.`);
    ln(`[b]Bônus: [/b]${location ? cyborgBonusLabel(shift.location) : "[PREENCHER]"}.`);
    if (shift.bugigangaId) ln(`[b]Bugiganga: [/b]${shift.bugigangaId}.`);
    ln();
  }
  if (cyborg.shift3Bonus) {
    ln(`[b]Bônus do Shift 3: [/b]${cyborg.shift3Bonus === "energy" ? `+${CYBORG_ENERGY_BONUS} de Energia` : "+2 Técnicas Rank A"}.`);
  }
  if (cyborg.gear) ln(`[b]Gear: [/b]${cyborg.gear}.`);
  ln(`</div>`);
  ln();
}

function renderHakiStage(type: PrimaryHakiType, stage: number, cost: number, ln: LineFn): void {
  const stages = type === "armament" ? HAKI_ARMAMENT_STAGES : HAKI_OBSERVATION_STAGES;
  const data = stage > 0 ? stages[stage - 1] : null;
  ln(`<d>Haki ${HAKI_TYPE_NAMES[type].withArticle}</d>`);
  ln(`[b]Nível: [/b]${pad2(stage)}`);
  ln(`[b]Aventuras: [/b]00/02`);
  ln(`[b]Custo: [/b]${cost} gemas.`);
  if (data) {
    const bonusStr = Object.entries(data.bonus).map(([k, v]) => `+${v} ${attrLabel(k)}`).join(", ");
    ln(`[b]Bônus: [/b]${bonusStr}.`);
    ln(`[b]Gasto de energia: [/b]${data.energyCostPerTurn} por turno.`);
    ln(`[b]Efeito interpretativo: [/b]${data.description}`);
  }
  ln();
}

function renderHaki(haki: HakiPath, ln: LineFn): void {
  ln(BOX);
  const primaryStage = hakiStageNum(haki.primaryStage);
  const secondaryStage = hakiStageNum(haki.secondaryStage, 0);
  renderHakiStage(haki.primaryType, primaryStage, primaryStage * GEM_COSTS.haki.stageBase, ln);
  if (secondaryStage > 0) renderHakiStage(haki.secondaryType, secondaryStage, 0, ln);

  if (haki.hasKing) {
    const isAdvanced = haki.kingStage === "advanced";
    ln(`<d>Haki do Rei</d>`);
    ln(`[b]Nível: [/b]${isAdvanced ? "Avançado" : "Controlado"}`);
    ln(`[b]Custo: [/b]${GEM_COSTS.haki.king + (isAdvanced ? GEM_COSTS.haki.kingAdvanced : 0)} gemas.`);
    ln(`[b]Bônus: [/b]${isAdvanced ? "Infunde o Rei nas técnicas — adiciona Ambição ao bônus de todas as técnicas enquanto ativo." : "+4 de Persuasão."}`);
    ln(`[b]Gasto de energia: [/b]5 por turno.`);
    ln(`[b]Efeito interpretativo: [/b]${isAdvanced ? "Relâmpagos negros emanam do usuário. Dano sem contato físico." : "Desmaia alvos com 5 níveis a menos. Resistentes ficam sem ação de ataque por 2 turnos."}`);
    ln();
  }

  ln(`</div>`);
  ln();
}

function renderArtesMarciais(am: ArtesMarciais, budget: GemBudgetResult, ln: LineFn): void {
  const faixa = am.currentFaixa;
  if (!faixa) return;
  ln(`${BOX}<d>Artes Marciais</d>`);
  ln(`[b]Faixa: [/b]${faixaForumLabel(faixa)}.`);
  ln(`[b]Custo: [/b]${sumBreakdown(budget, ["Artes Marciais"])} gemas.`);
  if (am.laranjaChoice) {
    ln(`[b]Escolha Laranja: [/b]${am.laranjaChoice === "unique_weapon" ? "Arma Única" : "2 Técnicas Rank A"}.`);
  }
  ln(`[b]Bônus acumulados: [/b]`);
  for (const f of faixasUpTo(faixa)) {
    ln(`- Faixa ${faixaForumLabel(f.id)}: ${f.bonusLines.join("; ")}`);
  }
  ln(`</div>`);
  ln();
}

function renderCaminhos({ char, budget }: ForumContext, ln: LineFn): void {
  const hasCaminho = !!(char.akuma || char.cyborg || char.haki || char.artesMarciais?.currentFaixa);
  if (!hasCaminho) return;
  ln(`<t>5 | Caminhos (${sumBreakdown(budget, ["Akuma no Mi", "Haki", "Artes Marciais", "Ciborgue"])} gemas)</t>`);
  ln();
  if (char.akuma)         renderAkuma(char.akuma, char.name, ln);
  if (char.cyborg)        renderCyborg(char.cyborg, ln);
  if (char.haki)          renderHaki(char.haki, ln);
  if (char.artesMarciais) renderArtesMarciais(char.artesMarciais, budget, ln);
}

function renderEquipment({ char, budget, am }: ForumContext, ln: LineFn): void {
  const fromLaranja = isUniqueWeaponFromLaranja(char);
  const equipCost = fromLaranja ? 0 : sumBreakdown(budget, ["Arma Única"]);
  ln(`<t>6 | Itens e Equipamentos${equipCost > 0 ? ` (${equipCost} gemas)` : ""}</t>`);
  ln();
  ln(`${BOX}<e>Berries: </e>${formatBerries(200_000)}.`);
  ln();

  const weapon = char.equippedWeapon;
  if (weapon) {
    const uniqueData = isUniqueWeapon(weapon) ? UNIQUE_WEAPONS[weapon.characteristic] : null;
    const baseBonus = bonusWithAM(weapon.bonusValue ?? 0, am.weapon, attrLabel(weapon.bonusAttr));
    ln(`<e>Equipamentos Ofensivos</e>`);
    ln(`[b]Nome: [/b]${weapon.name}.`);
    ln(`[b]Qualidade: [/b]${QUALITY_LABELS[weapon.quality] ?? weapon.quality}.`);
    ln(`[b]Bônus: [/b]${uniqueData ? `${baseBonus}; ${uniqueData.effect}` : baseBonus}.`);
    if (uniqueData) ln(`[b]Custo: [/b]${fromLaranja ? "Concedida via Faixa Laranja." : `${GEM_COSTS.uniqueWeapon} gemas.`}`);
    ln(`[b]Valor: [/b]${formatBerriesOr(EQUIPMENT_PRICES.weapon[weapon.quality])}.`);
    ln(`[b]Descrição: [/b]${weapon.description || "[PREENCHER]"}.`);
    if (uniqueData) ln(`[b]Característica Única: [/b]${uniqueData.name}.`);
    ln();
  }

  const defensives = char.equippedDefensive.filter((item): item is Equipment => !!item);
  if (defensives.length > 0) {
    ln(`<e>Equipamentos Defensivos</e>`);
    for (const item of defensives) {
      ln(`[b]Nome: [/b]${item.name}.`);
      ln(`[b]Qualidade: [/b]${QUALITY_LABELS[item.quality] ?? item.quality}.`);
      ln(`[b]Bônus: [/b]${bonusWithAM(item.bonusValue ?? 0, am.defensiveItem, attrLabel(item.bonusAttr))}.`);
      ln(`[b]Valor: [/b]${formatBerriesOr(EQUIPMENT_PRICES.defensive[item.quality])}.`);
      ln(`[b]Descrição: [/b]${item.description || "[PREENCHER]"}.`);
      ln();
    }
  }

  ln(`</div>`);
  ln();
}

/** Seções 7 e 8: campos de texto livre que o jogador preenche no fórum */
function renderSocialAndHistory(ln: LineFn): void {
  ln(`<t>7 | Social e histórico</t>`);
  ln();
  for (const title of ["Aparência", "Personalidade", "História"]) {
    ln(`${BOX}<d>${title}</d>`);
    ln(`[PREENCHER]`);
    ln(`</div>`);
    ln();
  }

  ln(`<t>8 | Histórico</t>`);
  ln();
  ln(`${BOX}<e>Aventuras: </e>[PREENCHER]`);
  ln();
  ln(`<e>Narração: </e>[PREENCHER]`);
  ln();
  ln(`<e>Eventos e Extras: </e>[PREENCHER]`);
}

export function exportToForumHTML(char: Character): string {
  const ctx: ForumContext = { char, budget: computeGemBudget(char), am: amForumBonuses(char) };
  const { lines, ln } = createLineBuilder();

  ln(`[dohtml] <div id="BNWPOSTOFICIAL"><br><br>`);
  ln();
  ln(`<div class="toptitle">${char.name}</div><br>`);
  ln();
  ln(`<img src="[URL DA IMAGEM]" width="500px" height="279px"/></img><br>`);
  ln();

  renderGeneralInfo(ctx, ln);
  renderAttributes(ctx, ln);
  renderPericias(ctx, ln);
  renderTechniques(ctx, ln);
  renderCaminhos(ctx, ln);
  renderEquipment(ctx, ln);
  renderSocialAndHistory(ln);

  ln(`</div></div><div class="versao">STAFF BNW 2022</div></div>[/dohtml]`);
  return lines.join("\n");
}

export function downloadCharacterForumHTML(char: Character): void {
  downloadText(exportToForumHTML(char), `${slugify(char.name)}_ficha.txt`);
}
