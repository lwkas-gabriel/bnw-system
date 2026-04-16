import type { Character, AMFaixaId, ZoanAkuma } from "../../../shared/types/character";
import { GEM_COSTS, computeGemBudget } from "./gemBudget";
import { bpn, totalAttributePoints } from "./attrCalc";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: string;
  field?: string;
  title: string;
  description: string;
  /** Actionable fix suggestion */
  fix: string;
  /** Auto-fix function if applicable */
  autoFix?: (char: Character) => Character;
}

export interface ValidationReport {
  isValid: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
  /** Grouped by category for UI display */
  byCategory: Record<string, ValidationIssue[]>;
}

// ─── Rule checkers ────────────────────────────────────────────────────────────

function checkGems(char: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const budget = computeGemBudget(char);

  if (budget.isOverBudget) {
    issues.push({
      id: "gems_over_budget",
      severity: "error",
      category: "Gemas",
      title: "Orçamento de gemas excedido",
      description: `${budget.spent}g gastos de um total de ${budget.total}g disponíveis. Excesso de ${budget.spent - budget.total}g.`,
      fix: "Remova caminhos, reduza o investimento em energia, ou aumente o orçamento total (bônus de facção etc).",
    });
  }

  if (budget.remaining > 0 && budget.remaining < 10) {
    issues.push({
      id: "gems_unspent_small",
      severity: "info",
      category: "Gemas",
      title: `${budget.remaining}g não alocadas`,
      description: "Gemas não utilizadas. Podem ser investidas em energia (1g = 1 EN) ou técnicas.",
      fix: `Invista as ${budget.remaining}g restantes em energia (+${budget.remaining} EN) ou guarde para técnicas (Rank E custa 6g).`,
    });
  }

  if (budget.remaining >= 10) {
    issues.push({
      id: "gems_unspent_notable",
      severity: "warning",
      category: "Gemas",
      title: `${budget.remaining}g sem alocação`,
      description: "Quantidade significativa de gemas não utilizadas.",
      fix: `Considere: +${budget.remaining} EN em energia, técnicas adicionais, ou avanço de caminhos.`,
    });
  }

  return issues;
}

function checkAttributes(char: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const totalInvested =
    char.investedAttributes.power +
    char.investedAttributes.precision +
    char.investedAttributes.defense +
    char.investedAttributes.constitution;

  const maxPoints = totalAttributePoints(char.level);

  if (totalInvested > maxPoints) {
    issues.push({
      id: "attrs_over_limit",
      severity: "error",
      category: "Atributos",
      title: "Pontos de atributo excedidos",
      description: `${totalInvested} pontos distribuídos, máximo para nível ${char.level} é ${maxPoints}.`,
      fix: `Reduza ${totalInvested - maxPoints} ponto(s) dos atributos. Fórmula: 6 + Nível + Bônus Raciais.`,
    });
  }

  if (totalInvested < maxPoints) {
    const diff = maxPoints - totalInvested;
    issues.push({
      id: "attrs_underspent",
      severity: "warning",
      category: "Atributos",
      title: `${diff} ponto(s) de atributo não distribuídos`,
      description: `Você tem ${maxPoints} pontos disponíveis mas só usou ${totalInvested}.`,
      fix: `Distribua os ${diff} pontos restantes. Prioridade sugerida: CON e POD (S-tier no meta de combate curto).`,
    });
  }

  if (char.investedAttributes.power < 0 || char.investedAttributes.precision < 0 ||
      char.investedAttributes.defense < 0 || char.investedAttributes.constitution < 0) {
    issues.push({
      id: "attrs_negative",
      severity: "error",
      category: "Atributos",
      title: "Atributo com valor negativo",
      description: "Nenhum atributo investido pode ser negativo.",
      fix: "Ajuste os valores investidos para 0 ou mais.",
    });
  }

  if (char.ambition > 5) {
    issues.push({
      id: "ambition_over_max",
      severity: "error",
      category: "Atributos",
      title: "Ambição acima do máximo",
      description: `Ambição é ${char.ambition}, máximo é 5.`,
      fix: "Reduza Ambição para 5 ou menos.",
      autoFix: (c) => ({ ...c, ambition: 5 }),
    });
  }

  return issues;
}

