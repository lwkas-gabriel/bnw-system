import type { Character, PericiaId, ZoanAkuma, LogiaAkuma, ParameciaAkuma } from "../../../shared/types/character";
import { bpn, characterMaxEnergy } from "./attrCalc";
import { computeGemBudget, GEM_COSTS } from "./gemBudget";
import { hakiStageNum } from "./haki";
import { HAKI_ARMAMENT_STAGES, HAKI_OBSERVATION_STAGES } from "../../../data/haki";
import { UNIQUE_WEAPONS } from "../../../data/uniqueWeapons";
import { RACE_PERICIA_BONUS, ZOAN_CLASS_PERICIA_BONUS } from "../../../data/pericias";
import { BUGIGANGAS } from "../../../data/bugigangas";
import { PARAMECIA_MODULES, ZOAN_MODULES } from "../../../data/akumaModules";
import { getFactionLabel } from "../../../data/factions";

// ─── JSON export ──────────────────────────────────────────────────────────────

export interface ExportedCharacter {
  /** Schema version for forward-compatibility */
  _version: "1.0";
  _exportedAt: string;
  _system: "bnw-character-system";
  character: Character;
}

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
  const json = exportToJSONString(char);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${char.name.replace(/\s+/g, "_").toLowerCase()}_ficha.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function attrLabel(key: string): string {
  return ({ power: "POD", precision: "PRE", defense: "DEF", constitution: "CON" })[key] ?? key;
}

function qualityLabel(q: string): string {
  return ({ common: "Comum", splendid: "Esplêndido", legendary: "Lendário" })[q] ?? q;
}

const OFFENSIVE_PRICE: Record<string, string> = {
  common:    "B$ 500.000",
  splendid:  "B$ 10.000.000",
  legendary: "B$ 80.000.000",
};

const DEFENSIVE_PRICE: Record<string, string> = {
  common:    "B$ 500.000",
  splendid:  "B$ 5.000.000",
  legendary: "B$ 40.000.000",
};

const RACE_LABELS: Record<string, string> = {
  human: "Humano", fishman: "Tritão", siren: "Sireno", lunar: "Lunar",
  mink: "Mink", dwarf: "Anão", giant: "Gigante", half_giant: "Meio-Gigante",
};

const LOCATION_LABELS: Record<string, string> = {
  blues: "Blues", grand_line: "Grand Line", new_world: "New World",
};

const FACTION_LABELS: Record<string, string> = {
  pirata: "Pirata", marinha: "Marinha", cacador: "Caçador de Recompensas",
  governo: "Governo", revolucionario: "Revolucionário",
};

const HAKI_TYPE_LABELS: Record<string, string> = {
  armament: "do Armamento", observation: "da Observação",
};

const CYBORG_LOCATION_LABELS: Record<string, string> = {
  head: "Cabeça", right_arm: "Braço Direito", left_arm: "Braço Esquerdo",
  right_leg: "Perna Direita", left_leg: "Perna Esquerda", torso: "Tronco",
};

const CYBORG_LOCATION_BONUS: Record<string, string> = {
  head: "+4 PRE", right_arm: "+4 POD", left_arm: "+4 POD",
  right_leg: "+4 DEF", left_leg: "+4 DEF", torso: "+4 CON",
};

const FAIXA_LABELS: Record<string, string> = {
  branca: "Branca", cinza: "Cinza", azul_clara: "Azul Clara", azul_escura: "Azul Escura",
  amarela: "Amarela", laranja: "Laranja", verde: "Verde", roxa: "Roxa", marrom: "Marrom",
  preta: "Preta", coral: "Coral", rajada: "Rajada", vermelha: "Vermelha", grao_mestre: "Grão Mestre",
};

const AKUMA_TYPE_LABELS: Record<string, string> = {
  zoan: "Zoan", logia: "Logia", paramecia: "Paramecia",
};

const TECH_COSTS: Record<string, number> = { E: 6, D: 7, C: 8, B: 9, A: 10 };

