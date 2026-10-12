import type { Character, BaseAttributes, ZoanAkuma, LogiaAkuma } from "../../../shared/types/character";
import type {
  CombatMode, CombatantState, TurnChoice, TurnResult,
  TurnEvent, AttackRollResult, DamageResult, DiceRoll,
  CombatSummary, ActiveBuffs,
} from "../../../shared/types/combat";
import { baseAttributes, bpn, characterMaxEnergy } from "../../character/utils/attrCalc";
import { faixaStatBonuses, hasReachedFaixa } from "../../../data/artesMarciais";
import { CYBORG_LOCATIONS_BY_ID, CYBORG_SHIFT_BONUS } from "../../../data/cyborg";

// ─── Dice ─────────────────────────────────────────────────────────────────────

export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function roll3d6(): DiceRoll {
  const dice: [number, number, number] = [rollD6(), rollD6(), rollD6()];
  const total = dice[0] + dice[1] + dice[2];
  return {
    dice,
    total,
    isCriticalSuccess: dice[0] === 6 && dice[1] === 6 && dice[2] === 6,
    isCriticalFail: dice[0] === 1 && dice[1] === 1 && dice[2] === 1,
  };
}

export function averageRoll(): DiceRoll {
  return {
    dice: [3, 4, 4],
    total: 11, // rounded average (10.5 → 11)
    isCriticalSuccess: false,
    isCriticalFail: false,
  };
}

// ─── BPN & Energy ─────────────────────────────────────────────────────────────

// ─── Stat Resolvers ───────────────────────────────────────────────────────────

/**
 * Returns the effective attribute total for a character
 * given a set of active buffs — does NOT include technique bonuses.
 */
export function resolveAttributes(
  char: Character,
  buffs: ActiveBuffs
): BaseAttributes & { energyCostPerTurn: number } {
  const base: BaseAttributes = baseAttributes(char);

  // Murakumogiri: triples base CON (before any path bonuses)
  const isMurakumogiri = char.equippedWeapon && "characteristic" in char.equippedWeapon
    && char.equippedWeapon.characteristic === "murakumogiri";
  if (isMurakumogiri) {
    base.constitution *= 3;
  }

  let energyCost = 0;

  // ── Akuma no Mi passive bonuses ──────────────────────────────────
  if (char.akuma) {
    if (char.akuma.type === "zoan") {
      const zoan = char.akuma as ZoanAkuma;
      // Vigor Animal: flat CON bonus regardless of form
      base.constitution += zoan.vigorAnimalBonus;

      // Active point bonuses
      if (buffs.zoanPoint && buffs.zoanPoint !== null) {
        const point = zoan.points.find(p =>
          p.id === buffs.zoanPoint ||
          (buffs.zoanPoint === "awakened" && p.id === "awakened")
        );
        if (point) {
          if (buffs.zoanPoint === "awakened") {
            energyCost += 5; // Awakened form costs 5 EN/turn
          }
          base[point.primaryAttr]       += point.bonus;
          base[point.complementaryAttr] += point.bonus;

          // Haissaikai: mirrors active Zoan point bonus onto weapon (adds same bonus again)
          const isHaissaikai = char.equippedWeapon && "characteristic" in char.equippedWeapon
            && char.equippedWeapon.characteristic === "haissaikai";
          if (isHaissaikai) {
            const mult = buffs.zoanPoint === "awakened" ? 0.5 : 1;
            base[point.primaryAttr]       += Math.floor(point.bonus * mult);
            base[point.complementaryAttr] += Math.floor(point.bonus * mult);
          }
        }
      }
    }

    if (char.akuma.type === "logia") {
      const logia = char.akuma as LogiaAkuma;
      // Natureza Elemental: +5 to chosen attribute (always active)
      base[logia.elementalNatureAttr] += 5;
      // Intangibility: +4 DEF +4 CON (always active, no EN cost)
      base.defense      += 4;
      base.constitution += 4;

      // Elemental Domain (Rank S, manual activation)
      if (buffs.logiaElementalDomain && logia.rank === "S") {
        base.power     += 5;
        base.precision += 5;
        energyCost     += 5;
      }
    }
  }

  // ── Haki bonuses ─────────────────────────────────────────────────
  if (buffs.hakiArmament && char.haki) {
    const stage = char.haki.primaryType === "armament"
      ? char.haki.primaryStage
      : char.haki.secondaryStage;
    const stageNum = typeof stage === "number" ? stage : 5;
    base.power        += stageNum;
    // Enma: doubles Haki Armament POD bonus
    const isEnma = char.equippedWeapon && "characteristic" in char.equippedWeapon
      && char.equippedWeapon.characteristic === "enma";
    if (isEnma) base.power += stageNum;
    // CON temp is handled separately in CombatantState.tempConStack
    energyCost        += stageNum;
  }

  if (buffs.hakiObservation && char.haki) {
    const stage = char.haki.primaryType === "observation"
      ? char.haki.primaryStage
      : char.haki.secondaryStage;
    const stageNum = typeof stage === "number" ? stage : 5;
    base.precision += stageNum;
    base.defense   += stageNum;
    energyCost     += stageNum;
  }

  if (buffs.hakiKing && char.haki?.hasKing) {
    energyCost += 5;
  }

  // ── Artes Marciais flat bonuses (always active once unlocked) ────
  if (char.artesMarciais?.currentFaixa) {
    const faixaBonuses = faixaStatBonuses(char.artesMarciais.currentFaixa);
    base.power        += faixaBonuses.power        ?? 0;
    base.precision    += faixaBonuses.precision    ?? 0;
    base.defense      += faixaBonuses.defense      ?? 0;
    base.constitution += faixaBonuses.constitution ?? 0;
  }

  // ── Ciborgue shift bonuses (always active) ───────────────────────
  if (char.cyborg?.shifts) {
    for (const shift of char.cyborg.shifts) {
      base[CYBORG_LOCATIONS_BY_ID[shift.location].attr] += CYBORG_SHIFT_BONUS;
    }
  }

  return { ...base, energyCostPerTurn: energyCost };
}

