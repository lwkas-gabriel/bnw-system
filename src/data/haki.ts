import type { HakiStage, AdvancedHakiVariant, PrimaryHakiType } from "../shared/types/character";

export interface HakiStageData {
  stage: HakiStage;
  gemCost: number;
  /** Adventures required at previous stage */
  adventuresRequired: number;
  locationRequired: "anywhere" | "grand_line" | "new_world";
  /** Bonus while active */
  bonus: {
    power?: number;
    precision?: number;
    defense?: number;
    constitution?: number; // temporary (consumed first)
    percepcao?: number;
  };
  energyCostPerTurn: number;
  description: string;
  /** Free technique granted at this stage */
  freeTechniqueRank?: "A";
}

export const HAKI_ARMAMENT_STAGES: HakiStageData[] = [
  { stage: 1, gemCost: 20, adventuresRequired: 0, locationRequired: "anywhere",
    bonus: { power: 1, constitution: 1 }, energyCostPerTurn: 1,
    description: "Você sente sua pele ficar com uma densidade maior, mas é apenas uma sensação. Não consegue manifestar o Haki por vontade própria, aplicá-lo em técnicas ou objetos afetados por poderes de Akuma, aplicá-lo em objetos comuns, muito menos acertar Logias." },
  { stage: 2, gemCost: 20, adventuresRequired: 1, locationRequired: "anywhere",
    bonus: { power: 2, constitution: 2 }, energyCostPerTurn: 2,
    description: "Você tem controle melhor de sua própria energia espiritual de modo que partes do corpo ou armas/itens sejam revestidas com sua força de vontade, fazendo com que a área focada fique mais forte tanto no ataque quanto na defesa. As vezes a pele pode ficar levemente avermelhada, mas quase que imperceptível. Apesar do uso deste poder de forma mais intensa e recorrente, o usuário ainda não tem a plena consciência de como usar essas habilidades de modo eficiente. Tanto que, mesmo tendo um maior nível de controle, o personagem ainda não é capaz de acertar usuários de Akuma no mi do tipo logia por ainda estar em seu processo de desenvolvimento." },
  { stage: 3, gemCost: 20, adventuresRequired: 1, locationRequired: "grand_line",
    bonus: { power: 3, constitution: 3 }, energyCostPerTurn: 3,
    description: "Você tem plena consciência do uso deste poder e já consegue fazer o uso do Haki como bem entender. A personagem revestir apenas regiões pequenas e específicas, como um punho, para endurecê-la de forma mais rápida e eficiente. Estas partes revestidas se tornam totalmente negras e são tão intensas que os golpes desferidos são mais destrutivos e perigosos. A intensidade é tanta que se torna possível tocar/acertar o corpo de um usuário de Akuma no Mi do tipo Logia ou com outras invulnerabilidades. Nesse nível, o personagem consegue deixar partes de seu corpo com a cor negra.",
    freeTechniqueRank: "A" },
  { stage: 4, gemCost: 20, adventuresRequired: 2, locationRequired: "grand_line",
    bonus: { power: 4, constitution: 4 }, energyCostPerTurn: 4,
    description: "Você possui um entendimento muito maior sobre o Haki devido à sua experiência no campo de batalha. Consegue revestir áreas maiores do corpo, bem como diversas áreas em específico, podendo até mesmo aplicar o Haki no corpo todo. Assim, pode fazer grandes ataques e defesas sempre que desejar, mostrando-se um poderoso usuário. (Exemplo: Vergo vs Smoker)." },
  { stage: 5, gemCost: 20, adventuresRequired: 2, locationRequired: "grand_line",
    bonus: { power: 5, constitution: 5 }, energyCostPerTurn: 5,
    description: "Você dominou o uso do Haki do Armamento, podendo usá-lo até mesmo de forma a se ajustar a características específicas do corpo do usuário, como poderes de Akuma no Mi e Ciborgue (Exemplo: Luffy vs Doflamingo)." },
];