function checkHaki(char: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!char.haki) return issues;

  const { haki } = char;
  const primaryStageNum = typeof haki.primaryStage === "number" ? haki.primaryStage : 5;
  const secondaryStageNum = typeof haki.secondaryStage === "number" ? haki.secondaryStage : 0;

  // Primary >= secondary
  if (secondaryStageNum > primaryStageNum) {
    issues.push({
      id: "haki_secondary_ahead",
      severity: "error",
      category: "Haki",
      title: "Haki secundário mais avançado que o primário",
      description: `Primário: estágio ${primaryStageNum}. Secundário: estágio ${secondaryStageNum}. O secundário não pode superar o primário.`,
      fix: "Reduza o estágio do Haki secundário para no máximo o mesmo valor do primário.",
    });
  }

  // Location restrictions
  if (primaryStageNum >= 3 && char.location === "blues") {
    issues.push({
      id: "haki_stage3_location",
      severity: "error",
      category: "Haki",
      title: "Estágio 3+ requer Grand Line",
      description: `Haki primário no estágio ${primaryStageNum}, mas personagem está nos Blues.`,
      fix: "Mude a localização para Grand Line ou reduza o Haki para estágio 2.",
    });
  }

  // King Haki requires stage 5
  if (haki.hasKing) {
    const hasStageFive = primaryStageNum === 5 || secondaryStageNum === 5;
    if (!hasStageFive) {
      issues.push({
        id: "haki_king_requires_5",
        severity: "error",
        category: "Haki",
        title: "Haki do Rei requer estágio 5",
        description: "Haki do Rei Controlado exige estágio 5 no Armamento ou Observação.",
        fix: "Leve o Haki primário ou secundário ao estágio 5 antes de ativar o Haki do Rei.",
      });
    }
  }

  // Advanced Haki requires New World
  if ((haki.kingStage === "advanced" || (haki.advancedType && haki.advancedType !== "king_advanced")) &&
      char.location !== "new_world") {
    issues.push({
      id: "haki_advanced_location",
      severity: "error",
      category: "Haki",
      title: "Haki Avançado requer New World",
      description: "Qualquer forma de Haki Avançado só está disponível no New World.",
      fix: "Mude a localização para New World ou remova o Haki Avançado.",
    });
  }

  // King Advanced requires King Controlled first
  if (haki.kingStage === "advanced" && !haki.hasKing) {
    issues.push({
      id: "haki_king_advanced_no_controlled",
      severity: "error",
      category: "Haki",
      title: "Haki do Rei Avançado sem Controlado",
      description: "Não é possível ter o Rei Avançado sem antes ter o Rei Controlado.",
      fix: "Ative o Haki do Rei Controlado (20g) antes do Avançado.",
    });
  }

  // Cost warning
  const hakiCost =
    primaryStageNum * 20 +
    (haki.hasKing ? 20 : 0) +
    (haki.kingStage === "advanced" ? 20 : 0) +
    (haki.advancedType && haki.advancedType !== "king_advanced" ? 40 : 0);

  if (hakiCost > 0) {
    issues.push({
      id: "haki_secondary_free",
      severity: "info",
      category: "Haki",
      title: "Lembrete: Haki secundário é gratuito",
      description: `O Haki ${haki.secondaryType === "armament" ? "do Armamento" : "da Observação"} (secundário) não custa gemas — apenas aventuras.`,
      fix: "Nenhuma ação necessária. Apenas avance o secundário cumprindo os requisitos de aventura.",
    });
  }

  return issues;
}