// ─── Technique Bonus Resolver ─────────────────────────────────────────────────

/**
 * Calculates the effective technique bonus after applying all path multipliers.
 * Does NOT include base attributes — only the technique modifier added to the roll/damage.
 */
export function resolveTechniqueBonus(
  char: Character,
  choice: TurnChoice,
  isOffensive: boolean
): number {
  const tech = isOffensive ? choice.offensive : choice.defensive;
  if (!tech) return 0;

  let bonus = tech.baseBonus; // 1–5 base

  // Kitetsu: doubles base technique bonus (not path bonuses)
  const isKitetsu = char.equippedWeapon && "characteristic" in char.equippedWeapon
    && char.equippedWeapon.characteristic === "kitetsu";
  if (isKitetsu) bonus *= 2;

  // TODO: confirmar regras — bônus de técnica exclusivo para Zoan/Logia precisa
  // ser mapeado no arquivo de regras antes de ser habilitado. Desabilitado temporariamente.
  // const isZoan = char.akuma?.type === "zoan";
  // if (isZoan) bonus += 1;
  // const isLogia = char.akuma?.type === "logia";
  // if (isLogia) bonus += 1;

  // AM Faixa Verde: +2 to defensive techniques
  // AM Faixa Roxa: +2 to offensive techniques
  if (char.artesMarciais?.currentFaixa) {
    const faixa = char.artesMarciais.currentFaixa;
    if (!isOffensive && hasReachedFaixa(faixa, "verde")) bonus += 2;   // Faixa Verde
    if (isOffensive  && hasReachedFaixa(faixa, "roxa"))  bonus += 2;   // Faixa Roxa
  }

  // Rei Avancado: adds Ambição to technique bonus while King Haki is active
  if (choice.buffs.hakiKing && choice.buffs.hakiAdvanced &&
      char.haki?.kingStage === "advanced" && char.pericias.ambicao) {
    bonus += char.pericias.ambicao;
  }

  // Yoru: halves energy cost (bonus calculation unaffected)
  // Enma: doubles Armament Haki POD bonus (handled in resolveAttributes, not here)

  return bonus;
}

// ─── Temp CON Stack ───────────────────────────────────────────────────────────