export const HAKI_OBSERVATION_STAGES: HakiStageData[] = [
  { stage: 1, gemCost: 0, adventuresRequired: 0, locationRequired: "anywhere",
    bonus: { precision: 1, defense: 1 }, energyCostPerTurn: 1,
    description: "Você é incapaz de perceber nitidamente as pessoas ao seu redor, mas já consegue sentir objetos inanimados que estão próximos, além de apurar todos os 5 sentidos. Age numa distância de 1 ação de movimento." },
  { stage: 2, gemCost: 0, adventuresRequired: 1, locationRequired: "anywhere",
    bonus: { precision: 2, defense: 2 }, energyCostPerTurn: 2,
    description: "Você é capaz de sentir pessoas ao seu redor, embora não saiba dizer sua posição específica. Mesmo que a alguma distância, consegue 'ver' as silhuetas das pessoas, mesmo que esteja até mesmo de olhos fechados ou seja cego. Age numa distância de 2 ações de movimento." },
  { stage: 3, gemCost: 0, adventuresRequired: 1, locationRequired: "grand_line",
    bonus: { precision: 3, defense: 3, percepcao: 1 }, energyCostPerTurn: 3,
    description: "Você consegue perceber as verdadeiras emoções/sentimentos de uma pessoa ou animal, podendo sentir até mesmo a dor que estes já passaram. Também consegue sentir o poder de luta (doriki) de quem está dentro do seu alcance do haki. Age numa distância de 3 ações de movimento." },
  { stage: 4, gemCost: 0, adventuresRequired: 2, locationRequired: "grand_line",
    bonus: { precision: 4, defense: 4, percepcao: 2 }, energyCostPerTurn: 4,
    description: "Você desenvolve maior aptidão para sentir pessoas e objetos, podendo ver claramente todas as pessoas e objetos (e suas localizações) num determinado raio ao seu redor. É capaz de ver com clareza mesmo a grandes distâncias (Exemplo: Usopp em Dressrosa) Age numa distância de 3 ações de movimento." },
  { stage: 5, gemCost: 0, adventuresRequired: 2, locationRequired: "grand_line",
    bonus: { precision: 5, defense: 5, percepcao: 3 }, energyCostPerTurn: 5,
    description: "Você é um usuário poderoso no haki da Observação. Consegue até mesmo pressentir as intenções das pessoas, ajudando a prevenir ataques (Exemplo: Mantra em Skypiea). Age numa distância de 3 ações de movimento." },
];

// Secondary Haki is FREE — no gem cost, only adventures
export const SECONDARY_HAKI_GEM_COST = 0;
export const PRIMARY_HAKI_TOTAL_GEM_COST = 100; // stages 1-5 = 5 × 20g

/** Haki Avançado de Armamento/Observação: duas fases (parcial e completa). O do Rei é nível único (KING_HAKI.advanced). */
export interface AdvancedHakiData {
  variant: Exclude<AdvancedHakiVariant, "king_advanced">;
  gemCostPartial: number;
  gemCostComplete: number;
  adventuresRequired: number;
  locationRequired: "new_world";
  type: PrimaryHakiType;
  focusAttr: "power" | "constitution" | "precision" | "defense";
  partial: { bonus: Partial<Record<string, number>>; description: string; energyCostPerTurn: number };
  complete: { bonus: Partial<Record<string, number>>; extraEffect: string; description: string; energyCostPerTurn: number };
}