function checkAkuma(char: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!char.akuma) return issues;

  // Rank S requires New World
  if (char.akuma.rank === "S" && char.location !== "new_world") {
    issues.push({
      id: "akuma_s_location",
      severity: "error",
      category: "Akuma no Mi",
      title: "Despertar (Rank S) requer New World",
      description: "O Rank S da Akuma no Mi (Despertar) só pode ser alcançado no New World.",
      fix: "Mude a localização para New World ou reduza a Akuma para Rank A.",
    });
  }

  // Zoan Mythical specific
  if (char.akuma.type === "zoan") {
    const zoan = char.akuma as ZoanAkuma;
    if (zoan.isMythical && char.akuma.rank === "A" && zoan.abilities.length < 2) {
      issues.push({
        id: "zoan_mythical_abilities",
        severity: "warning",
        category: "Akuma no Mi",
        title: "Zoan Mitológica sem habilidades configuradas",
        description: "Zoans Mitológicas no Rank A têm 2 slots de habilidade — nenhum está preenchido.",
        fix: "Configure as 2 habilidades do Rank A em Akuma no Mi > Habilidades.",
      });
    }

    if (zoan.rank === "S" && (!zoan.abilities.find(a => a.isAwakened))) {
      issues.push({
        id: "zoan_awakened_no_ability",
        severity: "warning",
        category: "Akuma no Mi",
        title: "Point Desperto sem Habilidade Desperta",
        description: "O Rank S concede uma Habilidade Desperta com 2 módulos combinados.",
        fix: "Adicione a Habilidade Desperta nas configurações da Zoan.",
      });
    }
  }

  // Logia specific
  if (char.akuma.type === "logia") {
    const logia = char.akuma as any;
    if (!logia.statusEnhanced?.name) {
      issues.push({
        id: "logia_no_status",
        severity: "warning",
        category: "Akuma no Mi",
        title: "Logia sem Status Aprimorado definido",
        description: "Logias têm um Status Aprimorado exclusivo (combinação ou duplicação de efeitos aderidos).",
        fix: "Defina o Status Aprimorado em Akuma no Mi > Status.",
      });
    }
  }

  return issues;
}

function checkArtesMarciais(char: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!char.artesMarciais?.currentFaixa) return issues;

  const { currentFaixa, laranjaChoice } = char.artesMarciais;

  const intermediateOrder = ["laranja", "verde", "roxa", "marrom"];
  const advancedOrder = ["preta", "coral", "rajada", "vermelha", "grao_mestre"];

  const isIntermediate = intermediateOrder.includes(currentFaixa);
  const isAdvanced = advancedOrder.includes(currentFaixa);

  if (isIntermediate && char.location === "blues") {
    issues.push({
      id: "am_intermediate_location",
      severity: "error",
      category: "Artes Marciais",
      title: "Faixas intermediárias requerem Grand Line",
      description: `A Faixa ${currentFaixa} é intermediária e requer estar na Grand Line.`,
      fix: "Mude a localização para Grand Line ou reduza para Faixa Amarela.",
    });
  }

  if (isAdvanced && char.location !== "new_world") {
    issues.push({
      id: "am_advanced_location",
      severity: "error",
      category: "Artes Marciais",
      title: "Faixas avançadas requerem New World",
      description: `A Faixa ${currentFaixa} é avançada e requer estar no New World.`,
      fix: "Mude a localização para New World ou reduza para Faixa Marrom.",
    });
  }

  // Laranja choice
  const hasLaranja = ["laranja","verde","roxa","marrom","preta","coral","rajada","vermelha","grao_mestre"].includes(currentFaixa);
  if (hasLaranja && !laranjaChoice) {
    issues.push({
      id: "am_laranja_no_choice",
      severity: "warning",
      category: "Artes Marciais",
      title: "Faixa Laranja sem escolha definida",
      description: "A Faixa Laranja oferece 2 Técnicas Rank A OU 1 Arma Única. Nenhuma foi selecionada.",
      fix: "Vá em Artes Marciais e escolha entre Arma Única (ex: Haissaikai, Kitetsu) ou 2 Técnicas Rank A.",
    });
  }

  return issues;
}