/** Builds temp CON stack for a combatant in a given turn */
export function buildTempConStack(
  char: Character,
  _state: CombatantState,
  choice: TurnChoice
): { source: string; value: number }[] {
  const stack: { source: string; value: number }[] = [];

  // Haki Armament temp CON
  if (choice.buffs.hakiArmament && char.haki) {
    const stage = char.haki.primaryType === "armament"
      ? char.haki.primaryStage
      : char.haki.secondaryStage;
    const stageNum = typeof stage === "number" ? stage : 5;
    stack.push({ source: "haki_armament", value: stageNum });
  }

  // Defensive technique targeting CON
  const defTech = choice.defensive;
  if (defTech && defTech.targetAttr === "constitution") {
    const bonus = resolveTechniqueBonus(char, choice, false);
    stack.push({ source: "tech_defensive", value: bonus });
  }

  return stack;
}

/** Absorbs damage through the temp CON stack, returns remaining damage to base CON */
export function absorbDamage(
  incoming: number,
  stack: { source: string; value: number }[]
): { absorbed: number; remaining: number; stackAfter: { source: string; value: number }[] } {
  let remaining = incoming;
  let absorbed = 0;
  const stackAfter = [...stack];

  for (let i = 0; i < stackAfter.length && remaining > 0; i++) {
    const take = Math.min(stackAfter[i].value, remaining);
    stackAfter[i] = { ...stackAfter[i], value: stackAfter[i].value - take };
    absorbed  += take;
    remaining -= take;
  }

  return {
    absorbed,
    remaining,
    stackAfter: stackAfter.filter(s => s.value > 0),
  };
}

// ─── Attack Resolution ────────────────────────────────────────────────────────

export function resolveAttack(
  attacker: Character,
  attackerChoice: TurnChoice,
  defender: Character,
  defenderChoice: TurnChoice,
  useAverage: boolean = false
): AttackRollResult {
  const atkAttrs = resolveAttributes(attacker, attackerChoice.buffs);
  const defAttrs = resolveAttributes(defender, defenderChoice.buffs);

  const bpnAtk = bpn(attacker.level);
  const bpnDef = bpn(defender.level);

  // Offensive technique targets PRE or POD — for attack roll we use PRE bonus
  const offTech = attackerChoice.offensive;
  let techPREBonus = 0;
  if (offTech && offTech.targetAttr === "precision") {
    techPREBonus = resolveTechniqueBonus(attacker, attackerChoice, true);
  }

  const roll = useAverage ? averageRoll() : roll3d6();
  const attackerTotal  = atkAttrs.precision + bpnAtk + techPREBonus + roll.total;

  // Defensive technique targeting DEF
  const defTech = defenderChoice.defensive;
  let techDEFBonus = 0;
  if (defTech && defTech.targetAttr === "defense") {
    techDEFBonus = resolveTechniqueBonus(defender, defenderChoice, false);
  }

  const defenderThreshold = defAttrs.defense + bpnDef + techDEFBonus + 10;

  return {
    roll,
    attackerTotal,
    defenderThreshold,
    hit: attackerTotal >= defenderThreshold,
  };
}

// ─── Damage Resolution ────────────────────────────────────────────────────────

export function resolveDamage(
  attacker: Character,
  attackerChoice: TurnChoice,
  defenderState: CombatantState,
  defenderChoice: TurnChoice,
): DamageResult {
  const atkAttrs = resolveAttributes(attacker, attackerChoice.buffs);

  // Offensive technique targeting POD
  const offTech = attackerChoice.offensive;
  let techPODBonus = 0;
  if (offTech && offTech.targetAttr === "power") {
    techPODBonus = resolveTechniqueBonus(attacker, attackerChoice, true);
  }

  const rawDamage = atkAttrs.power + techPODBonus;

  // Direct CON damage (bypasses temp CON) — Kitetsu self-damage is separate
  let directConDamage = 0;

  // Ryuo Advanced Haki Complete: 4 direct CON damage
  if (attackerChoice.buffs.hakiAdvanced && attackerChoice.buffs.hakiArmament
      && attacker.haki?.advancedType === "ryuo") {
    directConDamage += 4;
  }

  // Elementalista (Logia) with Status Enhanced that causes direct CON damage
  if (attackerChoice.useElementalista && attacker.akuma?.type === "logia") {
    // Wound-type status (handled via status effects, not here directly)
  }

  // Absorb through defender temp CON stack
  const tempConStack = buildTempConStack(
    defenderState.character,
    defenderState,
    defenderChoice
  );
  const absorption = absorbDamage(rawDamage, tempConStack);

  const totalBaseConDamage = absorption.remaining + directConDamage;
  const newBaseCon = defenderState.currentCon - totalBaseConDamage;

  const isKnockout = newBaseCon <= 0;
  const hasMurakumogiri = !!defenderState.character.equippedWeapon &&
    "characteristic" in defenderState.character.equippedWeapon &&
    defenderState.character.equippedWeapon.characteristic === "murakumogiri";
  const retemAvailable =
    isKnockout && !defenderState.retemUsed && (
      (defenderState.character.akuma?.type === "zoan" &&
        (defenderState.character.akuma as ZoanAkuma).isMythical) ||
      hasMurakumogiri
    );

  return {
    rawDamage,
    tempConAbsorbed: absorption.absorbed,
    baseConDamage: absorption.remaining,
    directConDamage,
    isKnockout: retemAvailable ? false : isKnockout, // Retém prevents KO flag
    retemActivated: retemAvailable,
  };
}