export const ADVANCED_HAKI: AdvancedHakiData[] = [
  {
    variant: "ryuo",
    type: "armament", focusAttr: "power",
    gemCostPartial: 20, gemCostComplete: 20,
    adventuresRequired: 3, locationRequired: "new_world",
    partial: {
      bonus: { power: 4 }, energyCostPerTurn: 5,
      description: "Você se torna capaz de emanar o poder de seu Haki do Armamento como uma camada fora de partes de seu corpo ou de suas armas. Essa camada age como uma extensão de seu corpo ou armas, fazendo com que o ataque atinja o alvo antes mesmo de encostar nele. Essa emissão de energia fragiliza as superfícies atingidas para o golpe, aumentando muito seu poder (Exemplo: Luffy treinando em Wano, Rayleigh destruindo algemas/colares explosivos, etc.",
    },
    complete: {
      bonus: { power: 4 }, energyCostPerTurn: 5,
      extraEffect: "Causa 4 de dano diretamente na CON base do alvo (ignora CON temporária).",
      description: "Você aperfeiçoou a emanação do poder de seu Haki do Armamento fora de seu corpo ao ponto de atingir seu alvo por dentro, perfurando a resistência de seu alvo com a energia de seu Haki Avançado (Exemplo: Luffy vs Kaidou). Esse fluxo de energia do corpo do usuário para dentro do corpo de seu alvo é o que dá o nome de Ryuo a essa habilidade em Wano, que significa 'Sakura Fluindo'.",
    },
  },
  {
    variant: "repulsion",
    type: "armament", focusAttr: "constitution",
    gemCostPartial: 20, gemCostComplete: 20,
    adventuresRequired: 3, locationRequired: "new_world",
    partial: {
      bonus: { constitution: 4 }, energyCostPerTurn: 5,
      description: "Você se torna capaz de emanar o poder de seu Haki do Armamento como uma camada invisível ao redor de partes de seu corpo. Essa camada funcina como uma barreira capaz de amortecer os golpes inimigos, reduzindo seu dano. Essa habilidade de Haki Avançado permite que o Haki do usuário evite danos internos de ataques mais robustos (Exemplo: Sentomaru defendendo do ataque do Luffy em Sabaody).",
    },
    complete: {
      bonus: { constitution: 4 }, energyCostPerTurn: 5,
      extraEffect: "Pode aplicar Bônus para Aliado, Ataque em Área Controlado e Postura Defensiva Especial gratuitamente em técnicas defensivas.",
      description: "Você aperfeiçoou a emanação do poder de seu Haki do Armamento fora de seu corpo, ao ponto de ser capaz de o projetar para áreas distantes de seu corpo e, assim proteger outros (Exemplo: Almirantes defendendo ataque do Barba Branca em conjunto). Além disso, quando aplicado em si mesmo, esta habilidade do Haki Avançado permite defletir o ataque inimigo, repelindo-o.",
    },
  },
  {
    variant: "mantra",
    type: "observation", focusAttr: "precision",
    gemCostPartial: 20, gemCostComplete: 20,
    adventuresRequired: 3, locationRequired: "new_world",
    partial: {
      bonus: { precision: 4 }, energyCostPerTurn: 5,
      description: "Ao alcançar o patamar elevado do Haki da Observação Avançado, sua personagem passa a dominar a disciplina conhecida nas Ilhas do Céu como Mantra, que significa literalmente 'Rede Mental'. Essa capacidade sobre-humana permite que seu usuário pressinto todos os estímulos sensoriais em constante transformação no espaço. Assim, é como se ele 'ouvisse' o exato local no espaço para onde seu oponente está se movendo, ou qual posição seu corpo assumirá, facilitando o acerto de ataques. Entretanto, tal habilidade demanda extrema concentração e, à princípio, torna agir em função dessa presciência algo pesaroso.",
    },
    complete: {
      bonus: { precision: 4 }, energyCostPerTurn: 5,
      extraEffect: "Pode fazer duas rolagens de 3d6 ao atacar e selecionar o maior resultado.",
      description: "A sensibilidade extrassensorial do usuário desta vertente do Haki da Observação Avançado alcança o auge e, em combate, é como se ele pudesse enxergar todas as opções possíveis de deslocamento e posicionamento de seu alvo no espaço. Assim, é como se o usuário pudesse escolher a melhor opção para garantir o acerto de seu ataque.",
    },
  },
  {
    variant: "future_vision",
    type: "observation", focusAttr: "defense",
    gemCostPartial: 20, gemCostComplete: 20,
    adventuresRequired: 3, locationRequired: "new_world",
    partial: {
      bonus: { defense: 4 }, energyCostPerTurn: 5,
      description: "Com essa habilidade o usuário de Haki da Observação se torna capaz de enxergar alguns segundos no futuro, sendo capaz predizer seus ataques. Ainda não acostumado com tal habilidade, o usuário desta vertente do Haki Avançado precisa dedicar total concentração, o que torna reagir à presciência um grande desafio.",
    },
    complete: {
      bonus: { defense: 4 }, energyCostPerTurn: 5,
      extraEffect: "Força o oponente a fazer duas rolagens de 3d6 e selecionar o menor resultado.",
      description: "Sua capacidade de prever o futuro imediato se torna algo natural, de modo que reagir aos ataques inimigos fica muito mais fácil. As decisões tomadas pelo usuário que dominou está vertente do Haki da Observação Avançada parecem até mesmo mudar a história prevista por ele.",
    },
  },
];

export const KING_HAKI: {
  dormant: { gemCost: number; description: string };
  controlled: { gemCost: number; energyCostPerTurn: number; persuasionBonus: number; description: string };
  /** Nível único (sem fase parcial/completa) — custo em GEM_COSTS.haki.kingAdvanced */
  advanced: { label: string; adventuresRequired: number; locationRequired: "new_world"; energyCostPerTurn: number; effect: string; description: string };
} = {
  dormant: {
    gemCost: 20,
    description: "Pode tentar ativar uma vez por aventura com teste difícil de Ambição (18). Ou automaticamente em acerto crítico.",
  },
  controlled: {
    gemCost: 0, // already paid when buying dormant
    energyCostPerTurn: 5,
    persuasionBonus: 4,
    description: "Desmaia alvos com 5 níveis a menos. Resistentes com Obs. 3+ ficam sem ação de ataque por 2 turnos.",
  },
  advanced: {
    label: "Imbuir do Rei",
    adventuresRequired: 3,
    locationRequired: "new_world",
    energyCostPerTurn: 0, // sem EN extra além do Rei Controlado
    effect: "Adiciona o valor da perícia Ambição ao bônus de todas as técnicas enquanto o Haki do Rei estiver ativo.",
    description: "Infunde o poder do Rei nas técnicas. Relâmpagos negros emanam do foco. O ataque causa dano sem necessidade de contato físico.",
  },
};

/** Nome do Haki primário/secundário, com e sem artigo ("do Armamento") */
export const HAKI_TYPE_NAMES: Record<PrimaryHakiType, { name: string; withArticle: string }> = {
  armament:    { name: "Armamento", withArticle: "do Armamento" },
  observation: { name: "Observação", withArticle: "da Observação" },
};
