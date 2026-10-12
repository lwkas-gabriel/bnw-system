import type { BaseAttributes, Character, LogiaAkuma, ParameciaAkuma, ZoanAkuma } from "../../../shared/types/character";
import { faixaStatBonuses, hasReachedFaixa } from "../../../data/artesMarciais";
import { CYBORG_LOCATIONS_BY_ID } from "../../../data/cyborg";
import { HAKI_TYPE_NAMES } from "../../../data/haki";
import { hakiStageNum } from "./haki";
import { hasWeaponTrait } from "./equipment";

// ─── Attr Breakdown ───────────────────────────────────────────────────────────

export interface AttrRow {
  source: string;
  pod: number; pre: number; def: number; con: number;
  conTemp?: number; // Haki armamento gera CON temporária, não permanente
  isCombat?: boolean;
}

/**
 * Detalhamento das fontes de bônus de atributo do personagem (raça, caminhos,
 * equipamentos), separando bônus passivos dos ativados em combate.
 */
export function computeAttrBreakdown(char: Character): AttrRow[] {
  const rows: AttrRow[] = [];

  function add(source: string, pod: number, pre: number, def: number, con: number, opts?: { isCombat?: boolean; conTemp?: number }) {
    if (pod || pre || def || con || opts?.conTemp) {
      rows.push({ source, pod, pre, def, con, ...opts });
    }
  }

  // Base
  add("Base", 1, 1, 1, 3);

  // Racial (use stored racialBonus so human free choice is reflected)
  const rb = char.racialBonus;
  add("Raça", rb.power ?? 0, rb.precision ?? 0, rb.defense ?? 0, rb.constitution ?? 0);

  // Invested
  const ia = char.investedAttributes;
  add("Investido", ia.power, ia.precision, ia.defense, ia.constitution);

  // Equipment
  const equips = [char.equippedWeapon, char.equippedDefensive[0], char.equippedDefensive[1]].filter(Boolean);
  for (const eq of equips as NonNullable<typeof equips[number]>[]) {
    if (!eq.bonusValue) continue;
    const a = eq.bonusAttr as keyof BaseAttributes;
    const label = eq.name || eq.slot;
    add(label,
      a === "power" ? eq.bonusValue : 0,
      a === "precision" ? eq.bonusValue : 0,
      a === "defense" ? eq.bonusValue : 0,
      a === "constitution" ? eq.bonusValue : 0,
    );
  }

  // Ciborgue shifts (+4 por localização)
  if (char.cyborg) {
    const shiftTotals: Partial<Record<keyof BaseAttributes, number>> = {};
    for (const shift of char.cyborg.shifts) {
      const attr = CYBORG_LOCATIONS_BY_ID[shift.location].attr;
      if (attr) shiftTotals[attr] = (shiftTotals[attr] ?? 0) + 4;
    }
    add("Ciborgue (shifts)",
      shiftTotals.power ?? 0, shiftTotals.precision ?? 0,
      shiftTotals.defense ?? 0, shiftTotals.constitution ?? 0,
    );
  }

  // Akuma
  if (char.akuma) {
    if (char.akuma.type === "zoan") {
      const z = char.akuma as ZoanAkuma;
      // Vigor Animal — sempre ativo
      add("Vigor Animal", 0, 0, 0, z.vigorAnimalBonus);
      // Points — combate
      for (const point of z.points) {
        const label = point.id === "hybrid" ? "Point Híbrido" : point.id === "animal" ? "Point Animal" : "Point Desperto";
        const m: Record<keyof BaseAttributes, number> = { power: 0, precision: 0, defense: 0, constitution: 0 };
        m[point.primaryAttr] += point.bonus;
        m[point.complementaryAttr] += point.bonus;
        add(label, m.power, m.precision, m.defense, m.constitution, { isCombat: true });
      }
    } else if (char.akuma.type === "logia") {
      const l = char.akuma as LogiaAkuma;
      const ea = l.elementalNatureAttr;
      add("Logia — Natureza Elemental",
        ea === "power" ? 5 : 0, ea === "precision" ? 5 : 0,
        ea === "defense" ? 5 : 0, ea === "constitution" ? 5 : 0,
      );
      add("Logia — Intangibilidade", 0, 0, 4, 4);
    } else if (char.akuma.type === "paramecia") {
      const p = char.akuma as ParameciaAkuma;
      const countModules = (modules: string[]) => {
        let pod = 0, pre = 0, def = 0, con = 0;
        for (const m of modules) {
          if (m === "pow1") pod++; else if (m === "pre1") pre++;
          else if (m === "def1") def++; else if (m === "con1") con++;
        }
        return { pod, pre, def, con };
      };
      const passiveTotals = { pod: 0, pre: 0, def: 0, con: 0 };
      for (const hab of p.passives) {
        if (!hab) continue;
        const c = countModules(hab.modules);
        passiveTotals.pod += c.pod; passiveTotals.pre += c.pre;
        passiveTotals.def += c.def; passiveTotals.con += c.con;
      }
      add("Paramecia — Módulos Passivos", passiveTotals.pod, passiveTotals.pre, passiveTotals.def, passiveTotals.con);

      const activeTotals = { pod: 0, pre: 0, def: 0, con: 0 };
      for (const hab of p.actives) {
        if (!hab) continue;
        const c = countModules(hab.modules);
        activeTotals.pod += c.pod; activeTotals.pre += c.pre;
        activeTotals.def += c.def; activeTotals.con += c.con;
      }
      add("Paramecia — Módulos Ativos", activeTotals.pod, activeTotals.pre, activeTotals.def, activeTotals.con, { isCombat: true });
    }
  }

  // Artes Marciais
  if (char.artesMarciais?.currentFaixa) {
    const faixa = char.artesMarciais.currentFaixa;
    const amStats = faixaStatBonuses(faixa);
    // Flat bonuses cumulativos (Cinza–Amarela)
    add("AM (faixas Cinza–Amarela)",
      amStats.power ?? 0,
      amStats.precision ?? 0,
      amStats.defense ?? 0,
      amStats.constitution ?? 0,
    );
    // Bônus em itens defensivos (Laranja=+1, Marrom=+2, Rajada=+3)
    const defBonus = hasReachedFaixa(faixa, "rajada") ? 3 : hasReachedFaixa(faixa, "marrom") ? 2 : hasReachedFaixa(faixa, "laranja") ? 1 : 0;
    if (defBonus > 0) {
      const defTotals: Record<keyof BaseAttributes, number> = { power: 0, precision: 0, defense: 0, constitution: 0 };
      for (const item of [char.equippedDefensive[0], char.equippedDefensive[1]]) {
        if (item) defTotals[item.bonusAttr as keyof BaseAttributes] += defBonus;
      }
      add("AM (bônus defensivos)", defTotals.power, defTotals.precision, defTotals.defense, defTotals.constitution);
    }
    // Vermelha: +2 a atributo à escolha por 2 EN (combate)
    if (hasReachedFaixa(faixa, "vermelha")) {
      rows.push({ source: "AM Vermelha (+2 à escolha / 2 EN)", pod: 0, pre: 0, def: 0, con: 0, isCombat: true, conTemp: undefined });
    }
  }

  // Haissaikai — espelha bônus do Point Zoan ativo
  const isHaissaikai = hasWeaponTrait(char, "haissaikai");
  if (isHaissaikai && char.akuma?.type === "zoan") {
    const zoan = char.akuma as ZoanAkuma;
    for (const point of zoan.points) {
      const mult = point.id === "awakened" ? 0.5 : 1;
      const bonus = Math.floor(point.bonus * mult);
      const label = `Haissaikai espelha Point ${point.id === "hybrid" ? "Híbrido" : point.id === "animal" ? "Animal" : "Desperto"}`;
      const m: Record<keyof BaseAttributes, number> = { power: 0, precision: 0, defense: 0, constitution: 0 };
      m[point.primaryAttr] += bonus;
      m[point.complementaryAttr] += bonus;
      add(label, m.power, m.precision, m.defense, m.constitution, { isCombat: true });
    }
  }

  // Haki — combate
  if (char.haki) {
    const { primaryType, primaryStage, secondaryType, secondaryStage, advancedType } = char.haki;
    const pNum = hakiStageNum(primaryStage);
    const sNum = hakiStageNum(secondaryStage);

    // Primário
    if (pNum > 0) {
      const isArm = primaryType === "armament";
      // Armamento: +N POD, +N CON temp
      // Observação: +N PRE, +N DEF
      add(`Haki ${HAKI_TYPE_NAMES[primaryType].name} (primário · Estágio ${pNum})`,
        isArm ? pNum : 0,
        isArm ? 0 : pNum,
        isArm ? 0 : pNum,
        0,
        { isCombat: true, ...(isArm ? { conTemp: pNum } : {}) },
      );
    }

    // Secundário
    if (sNum > 0) {
      const isArm = secondaryType === "armament";
      add(`Haki ${HAKI_TYPE_NAMES[secondaryType].name} (secundário · Estágio ${sNum})`,
        isArm ? sNum : 0,
        isArm ? 0 : sNum,
        isArm ? 0 : sNum,
        0,
        { isCombat: true, ...(isArm ? { conTemp: sNum } : {}) },
      );
    }

    // Haki Avançado (+4 ao atributo específico da variante, 5 EN/turno)
    if (advancedType) {
      const ADVANCED_BONUS: Record<string, [number, number, number, number]> = {
        ryuo:          [4, 0, 0, 0], // +4 POD
        repulsion:     [0, 0, 0, 4], // +4 CON
        mantra:        [0, 4, 0, 0], // +4 PRE
        future_vision: [0, 0, 4, 0], // +4 DEF
        king_advanced: [0, 0, 0, 0], // bônus em técnicas, não attrs
      };
      const [pod, pre, def, con] = ADVANCED_BONUS[advancedType] ?? [0, 0, 0, 0];
      if (pod || pre || def || con) {
        add(`Haki Avançado — ${advancedType} (5 EN/turno)`, pod, pre, def, con, { isCombat: true });
      } else if (advancedType === "king_advanced") {
        rows.push({ source: "Haki Rei Avançado (Ambição → bônus técnicas)", pod: 0, pre: 0, def: 0, con: 0, isCombat: true });
      }
    }
  }

  return rows;
}

/** Soma as colunas POD/PRE/DEF/CON de um conjunto de linhas */
export function sumRows(rows: AttrRow[]) {
  return rows.reduce(
    (acc, r) => ({ pod: acc.pod + r.pod, pre: acc.pre + r.pre, def: acc.def + r.def, con: acc.con + r.con }),
    { pod: 0, pre: 0, def: 0, con: 0 },
  );
}