// ─── Turn Processor ───────────────────────────────────────────────────────────

function applyEnergyCost(
  state: CombatantState,
  choice: TurnChoice,
  _useAverage: boolean
): { newState: CombatantState; events: TurnEvent[] } {
  const attrs = resolveAttributes(state.character, choice.buffs);
  let totalCost = attrs.energyCostPerTurn;

  // Add technique costs
  if (choice.offensive) totalCost += choice.offensive.energyCost;
  if (choice.defensive) totalCost += choice.defensive.energyCost;
  if (choice.useElementalista) totalCost += 1;

  // Kitetsu Shusui: +2 EN/turn if active and not already counted
  if (state.character.equippedWeapon && "characteristic" in state.character.equippedWeapon
      && state.character.equippedWeapon.characteristic === "shusui") {
    totalCost += 2;
  }

  const newState: CombatantState = {
    ...state,
    currentEnergy: Math.max(0, state.currentEnergy - totalCost),
  };

  return {
    newState,
    events: [{
      type: "energy_cost",
      actorId: state.character.id,
      description: `${state.character.name} gasta ${totalCost} de energia (${state.currentEnergy} → ${newState.currentEnergy}).`,
      numerics: { cost: totalCost, before: state.currentEnergy, after: newState.currentEnergy },
    }],
  };
}