const TECH_SOURCE_LABELS: Record<string, string> = {
  akuma: "Akuma no Mi", haki: "Haki", artes_marciais: "Artes Marciais", ciborgue: "Ciborgue",
};

// Accumulated bonuses up to and including each faixa
const FAIXA_ORDER: import("../../../shared/types/character").AMFaixaId[] = [
  "branca", "cinza", "azul_clara", "azul_escura", "amarela",
  "laranja", "verde", "roxa", "marrom",
  "preta", "coral", "rajada", "vermelha", "grao_mestre",
];

const FAIXA_BONUS_LINES: Record<string, string[]> = {
  branca:      ["+2 de bônus na arma equipada"],
  cinza:       ["+2 de bônus na arma equipada", "+2 de Precisão"],
  azul_clara:  ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa"],
  azul_escura: ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa", "+2 de Poder"],
  amarela:     ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa", "+2 de Poder", "+2 de Constituição"],
  laranja:     ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa", "+2 de Poder", "+2 de Constituição",
                "+1 em todos os itens defensivos", "2 Técnicas Rank A ou 1 Arma Única Comum"],
  verde:       ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa", "+2 de Poder", "+2 de Constituição",
                "+1 em todos os itens defensivos", "2 Técnicas Rank A ou 1 Arma Única Comum",
                "+2 de bônus em técnicas defensivas"],
  roxa:        ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa", "+2 de Poder", "+2 de Constituição",
                "+1 em todos os itens defensivos", "2 Técnicas Rank A ou 1 Arma Única Comum",
                "+2 de bônus em técnicas defensivas", "+2 de bônus em técnicas ofensivas"],
  marrom:      ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa", "+2 de Poder", "+2 de Constituição",
                "+1 em todos os itens defensivos", "2 Técnicas Rank A ou 1 Arma Única Comum",
                "+2 de bônus em técnicas defensivas", "+2 de bônus em técnicas ofensivas",
                "+1 em todos os itens defensivos", "1 Técnica Rank A"],
  preta:       ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa", "+2 de Poder", "+2 de Constituição",
                "+1 em todos os itens defensivos", "2 Técnicas Rank A ou 1 Arma Única Comum",
                "+2 de bônus em técnicas defensivas", "+2 de bônus em técnicas ofensivas",
                "+1 em todos os itens defensivos", "1 Técnica Rank A",
                "Pode equipar uma arma extra"],
  coral:       ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa", "+2 de Poder", "+2 de Constituição",
                "+1 em todos os itens defensivos", "2 Técnicas Rank A ou 1 Arma Única Comum",
                "+2 de bônus em técnicas defensivas", "+2 de bônus em técnicas ofensivas",
                "+1 em todos os itens defensivos", "1 Técnica Rank A",
                "Pode equipar uma arma extra", "+2 de bônus na arma extra"],
  rajada:      ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa", "+2 de Poder", "+2 de Constituição",
                "+1 em todos os itens defensivos", "2 Técnicas Rank A ou 1 Arma Única Comum",
                "+2 de bônus em técnicas defensivas", "+2 de bônus em técnicas ofensivas",
                "+1 em todos os itens defensivos", "1 Técnica Rank A",
                "Pode equipar uma arma extra", "+2 de bônus na arma extra",
                "+1 de bônus nos equipamentos defensivos"],
  vermelha:    ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa", "+2 de Poder", "+2 de Constituição",
                "+1 em todos os itens defensivos", "2 Técnicas Rank A ou 1 Arma Única Comum",
                "+2 de bônus em técnicas defensivas", "+2 de bônus em técnicas ofensivas",
                "+1 em todos os itens defensivos", "1 Técnica Rank A",
                "Pode equipar uma arma extra", "+2 de bônus na arma extra",
                "+1 de bônus nos equipamentos defensivos",
                "+2 em POD/PRE/DEF/CON por 2 de energia (escolha por turno)"],
  grao_mestre: ["+2 de bônus na arma equipada", "+2 de Precisão", "+2 de Defesa", "+2 de Poder", "+2 de Constituição",
                "+1 em todos os itens defensivos", "2 Técnicas Rank A ou 1 Arma Única Comum",
                "+2 de bônus em técnicas defensivas", "+2 de bônus em técnicas ofensivas",
                "+1 em todos os itens defensivos", "1 Técnica Rank A",
                "Pode equipar uma arma extra", "+2 de bônus na arma extra",
                "+1 de bônus nos equipamentos defensivos",
                "+2 em POD/PRE/DEF/CON por 2 de energia (escolha por turno)",
                "+2 em ataque por 3 de energia OU -2 no ataque do oponente por 3 de energia"],
};