function checkTechniques(char: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Rank A techniques can have special adherences
  for (const tech of char.techniques) {
    const rankAAdherences = ["area_controlled", "consecutive_atk", "consecutive_def", "exhaustion", "wound", "defensive_posture"];
    const hasRankAAdherence = tech.adherences.some(a => rankAAdherences.includes(a.effect));
    if (hasRankAAdherence && tech.rank !== "A") {
      issues.push({
        id: `tech_rank_a_adherence_${tech.id}`,
        severity: "error",
        category: "Técnicas",
        title: `Efeito de Rank A em técnica "${tech.name}" (Rank ${tech.rank})`,
        description: "Efeitos Aderidos especiais (Área Controlado, Consecutiva Rank A, Exaustão, Ferimento, Postura Defensiva) são exclusivos de técnicas Rank A.",
        fix: `Eleve "${tech.name}" para Rank A ou remova o efeito aderido de Rank A.`,
      });
    }

    // Defensive adherences on offensive techniques
    const defOnlyEffects = ["aerial", "defensive_posture"];
    const atkOnlyEffects = ["multiple_hit", "anti_air", "anti_aquatic", "confusion", "double_edge", "fragility", "weakness", "vulnerability", "area_controlled", "exhaustion", "wound"];

    if (tech.type === "offensive") {
      const wrongEffects = tech.adherences.filter(a => defOnlyEffects.includes(a.effect));
      if (wrongEffects.length > 0) {
        issues.push({
          id: `tech_wrong_adherence_def_${tech.id}`,
          severity: "error",
          category: "Técnicas",
          title: `Efeito defensivo em técnica ofensiva "${tech.name}"`,
          description: "Efeitos como Aérea e Postura Defensiva só podem estar em técnicas defensivas.",
          fix: `Remova ${wrongEffects.map(e => e.effect).join(", ")} de "${tech.name}" ou mude o tipo para defensiva.`,
        });
      }
    }

    if (tech.type === "defensive") {
      const wrongEffects = tech.adherences.filter(a => atkOnlyEffects.includes(a.effect));
      if (wrongEffects.length > 0) {
        issues.push({
          id: `tech_wrong_adherence_atk_${tech.id}`,
          severity: "error",
          category: "Técnicas",
          title: `Efeito ofensivo em técnica defensiva "${tech.name}"`,
          description: "Efeitos de ataque só podem estar em técnicas ofensivas.",
          fix: `Remova ${wrongEffects.map(e => e.effect).join(", ")} de "${tech.name}" ou mude o tipo para ofensiva.`,
        });
      }
    }
  }

  // Check duplicate unique techniques
  const techNames = char.techniques.map(t => t.name.toLowerCase().trim());
  const duplicates = techNames.filter((n, i) => techNames.indexOf(n) !== i);
  if (duplicates.length > 0) {
    issues.push({
      id: "tech_duplicates",
      severity: "warning",
      category: "Técnicas",
      title: "Técnicas com nomes duplicados",
      description: `Técnicas com mesmo nome: ${[...new Set(duplicates)].join(", ")}`,
      fix: "Renomeie as técnicas para distingui-las.",
    });
  }

  return issues;
}

function checkEquipment(char: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Two defensive slots limit
  const equippedDef = char.equippedDefensive.filter(Boolean).length;
  if (equippedDef > 2) {
    issues.push({
      id: "equip_too_many_defensive",
      severity: "error",
      category: "Equipamentos",
      title: "Mais de 2 equipamentos defensivos equipados",
      description: "Apenas 2 equipamentos defensivos podem gerar bônus simultaneamente.",
      fix: "Remova o excesso — apenas 2 itens defensivos podem estar ativados por cena/combate.",
    });
  }

  // Unique weapon from Laranja but also paid
  const hasUniqueWeapon = char.equippedWeapon && "characteristic" in char.equippedWeapon;
  const gotFromLaranja = char.artesMarciais?.laranjaChoice === "unique_weapon";
  if (hasUniqueWeapon && gotFromLaranja) {
    const budget = computeGemBudget(char);
    const uniqueInBreakdown = budget.breakdown.find(b => b.category === "Arma Única");
    if (uniqueInBreakdown) {
      issues.push({
        id: "equip_double_paid_unique",
        severity: "warning",
        category: "Equipamentos",
        title: "Arma Única possivelmente paga em duplicata",
        description: "Você obteve uma Arma Única pela Faixa Laranja (gratuita), mas também há um custo de Arma Única no breakdown.",
        fix: "Verifique se a Arma Única na ficha é a mesma obtida pela Laranja. Se sim, remova o custo de 20g do orçamento.",
      });
    }
  }

  return issues;
}