export function processTurn(
  stateA: CombatantState,
  stateB: CombatantState,
  choiceA: TurnChoice,
  choiceB: TurnChoice,
  turnNumber: number,
  mode: CombatMode,
  useAverage: boolean = false
): TurnResult {
  const events: TurnEvent[] = [];
  let currentA = { ...stateA };
  let currentB = { ...stateB };

  // ── 1. Attack A → B ────────────────────────────────────────────────
  const rollAB = resolveAttack(stateA.character, choiceA, stateB.character, choiceB, useAverage);

  events.push({
    type: "attack",
    actorId: stateA.character.id,
    targetId: stateB.character.id,
    description: rollAB.hit
      ? `${stateA.character.name} acerta! (${rollAB.attackerTotal} vs ${rollAB.defenderThreshold})`
      : `${stateA.character.name} erra. (${rollAB.attackerTotal} vs ${rollAB.defenderThreshold})`,
    roll: rollAB.roll,
    numerics: { total: rollAB.attackerTotal, threshold: rollAB.defenderThreshold },
  });

  if (rollAB.hit) {
    const dmgAB = resolveDamage(stateA.character, choiceA, currentB, choiceB);
    const newConB = Math.max(
      dmgAB.retemActivated ? 1 : 0,
      currentB.currentCon - dmgAB.baseConDamage - dmgAB.directConDamage
    );

    events.push({
      type: "damage",
      actorId: stateA.character.id,
      targetId: stateB.character.id,
      description: `${stateA.character.name} causa ${dmgAB.rawDamage} de POD. ` +
        (dmgAB.tempConAbsorbed > 0 ? `CON temp absorveu ${dmgAB.tempConAbsorbed}. ` : "") +
        (dmgAB.directConDamage > 0 ? `+${dmgAB.directConDamage} de dano direto. ` : "") +
        `${stateB.character.name}: ${currentB.currentCon} → ${newConB} CON.`,
      numerics: { raw: dmgAB.rawDamage, absorbed: dmgAB.tempConAbsorbed, direct: dmgAB.directConDamage, conBefore: currentB.currentCon, conAfter: newConB },
    });

    if (dmgAB.retemActivated) {
      events.push({ type: "retem", actorId: stateB.character.id,
        description: `${stateB.character.name} ativa Retém 1 CON! Permanece com 1 CON.` });
    }

    currentB = {
      ...currentB,
      currentCon: newConB,
      retemUsed: dmgAB.retemActivated ? true : currentB.retemUsed,
    };

    if (dmgAB.isKnockout) {
      events.push({ type: "knockout", actorId: stateA.character.id, targetId: stateB.character.id,
        description: `${stateB.character.name} foi nocauteado!` });
    }
  }

  // ── 2. Attack B → A ────────────────────────────────────────────────
  // In JxJ mode T1: both attack simultaneously regardless of first attacker
  // In subsequent turns or vs_npc: only B attacks if A is still standing
  const bAttacks = mode === "jxj" && turnNumber === 1
    ? true
    : currentB.currentCon > 0;

  if (bAttacks) {
    const rollBA = resolveAttack(stateB.character, choiceB, stateA.character, choiceA, useAverage);

    events.push({
      type: "attack",
      actorId: stateB.character.id,
      targetId: stateA.character.id,
      description: rollBA.hit
        ? `${stateB.character.name} acerta! (${rollBA.attackerTotal} vs ${rollBA.defenderThreshold})`
        : `${stateB.character.name} erra. (${rollBA.attackerTotal} vs ${rollBA.defenderThreshold})`,
      roll: rollBA.roll,
      numerics: { total: rollBA.attackerTotal, threshold: rollBA.defenderThreshold },
    });

    if (rollBA.hit) {
      const dmgBA = resolveDamage(stateB.character, choiceB, currentA, choiceA);
      const newConA = Math.max(
        dmgBA.retemActivated ? 1 : 0,
        currentA.currentCon - dmgBA.baseConDamage - dmgBA.directConDamage
      );

      events.push({
        type: "damage",
        actorId: stateB.character.id,
        targetId: stateA.character.id,
        description: `${stateB.character.name} causa ${dmgBA.rawDamage} de POD. ` +
          (dmgBA.tempConAbsorbed > 0 ? `CON temp absorveu ${dmgBA.tempConAbsorbed}. ` : "") +
          `${stateA.character.name}: ${currentA.currentCon} → ${newConA} CON.`,
        numerics: { raw: dmgBA.rawDamage, absorbed: dmgBA.tempConAbsorbed, conBefore: currentA.currentCon, conAfter: newConA },
      });

      if (dmgBA.retemActivated) {
        events.push({ type: "retem", actorId: stateA.character.id,
          description: `${stateA.character.name} ativa Retém 1 CON! Permanece com 1 CON.` });
      }

      currentA = {
        ...currentA,
        currentCon: newConA,
        retemUsed: dmgBA.retemActivated ? true : currentA.retemUsed,
      };

      if (dmgBA.isKnockout) {
        events.push({ type: "knockout", actorId: stateB.character.id, targetId: stateA.character.id,
          description: `${stateA.character.name} foi nocauteado!` });
      }
    }
  }

  // ── 3. Energy costs ────────────────────────────────────────────────
  const { newState: newA } = applyEnergyCost(currentA, choiceA, useAverage);
  const { newState: newB } = applyEnergyCost(currentB, choiceB, useAverage);
  currentA = newA;
  currentB = newB;

  // ── 4. Kitetsu self-damage ─────────────────────────────────────────
  const applyKitetsuSelfDmg = (state: CombatantState, choice: TurnChoice): CombatantState => {
    const isKitetsu = state.character.equippedWeapon &&
      "characteristic" in state.character.equippedWeapon &&
      state.character.equippedWeapon.characteristic === "kitetsu";
    if (!isKitetsu) return state;
    const techCount = (choice.offensive ? 1 : 0) + (choice.defensive ? 1 : 0);
    const selfDmg = techCount; // 1 direct CON per technique used
    if (selfDmg === 0) return state;
    const newCon = Math.max(0, state.currentCon - selfDmg);
    events.push({ type: "damage", actorId: state.character.id,
      description: `Kitetsu: ${state.character.name} sofre ${selfDmg} de dano direto na CON base.`,
      numerics: { selfDmg, conBefore: state.currentCon, conAfter: newCon } });
    return { ...state, currentCon: newCon };
  };

  currentA = applyKitetsuSelfDmg(currentA, choiceA);
  currentB = applyKitetsuSelfDmg(currentB, choiceB);

  // ── 5. Determine combat end and next actor ──────────────────────────
  const aKO = currentA.currentCon <= 0;
  const bKO = currentB.currentCon <= 0;
  const combatEnded = aKO || bKO;

  let winner: string | null = null;
  if (aKO && bKO) winner = null; // draw
  else if (aKO)   winner = stateB.character.id;
  else if (bKO)   winner = stateA.character.id;

  // Next actor is the one with more CON remaining (less wounded acts last, more wounded acts first)
  const nextActorId = !combatEnded
    ? (currentA.currentCon <= currentB.currentCon
        ? stateA.character.id
        : stateB.character.id)
    : null;

  return {
    turnNumber,
    events,
    stateAfter: [currentA, currentB],
    nextActorId,
    combatEnded,
    winner,
  };
}