const PERICIAS_LABELS: Record<PericiaId, string> = {
  ambicao: "Ambição", atletismo: "Atletismo", destreza: "Destreza",
  erudicao: "Erudição", expressao: "Expressão", furtividade: "Furtividade",
  investigacao: "Investigação", logica: "Lógica",
  percepcao: "Percepção", persuasao: "Persuasão", sobrevivencia: "Sobrevivência",
};

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

// ─── Pericia bonus aggregator ─────────────────────────────────────────────────

function computePericiaExtras(char: Character): Partial<Record<PericiaId, Array<{ label: string; value: number }>>> {
  const result: Partial<Record<PericiaId, Array<{ label: string; value: number }>>> = {};

  function add(pericia: PericiaId | undefined | null, label: string, value: number) {
    if (!pericia) return;
    (result[pericia] ??= []).push({ label, value });
  }

  // Racial / human choice
  if (char.race === "human") {
    add(char.humanPericiaChoice, "Raça: Humano", 1);
  } else {
    add(RACE_PERICIA_BONUS[char.race] as PericiaId | undefined, `Raça: ${RACE_LABELS[char.race] ?? char.race}`, 1);
  }

  // Zoan class bonus
  if (char.akuma?.type === "zoan") {
    const animalClass = (char.akuma as any).animalClass as string;
    add(ZOAN_CLASS_PERICIA_BONUS[animalClass], "Zoan", 1);
  }

  // Cyborg shift bugigangas (referenced by ID)
  for (const shift of char.cyborg?.shifts ?? []) {
    if (!shift.bugigangaId) continue;
    const bug = BUGIGANGAS.find(b => b.id === shift.bugigangaId);
    if (bug?.periciaBonus) add(bug.periciaBonus.pericia, `Bugiganga: ${bug.name}`, bug.periciaBonus.value);
  }

  // Equipment bugigangas (embedded)
  const allEquip = [char.equippedWeapon, ...char.equippedDefensive].filter(Boolean);
  for (const eq of allEquip) {
    const pb = (eq as any)?.bugiganga?.periciaBonus as { pericia: PericiaId; value: number; name?: string } | undefined;
    const bugName = (eq as any)?.bugiganga?.name as string | undefined;
    if (pb) add(pb.pericia, `Bugiganga: ${bugName ?? "Bugiganga"}`, pb.value);
  }

  return result;
}

// ─── Forum HTML export (dohtml) ───────────────────────────────────────────────

