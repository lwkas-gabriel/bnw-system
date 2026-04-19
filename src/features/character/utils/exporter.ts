import type { Character, PericiaId } from "../../../shared/types/character";
import { bpn } from "./attrCalc";
import { computeGemBudget } from "./gemBudget";
import { HAKI_ARMAMENT_STAGES, HAKI_OBSERVATION_STAGES } from "../../../data/haki";
import { UNIQUE_WEAPONS } from "../../../data/uniqueWeapons";

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
  return ({ common: "Comum", splendid: "Esplêndido", legendary: "Extraordinário" })[q] ?? q;
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

// ─── Forum HTML export (dohtml) ───────────────────────────────────────────────

export function exportToForumHTML(char: Character): string {
  const charBPN = bpn(char.level);
  const energy  = char.level * 3 + char.energy.energyInvested;
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
  const totalPow  = 1 + char.investedAttributes.power        + racialPow + amPow;
  const totalPre  = 1 + char.investedAttributes.precision    + racialPre + amPre;
  const totalDef  = 1 + char.investedAttributes.defense      + racialDef + amDef;
  const totalCon  = 3 + char.investedAttributes.constitution + racialCon + amCon;

  const racialParts: string[] = [];
  if (racialPow) racialParts.push(`+${racialPow} POD`);
  if (racialPre) racialParts.push(`+${racialPre} PRE`);
  if (racialDef) racialParts.push(`+${racialDef} DEF`);
  if (racialCon) racialParts.push(`+${racialCon} CON`);
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
    ln(`<e>Recompensa / Patente / Cargo / Rank: </e>${char.faction.rank}.`);
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
  ln(`<t>2 | Atributos e afins (${budget.spent} gemas)</t>`);
  ln();
  ln(`<div style=" border: 1px solid; padding: 10px; "><e>Poder (PDR): </e>${totalPow}`);
  ln(`<e>Precisão (PRE): </e>${totalPre}`);
  ln(`<e>Defesa (DEF): </e>${totalDef}`);
  ln(`<e>Constituição (CON) </e>${totalCon}`);
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
    ln(`<e>${PERICIAS_LABELS[id]}: </e>${String(value).padStart(2, "0")}`);
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
        ln(`[b]Efeito:[/b] +${tech.baseBonus + amTechBonus} ${attrLabel(tech.targetAttr)}.`);
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
      ln(`<div style=" border: 1px solid; padding: 10px; "><d>Akuma no Mi</d>`);
      ln(`[b]Nome:[/b] ${char.akuma.name}.`);
      ln(`[b]Tipo:[/b] ${AKUMA_TYPE_LABELS[char.akuma.type] ?? char.akuma.type}.`);
      ln(`[b]Rank:[/b] ${char.akuma.rank}.`);
      ln(`[b]Custo:[/b] ${akumaCost} gemas.`);
      ln(`[b]Tabela:[/b] [PREENCHER].`);
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
      const pStage = typeof char.haki.primaryStage   === "number" ? char.haki.primaryStage   : 5;
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

      hakiBlock(pType, pStage, pData, pStage * 20);
      if (sStage > 0) hakiBlock(sType, sStage, sData, 0);

      if (char.haki.hasKing) {
        const isKingAdvanced = char.haki.kingStage === "advanced";
        ln(`<d>Haki do Rei</d>`);
        ln(`[b]Nível: [/b]${isKingAdvanced ? "Avançado" : "Controlado"}`);
        ln(`[b]Custo: [/b]20 gemas.`);
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
    const weaponTotal = (w.bonusValue ?? 0) + amWeaponBonus;
    const bonusStr = uniqueData
      ? `+${weaponTotal} ${attrLabel(w.bonusAttr)}; ${uniqueData.effect}`
      : `+${weaponTotal} ${attrLabel(w.bonusAttr)}`;
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
      ln(`[b]Bônus: [/b]+${(item.bonusValue ?? 0) + amDefItemBonus} ${attrLabel(item.bonusAttr)}.`);
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