// ─── Full Combat Simulation ───────────────────────────────────────────────────

/** Empty buffs used to compute base stats without any active combat toggles */
const NO_BUFFS: ActiveBuffs = {
  hakiArmament: false,
  hakiObservation: false,
  hakiKing: false,
  hakiAdvanced: false,
  zoanPoint: null,
  logiaElementalDomain: false,
};

/**
 * Estado inicial de um combatente. Usa resolveAttributes sem buffs para incluir
 * bônus passivos na CON inicial (Logia +4, Vigor Animal, AM Amarela +2) e
 * characterMaxEnergy para a energia (inclui o +20 do Shift 3 do Ciborgue).
 */
export function initialCombatantState(char: Character): CombatantState {
  return {
    character: char,
    currentCon: resolveAttributes(char, NO_BUFFS).constitution,
    currentEnergy: characterMaxEnergy(char),
    retemUsed: false,
    tempConStack: [],
    statusEffects: [],
  };
}

export function simulateCombat(
  charA: Character,
  charB: Character,
  choicesPerTurn: { a: TurnChoice; b: TurnChoice }[],
  mode: CombatMode = "jxj",
  useAverage: boolean = false
): CombatSummary {
  let stateA = initialCombatantState(charA);
  let stateB = initialCombatantState(charB);

  const turns: TurnResult[] = [];
  let combatEnded = false;
  let winner: string | null = null;

  for (let i = 0; i < choicesPerTurn.length && !combatEnded; i++) {
    const { a, b } = choicesPerTurn[i];
    const result = processTurn(stateA, stateB, a, b, i + 1, mode, useAverage);
    turns.push(result);
    [stateA, stateB] = result.stateAfter;
    combatEnded = result.combatEnded;
    winner = result.winner;
  }

  return {
    mode,
    turns,
    winner,
    turnsCount: turns.length,
    finalStates: [stateA, stateB],
    narration: buildNarration(turns, charA, charB),
  };
}

// ─── Narration Builder ────────────────────────────────────────────────────────

function buildNarration(
  turns: TurnResult[],
  charA: Character,
  charB: Character
): string {
  const lines: string[] = [];
  for (const turn of turns) {
    lines.push(`\n[Turno ${turn.turnNumber}]`);
    for (const ev of turn.events) {
      if (["attack", "damage", "knockout", "retem", "system"].includes(ev.type)) {
        lines.push(ev.description);
      }
    }
    if (turn.combatEnded) {
      lines.push(turn.winner
        ? `\n⚔️  ${turn.winner === charA.id ? charA.name : charB.name} vence o combate!`
        : "\n⚔️  Empate — ambos os combatentes foram nocauteados.");
    }
  }
  return lines.join("\n");
}

// ─── Hit Probability ──────────────────────────────────────────────────────────

/**
 * Returns probability (0–1) that a 3d6 roll meets or exceeds `target`.
 * Pre-computed for performance.
 */
export function hitProbability(attackerPRE: number, defenderDEF: number): number {
  const needed = defenderDEF + 10 - attackerPRE;
  if (needed <= 3)  return 1;
  if (needed > 18)  return 0;

  // Count favorable outcomes of 3d6
  let count = 0;
  for (let a = 1; a <= 6; a++)
    for (let b = 1; b <= 6; b++)
      for (let c = 1; c <= 6; c++)
        if (a + b + c >= needed) count++;

  return count / 216;
}