export function exportToForumHTML(char: Character): string {
  const charBPN = bpn(char.level);
  const energy  = characterMaxEnergy(char);
  const budget  = computeGemBudget(char);

  // ── Artes Marciais passive bonuses ───────────────────────────────────────────
  const amIdx = char.artesMarciais?.currentFaixa
    ? FAIXA_ORDER.indexOf(char.artesMarciais.currentFaixa) : -1;
  const amAtIdx = (f: typeof FAIXA_ORDER[number]) => amIdx >= FAIXA_ORDER.indexOf(f);
  const amPow  = amAtIdx("azul_escura") ? 2 : 0;
  const amPre  = amAtIdx("cinza")       ? 2 : 0;
  const amDef  = amAtIdx("azul_clara")  ? 2 : 0;
  const amCon  = amAtIdx("amarela")     ? 2 : 0;
  const amWeaponBonus  = amAtIdx("branca") ? 2 : 0;
  const amDefItemBonus = (amAtIdx("laranja") ? 1 : 0) + (amAtIdx("marrom") ? 1 : 0) + (amAtIdx("rajada") ? 1 : 0);
  const amOffTechBonus = amAtIdx("roxa")  ? 2 : 0;
  const amDefTechBonus = amAtIdx("verde") ? 2 : 0;

  const racialPow = char.racialBonus.power        ?? 0;
  const racialPre = char.racialBonus.precision    ?? 0;
  const racialDef = char.racialBonus.defense      ?? 0;
  const racialCon = char.racialBonus.constitution ?? 0;
  const basePow = 1 + char.investedAttributes.power;
  const basePre = 1 + char.investedAttributes.precision;
  const baseDef = 1 + char.investedAttributes.defense;
  const baseCon = 3 + char.investedAttributes.constitution;

  const periciaExtras = computePericiaExtras(char);

  const racialParts: string[] = [];
  if (racialPow) racialParts.push(`+${racialPow} POD`);
  if (racialPre) racialParts.push(`+${racialPre} PRE`);
  if (racialDef) racialParts.push(`+${racialDef} DEF`);
  if (racialCon) racialParts.push(`+${racialCon} CON`);
  // Racial/human/zoan pericia bonus
  const racialPericiaId = char.race === "human" ? char.humanPericiaChoice : (RACE_PERICIA_BONUS[char.race] as PericiaId | undefined);
  if (racialPericiaId) racialParts.push(`+1 ${PERICIAS_LABELS[racialPericiaId]}`);
  if (char.akuma?.type === "zoan") {
    const zoanPericiaId = ZOAN_CLASS_PERICIA_BONUS[(char.akuma as any).animalClass] as PericiaId | undefined;
    if (zoanPericiaId) racialParts.push(`+1 ${PERICIAS_LABELS[zoanPericiaId]} (Zoan)`);
  }
  const racialStr = racialParts.length > 0 ? racialParts.join(", ") : "Nenhum";

  const techTotalCost = char.techniques
    .filter(t => t.source === "purchased")
    .reduce((s, t) => s + (TECH_COSTS[t.rank] ?? 0), 0);

  const caminhoCost = budget.breakdown
    .filter(b => ["Akuma no Mi", "Haki", "Artes Marciais", "Ciborgue"].includes(b.category))
    .reduce((s, b) => s + b.cost, 0);

  const LARANJA_IDX_EXP = FAIXA_ORDER.indexOf("laranja");
  const currentFaixaIdxExp = char.artesMarciais?.currentFaixa
    ? FAIXA_ORDER.indexOf(char.artesMarciais.currentFaixa) : -1;
  const isUniqueFromLaranja = !!(
    char.equippedWeapon &&
    "characteristic" in char.equippedWeapon &&
    currentFaixaIdxExp >= LARANJA_IDX_EXP &&
    char.artesMarciais?.laranjaChoice !== "techniques"
  );
  const equipCost = isUniqueFromLaranja ? 0 : budget.breakdown
    .filter(b => b.category === "Arma Única")
    .reduce((s, b) => s + b.cost, 0);

  const hasCaminho = !!(char.akuma || char.cyborg || char.haki || char.artesMarciais?.currentFaixa);

  const L: string[] = [];
  const ln = (...parts: string[]) => L.push(parts.join(""));

  // ── Wrapper
  ln(`[dohtml] <div id="BNWPOSTOFICIAL"><br><br>`);
  ln();
  ln(`<div class="toptitle">${char.name}</div><br>`);
  ln();
  ln(`<img src="[URL DA IMAGEM]" width="500px" height="279px"/></img><br>`);
  ln();
  ln(`<div class="post"><t>1 | Informações gerais</t>`);
  ln();

  // ── Seção 1 — Info Geral
  ln(`<div style=" border: 1px solid; padding: 10px; "><e>Nome: </e>${char.name}.`);
  ln(`<e>Idade: </e>[PREENCHER].`);
  ln(`<e>Raça: </e>${RACE_LABELS[char.race] ?? char.race}.`);
  ln(`<e>Localização: </e>${LOCATION_LABELS[char.location] ?? char.location}.`);
  ln(`<e>Alcunha: </e>[PREENCHER].`);
  if (char.faction) {
    ln(`<e>Facção: </e>${FACTION_LABELS[char.faction.type] ?? char.faction.type}.`);
    ln(`<e>Recompensa / Patente / Cargo / Rank: </e>${getFactionLabel(char.faction.type, char.faction.rank)}.`);
  } else {
    ln(`<e>Facção: </e>Aventureiro.`);
    ln(`<e>Recompensa / Patente / Cargo / Rank: </e>Aventureiro.`);
  }
  ln(`</div>`);
  ln();

  ln(`<div style=" border: 1px solid; padding: 10px; "><e>Nível: </e>${String(char.level).padStart(2, "0")}`);
  ln(`<e>Experiência (XP): </e>[PREENCHER]`);
  ln(`<e>Gemas Totais: </e>${budget.total}`);
  ln(`<e>Gemais Gastas: </e>${budget.spent}`);
  ln(`<e>Gemas Atuais: </e>${budget.remaining}`);
  ln(`<e>Prestígio:  </e>${String(char.faction?.prestige ?? 0).padStart(2, "0")}`);
  ln(`</div>`);
  ln();

  // ── Seção 2 — Atributos
  const attrSectionCost = budget.breakdown
    .filter(b => b.category === "Energia" || b.category === "Profissão")
    .reduce((s, b) => s + b.cost, 0);
  const attrSectionLabel = attrSectionCost > 0
    ? `2 | Atributos e afins (${attrSectionCost} gemas)`
    : `2 | Atributos e afins`;
  ln(`<t>${attrSectionLabel}</t>`);
  ln();
  const raceName = RACE_LABELS[char.race] ?? char.race;
  ln(`<div style=" border: 1px solid; padding: 10px; "><e>Poder (PDR): </e>${attrDisplay(basePow, racialPow, raceName, amPow)}`);
  ln(`<e>Precisão (PRE): </e>${attrDisplay(basePre, racialPre, raceName, amPre)}`);
  ln(`<e>Defesa (DEF): </e>${attrDisplay(baseDef, racialDef, raceName, amDef)}`);
  ln(`<e>Constituição (CON) </e>${attrDisplay(baseCon, racialCon, raceName, amCon)}`);
  ln(`<e>Energia (EN): </e>${energy}`);
  ln(`<e>Bônus por Nível: </e>${charBPN}`);
  ln(`<e>Ganhos raciais: </e>${racialStr}.`);
  ln();
  if (char.professions && char.professions.length > 0) {
    ln(`<e>Profissões:</e> </e>`);
    for (const prof of char.professions) {
      ln(`- ${prof.name} (10 gemas)`);
    }
  } else {
    ln(`<e>Profissões:</e> </e>Nenhuma.`);
  }
  ln(`</div>`);
  ln();

  // ── Seção 3 — Perícias
  ln(`<t>3 | Perícias</t>`);
  ln();
  ln(`<div style=" border: 1px solid; padding: 10px; ">`);
  for (const id of Object.keys(PERICIAS_LABELS) as PericiaId[]) {
    const value = char.pericias?.[id] ?? 0;
    const extras = periciaExtras[id];
    const extrasStr = extras
      ? extras.map(e => ` +${e.value} [${e.label}]`).join("")
      : "";
    ln(`<e>${PERICIAS_LABELS[id]}: </e>${String(value).padStart(2, "0")}${extrasStr}`);
  }
  ln(`</div>`);
  ln();

  // ── Seção 4 — Técnicas (condicional)
  if (char.techniques.length > 0) {
    ln(`<t>4 | Técnicas (${techTotalCost} gemas)</t>`);
    ln();
    ln(`<div style=" border: 1px solid; padding: 10px; ">`);
    for (const rank of ["E", "D", "C", "B", "A"]) {
      const rankTechs = char.techniques.filter(t => t.rank === rank);
      if (rankTechs.length === 0) continue;
      ln(`<e>Rank ${rank}</e>`);
      for (const tech of rankTechs) {
        const costStr = tech.source && tech.source !== "purchased"
          ? `Concedida por ${TECH_SOURCE_LABELS[tech.source] ?? tech.source}.`
          : `${TECH_COSTS[rank] ?? 0} gemas.`;
        ln(`[b]Nome:[/b] ${tech.name}`);
        ln(`[b]Descrição:[/b] ${tech.description || "[PREENCHER]"}`);
        ln(`[b]Custo:[/b] ${costStr}`);
        const amTechBonus = tech.type === "offensive" ? amOffTechBonus : amDefTechBonus;
        ln(`[b]Efeito:[/b] ${bonusWithAM(tech.baseBonus, amTechBonus, attrLabel(tech.targetAttr))}.`);
        ln(`[b]Energia:[/b] ${tech.energyCost}.`);
        ln();
      }
    }
    ln(`</div>`);
    ln();
  }

  // ── Seção 5 — Caminhos (condicional)
  if (hasCaminho) {
    ln(`<t>5 | Caminhos (${caminhoCost} gemas)</t>`);
    ln();

    // Akuma no Mi
    if (char.akuma) {
      const AKUMA_COSTS: Record<string, number> = { C: 30, B: 60, A: 90, S: 140 };
      const akumaCost = AKUMA_COSTS[char.akuma.rank] ?? 0;
      ln(`<div style=" border: 1px solid; padding: 10px; "><d>Akuma no Mi — ${char.akuma.name} (${AKUMA_TYPE_LABELS[char.akuma.type] ?? char.akuma.type} Rank ${char.akuma.rank} — ${akumaCost} gemas)</d>`);
      ln();
      if (char.akuma.type === "zoan")       L.push(...formatZoanTable(char.akuma, char.name));
      else if (char.akuma.type === "logia") L.push(...formatLogiaTable(char.akuma, char.name));
      else                                  L.push(...formatParameciaTable(char.akuma, char.name));
      ln();
      ln(`</div>`);
      ln();
    }

    // Ciborgue
    if (char.cyborg && char.cyborg.shifts.length > 0) {
      ln(`<div style=" border: 1px solid; padding: 10px; ">`);
      for (const shift of char.cyborg.shifts) {
        ln(`<d>Ciborgue</d>`);
        ln(`[b]Nome: [/b]${shift.name || "[PREENCHER]"}.`);
        ln(`[b]Descrição: [/b]${shift.description || "[PREENCHER]"}.`);
        ln(`[b]Local: [/b]${CYBORG_LOCATION_LABELS[shift.location] ?? shift.location}.`);
        ln(`[b]Bônus: [/b]${CYBORG_LOCATION_BONUS[shift.location] ?? "[PREENCHER]"}.`);
        if (shift.bugigangaId) {
          ln(`[b]Bugiganga: [/b]${shift.bugigangaId}.`);
        }
        ln();
      }
      if (char.cyborg.shift3Bonus) {
        ln(`[b]Bônus do Shift 3: [/b]${char.cyborg.shift3Bonus === "energy" ? "+20 de Energia" : "+2 Técnicas Rank A"}.`);
      }
      if (char.cyborg.gear) {
        ln(`[b]Gear: [/b]${char.cyborg.gear}.`);
      }
      ln(`</div>`);
      ln();
    }

    // Haki
    if (char.haki) {
      ln(`<div style=" border: 1px solid; padding: 10px; ">`);
      const pType  = char.haki.primaryType;
      const sType  = char.haki.secondaryType;
      const pStage = hakiStageNum(char.haki.primaryStage);
      const sStage = typeof char.haki.secondaryStage === "number" ? char.haki.secondaryStage : 0;
      const pStages = pType === "armament" ? HAKI_ARMAMENT_STAGES : HAKI_OBSERVATION_STAGES;
      const sStages = sType === "armament" ? HAKI_ARMAMENT_STAGES : HAKI_OBSERVATION_STAGES;
      const pData   = pStage > 0 ? pStages[pStage - 1] : null;
      const sData   = sStage > 0 ? sStages[sStage - 1] : null;

      const hakiBlock = (type: string, stage: number, data: typeof pData, cost: number) => {
        ln(`<d>Haki ${HAKI_TYPE_LABELS[type] ?? type}</d>`);
        ln(`[b]Nível: [/b]${String(stage).padStart(2, "0")}`);
        ln(`[b]Aventuras: [/b]00/02`);
        ln(`[b]Custo: [/b]${cost} gemas.`);
        if (data) {
          const bonusStr = Object.entries(data.bonus)
            .map(([k, v]) => `+${v} ${attrLabel(k)}`)
            .join(", ");
          ln(`[b]Bônus: [/b]${bonusStr}.`);
          ln(`[b]Gasto de energia: [/b]${data.energyCostPerTurn} por turno.`);
          ln(`[b]Efeito interpretativo: [/b]${data.description}`);
        }
        ln();
      };

      hakiBlock(pType, pStage, pData, pStage * GEM_COSTS.haki.stageBase);
      if (sStage > 0) hakiBlock(sType, sStage, sData, 0);

      if (char.haki.hasKing) {
        const isKingAdvanced = char.haki.kingStage === "advanced";
        ln(`<d>Haki do Rei</d>`);
        ln(`[b]Nível: [/b]${isKingAdvanced ? "Avançado" : "Controlado"}`);
        ln(`[b]Custo: [/b]${GEM_COSTS.haki.king + (isKingAdvanced ? GEM_COSTS.haki.advancedPartial : 0)} gemas.`);
        ln(`[b]Bônus: [/b]${isKingAdvanced ? "Infunde o Rei nas técnicas — adiciona Ambição ao bônus de todas as técnicas enquanto ativo." : "+4 de Persuasão."}`);
        ln(`[b]Gasto de energia: [/b]5 por turno.`);
        ln(`[b]Efeito interpretativo: [/b]${isKingAdvanced ? "Relâmpagos negros emanam do usuário. Dano sem contato físico." : "Desmaia alvos com 5 níveis a menos. Resistentes ficam sem ação de ataque por 2 turnos."}`);
        ln();
      }

      ln(`</div>`);
      ln();
    }

    // Artes Marciais
    if (char.artesMarciais?.currentFaixa) {
      const faixa     = char.artesMarciais.currentFaixa;
      const faixaCost = budget.breakdown.find(b => b.category === "Artes Marciais")?.cost ?? 0;
      const bonusLines = FAIXA_BONUS_LINES[faixa] ?? [];
      ln(`<div style=" border: 1px solid; padding: 10px; "><d>Artes Marciais</d>`);
      ln(`[b]Faixa: [/b]${FAIXA_LABELS[faixa] ?? faixa}.`);
      ln(`[b]Custo: [/b]${faixaCost} gemas.`);
      if (char.artesMarciais.laranjaChoice) {
        ln(`[b]Escolha Laranja: [/b]${char.artesMarciais.laranjaChoice === "unique_weapon" ? "Arma Única" : "2 Técnicas Rank A"}.`);
      }
      if (bonusLines.length > 0) {
        ln(`[b]Bônus acumulados: [/b]`);
        for (let i = 0; i < FAIXA_ORDER.length; i++) {
          const f = FAIXA_ORDER[i];
          const label = FAIXA_LABELS[f] ?? f;
          const linhaFaixa = FAIXA_BONUS_LINES[f]?.[i];
          if (!linhaFaixa) break;
          ln(`- Faixa ${label}: ${linhaFaixa}`);
          if (f === faixa) break;
        }
      }
      ln(`</div>`);
      ln();
    }
  }

  // ── Seção 6 — Itens e Equipamentos
  ln(`<t>6 | Itens e Equipamentos${equipCost > 0 ? ` (${equipCost} gemas)` : ""}</t>`);
  ln();
  ln(`<div style=" border: 1px solid; padding: 10px; "><e>Berries: </e>B$ 200.000.`);
  ln();

  if (char.equippedWeapon) {
    const w = char.equippedWeapon as any;
    const uniqueData = w.characteristic ? (UNIQUE_WEAPONS as Record<string, { name: string; effect: string }>)[w.characteristic] : null;
    const baseBonus = bonusWithAM(w.bonusValue ?? 0, amWeaponBonus, attrLabel(w.bonusAttr));
    const bonusStr = uniqueData
      ? `${baseBonus}; ${uniqueData.effect}`
      : baseBonus;
    ln(`<e>Equipamentos Ofensivos</e>`);
    ln(`[b]Nome: [/b]${w.name}.`);
    ln(`[b]Qualidade: [/b]${qualityLabel(w.quality)}.`);
    ln(`[b]Bônus: [/b]${bonusStr}.`);
    if (uniqueData) ln(`[b]Custo: [/b]${isUniqueFromLaranja ? "Concedida via Faixa Laranja." : "20 gemas."}`);
    ln(`[b]Valor: [/b]${OFFENSIVE_PRICE[w.quality] ?? "[PREENCHER]"}.`);
    ln(`[b]Descrição: [/b]${w.description || "[PREENCHER]"}.`);
    if (uniqueData) ln(`[b]Característica Única: [/b]${uniqueData.name}.`);
    ln();
  }

  const defensives = char.equippedDefensive.filter(Boolean);
  if (defensives.length > 0) {
    ln(`<e>Equipamentos Defensivos</e>`);
    for (const item of defensives) {
      if (!item) continue;
      ln(`[b]Nome: [/b]${item.name}.`);
      ln(`[b]Qualidade: [/b]${qualityLabel(item.quality)}.`);
      ln(`[b]Bônus: [/b]${bonusWithAM(item.bonusValue ?? 0, amDefItemBonus, attrLabel(item.bonusAttr))}.`);
      ln(`[b]Valor: [/b]${DEFENSIVE_PRICE[item.quality] ?? "[PREENCHER]"}.`);
      ln(`[b]Descrição: [/b]${(item as any).description || "[PREENCHER]"}.`);
      ln();
    }
  }

  ln(`</div>`);
  ln();

  // ── Seção 7 — Social
  ln(`<t>7 | Social e histórico</t>`);
  ln();
  ln(`<div style=" border: 1px solid; padding: 10px; "><d>Aparência</d>`);
  ln(`[PREENCHER]`);
  ln(`</div>`);
  ln();
  ln(`<div style=" border: 1px solid; padding: 10px; "><d>Personalidade</d>`);
  ln(`[PREENCHER]`);
  ln(`</div>`);
  ln();
  ln(`<div style=" border: 1px solid; padding: 10px; "><d>História</d>`);
  ln(`[PREENCHER]`);
  ln(`</div>`);
  ln();

  // ── Seção 8 — Histórico
  ln(`<t>8 | Histórico</t>`);
  ln();
  ln(`<div style=" border: 1px solid; padding: 10px; "><e>Aventuras: </e>[PREENCHER]`);
  ln();
  ln(`<e>Narração: </e>[PREENCHER]`);
  ln();
  ln(`<e>Eventos e Extras: </e>[PREENCHER]`);
  ln(`</div></div><div class="versao">STAFF BNW 2022</div></div>[/dohtml]`);

  return L.join("\n");
}

export function downloadCharacterForumHTML(char: Character): void {
  const html = exportToForumHTML(char);
  const blob = new Blob([html], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${char.name.replace(/\s+/g, "_").toLowerCase()}_ficha.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