function checkCyborg(char: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!char.cyborg) return issues;

  const { shifts, gear } = char.cyborg;

  // Gear requires 6 shifts
  if (gear && shifts.length < 6) {
    issues.push({
      id: "cyborg_gear_needs_6",
      severity: "error",
      category: "Ciborgue",
      title: "Gear requer 6 shifts (Ciborgue Completo)",
      description: `Gear "${gear}" selecionado, mas personagem tem apenas ${shifts.length} shifts. Todos os 6 são necessários.`,
      fix: "Complete os 6 shifts (120g total) antes de instalar o Gear.",
    });
  }

  // Gear requires New World
  if (gear && char.location !== "new_world") {
    issues.push({
      id: "cyborg_gear_location",
      severity: "error",
      category: "Ciborgue",
      title: "Gear requer New World",
      description: "Os Gears de Ciborgue só estão disponíveis no New World.",
      fix: "Mude a localização para New World ou remova o Gear.",
    });
  }

  // Duplicate shift locations
  const locations = shifts.map(s => s.location);
  const dupLocations = locations.filter((l, i) => locations.indexOf(l) !== i);
  if (dupLocations.length > 0) {
    issues.push({
      id: "cyborg_duplicate_locations",
      severity: "error",
      category: "Ciborgue",
      title: "Localização de shift duplicada",
      description: `Localizações duplicadas: ${[...new Set(dupLocations)].join(", ")}.`,
      fix: "Cada parte do corpo (cabeça, braços, pernas, tronco) deve ter apenas um shift.",
    });
  }

  return issues;
}

function checkEnergy(char: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const totalEN = char.level * 3 + char.energy.energyInvested;

  // Estimate peak EN cost per turn
  let peakCostPerTurn = 0;
  if (char.haki) {
    const ps = typeof char.haki.primaryStage === "number" ? char.haki.primaryStage : 5;
    const ss = typeof char.haki.secondaryStage === "number" ? char.haki.secondaryStage : 0;
    peakCostPerTurn += ps; // primary
    if (ss > 0) peakCostPerTurn += ss; // secondary
    if (char.haki.hasKing) peakCostPerTurn += 5;
    if (char.haki.kingStage === "advanced" || char.haki.advancedType) peakCostPerTurn += 5;
  }
  if (char.akuma?.type === "zoan" && char.akuma.rank === "S") peakCostPerTurn += 5;
  if (char.akuma?.type === "logia" && char.akuma.rank === "S") peakCostPerTurn += 5;
  peakCostPerTurn += 5 + 5; // 2 Rank A techniques

  const turnsAtPeak = peakCostPerTurn > 0 ? Math.floor(totalEN / peakCostPerTurn) : 99;

  if (turnsAtPeak < 2 && peakCostPerTurn > 0) {
    issues.push({
      id: "energy_too_low",
      severity: "warning",
      category: "Energia",
      title: `Energia insuficiente para combate completo`,
      description: `${totalEN} EN disponíveis. Custo estimado no pico: ~${peakCostPerTurn} EN/turno. Duração: ${turnsAtPeak} turno(s).`,
      fix: `Invista mais gemas em energia. Para 3 turnos no pico: ${peakCostPerTurn * 3 - totalEN}g adicionais necessários.`,
    });
  }

  if (turnsAtPeak >= 2 && turnsAtPeak < 4) {
    issues.push({
      id: "energy_borderline",
      severity: "info",
      category: "Energia",
      title: `Energia para ${turnsAtPeak} turno(s) no pico`,
      description: `${totalEN} EN disponíveis. Custo estimado no pico: ~${peakCostPerTurn} EN/turno.`,
      fix: "Para combates de 1-2 turnos, a energia atual é suficiente. Para segurança extra, invista mais gemas.",
    });
  }

  return issues;
}

// ─── Main validator ───────────────────────────────────────────────────────────

export function validateCharacterFull(char: Character): ValidationReport {
  const allIssues: ValidationIssue[] = [
    ...checkGems(char),
    ...checkAttributes(char),
    ...checkHaki(char),
    ...checkAkuma(char),
    ...checkArtesMarciais(char),
    ...checkTechniques(char),
    ...checkEquipment(char),
    ...checkCyborg(char),
    ...checkEnergy(char),
  ];

  const errorCount   = allIssues.filter(i => i.severity === "error").length;
  const warningCount = allIssues.filter(i => i.severity === "warning").length;
  const infoCount    = allIssues.filter(i => i.severity === "info").length;

  const byCategory: Record<string, ValidationIssue[]> = {};
  for (const issue of allIssues) {
    if (!byCategory[issue.category]) byCategory[issue.category] = [];
    byCategory[issue.category].push(issue);
  }

  return {
    isValid:     errorCount === 0,
    hasWarnings: warningCount > 0,
    errorCount,
    warningCount,
    infoCount,
    issues:      allIssues,
    byCategory,
  };
}
