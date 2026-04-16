import type { Character } from "../../../shared/types/character";
import { bpn } from "./attrCalc";
import { computeGemBudget } from "./gemBudget";
import { validateCharacterFull } from "./validator";

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

// ─── Forum text export ────────────────────────────────────────────────────────

function attrLabel(key: string): string {
  const map: Record<string, string> = {
    power: "Poder", precision: "Precisão", defense: "Defesa", constitution: "Constituição",
  };
  return map[key] ?? key;
}

export function exportToForumText(char: Character): string {
  const charBPN   = bpn(char.level);
  const energy    = char.level * 3 + char.energy.energyInvested;
  const budget    = computeGemBudget(char);
  const report    = validateCharacterFull(char);

  const lines: string[] = [];

  lines.push(`╔════════════════════════════════════╗`);
  lines.push(`║  FICHA — ${char.name.toUpperCase().padEnd(26)}║`);
  lines.push(`╚════════════════════════════════════╝`);
  lines.push("");

  // ── Informações gerais
  lines.push("[ INFORMAÇÕES GERAIS ]");
  lines.push(`Nome: ${char.name}`);
  lines.push(`Nível: ${char.level}  |  BPN: ${charBPN}  |  Energia: ${energy}`);
  lines.push(`Raça: ${char.race}  |  Localização: ${char.location}`);
  lines.push(`Gemas: ${budget.spent}/${budget.total}g`);
  lines.push("");

  // ── Atributos
  lines.push("[ ATRIBUTOS ]");
  const racialPow = char.racialBonus.power        ?? 0;
  const racialPre = char.racialBonus.precision    ?? 0;
  const racialDef = char.racialBonus.defense      ?? 0;
  const racialCon = char.racialBonus.constitution ?? 0;
  lines.push(`Poder:        ${1 + char.investedAttributes.power + racialPow}  (1 base + ${racialPow} racial + ${char.investedAttributes.power} investido)`);
  lines.push(`Precisão:     ${1 + char.investedAttributes.precision + racialPre}  (1 base + ${racialPre} racial + ${char.investedAttributes.precision} investido)`);
  lines.push(`Defesa:       ${1 + char.investedAttributes.defense + racialDef}  (1 base + ${racialDef} racial + ${char.investedAttributes.defense} investido)`);
  lines.push(`Constituição: ${3 + char.investedAttributes.constitution + racialCon}  (3 base + ${racialCon} racial + ${char.investedAttributes.constitution} investido)`);
  lines.push(`Ambição: ${char.ambition}`);
  lines.push("");

  // ── Haki
  if (char.haki) {
    lines.push("[ HAKI ]");
    const pType = char.haki.primaryType === "armament" ? "Armamento" : "Observação";
    const sType = char.haki.secondaryType === "armament" ? "Armamento" : "Observação";
    const pStage = typeof char.haki.primaryStage === "number" ? char.haki.primaryStage : 5;
    const sStage = typeof char.haki.secondaryStage === "number" ? char.haki.secondaryStage : 0;
    lines.push(`${pType} (Primário): Estágio ${pStage}`);
    if (sStage > 0) lines.push(`${sType} (Secundário, Gratuito): Estágio ${sStage}`);
    if (char.haki.hasKing) {
      lines.push(`Haki do Rei: ${char.haki.kingStage === "advanced" ? "Avançado" : "Controlado"}`);
      if (char.haki.advancedType) lines.push(`  Variante Avançada: ${char.haki.advancedType}`);
    }
    lines.push("");
  }

  // ── Akuma no Mi
  if (char.akuma) {
    lines.push("[ AKUMA NO MI ]");
    lines.push(`${char.akuma.name} — ${char.akuma.type.toUpperCase()} Rank ${char.akuma.rank}`);
    if (char.akuma.type === "zoan") {
      const zoan = char.akuma as any;
      lines.push(`Vigor Animal: +${zoan.vigorAnimalBonus} CON`);
      lines.push(`Mitológica: ${zoan.isMythical ? "Sim" : "Não"}`);
    }
    if (char.akuma.type === "logia") {
      const logia = char.akuma as any;
      lines.push(`Natureza Elemental: +5 ${attrLabel(logia.elementalNatureAttr)}`);
      lines.push(`Intangibilidade: +4 DEF +4 CON (passiva)`);
    }
    lines.push("");
  }

  // ── Artes Marciais
  if (char.artesMarciais?.currentFaixa) {
    lines.push("[ ARTES MARCIAIS ]");
    lines.push(`Faixa atual: ${char.artesMarciais.currentFaixa.replace("_", " ").toUpperCase()}`);
    if (char.artesMarciais.laranjaChoice) {
      lines.push(`Escolha Laranja: ${char.artesMarciais.laranjaChoice === "unique_weapon" ? "Arma Única" : "2 Técnicas Rank A"}`);
    }
    lines.push("");
  }

  // ── Ciborgue
  if (char.cyborg) {
    lines.push("[ CIBORGUE ]");
    lines.push(`Shifts: ${char.cyborg.shifts.length}/6`);
    if (char.cyborg.gear) lines.push(`Gear: ${char.cyborg.gear}`);
    lines.push("");
  }

  // ── Técnicas
  if (char.techniques.length > 0) {
    lines.push("[ TÉCNICAS ]");
    for (const tech of char.techniques) {
      lines.push(`[${tech.rank}] ${tech.name} — +${tech.baseBonus} ${attrLabel(tech.targetAttr)} (${tech.energyCost} EN)`);
      if (tech.description) lines.push(`     ${tech.description}`);
    }
    lines.push("");
  }

  // ── Equipamentos
  if (char.equippedWeapon || char.equippedDefensive.some(Boolean)) {
    lines.push("[ EQUIPAMENTOS ]");
    if (char.equippedWeapon) {
      const w = char.equippedWeapon as any;
      lines.push(`Arma: ${w.name} (+${w.bonusValue} ${attrLabel(w.bonusAttr)})${w.characteristic ? ` [${w.characteristic}]` : ""}`);
    }
    char.equippedDefensive.filter(Boolean).forEach(item => {
      if (!item) return;
      lines.push(`Defensivo: ${item.name} (+${item.bonusValue} ${attrLabel(item.bonusAttr)})`);
    });
    lines.push("");
  }

  // ── Gemas breakdown
  lines.push("[ GEMAS ]");
  for (const b of budget.breakdown) {
    lines.push(`  ${b.category}: ${b.detail} — ${b.cost}g`);
  }
  lines.push(`  TOTAL: ${budget.spent}/${budget.total}g`);
  lines.push("");

  // ── Validation warnings at the end
  if (!report.isValid || report.hasWarnings) {
    lines.push("[ AVISOS DE VALIDAÇÃO ]");
    for (const issue of report.issues.filter(i => i.severity !== "info")) {
      lines.push(`[${issue.severity.toUpperCase()}] ${issue.title}: ${issue.description}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
