import type { UniqueWeaponCharacteristic } from "../shared/types/character";

export interface UniqueWeaponData {
  id: UniqueWeaponCharacteristic;
  name: string;
  origin: string;
  gemCost: number;
  effect: string;
  /** Parsed mechanical effect for the engine */
  mechanics: UniqueWeaponMechanics;
}

export interface UniqueWeaponMechanics {
  /** Doubles the base bonus of all equipped weapons */
  doublesWeaponBonus?: boolean;
  /** Mirrors Zoan point bonuses onto the weapon */
  mirrorsZoanPoints?: boolean;
  /** Doubles Haki Armament POD bonus */
  doublesHakiArmamentPow?: boolean;
  /** Doubles Haki Observation DEF bonus */
  doublesHakiObsDefense?: boolean;
  /** Doubles technique base bonus (excludes path bonuses like AM, King) — costs 1 direct CON per technique used */
  doublesTechniqueBase?: boolean;
  directConCostPerTech?: number;
  /** Halves technique energy cost (round down, min 1) and allows alternating POD/PRE or DEF/CON bonus */
  halvesEnergyCost?: boolean;
  /** Applies weapon bonus to 2 additional attributes */
  applyBonusToExtraAttrs?: number;
  /** Adds Ambition value to BPN while active, costs 2 EN per turn */
  addAmbitionToBPN?: boolean;
  ambitionBPNCostPerTurn?: number;
  /** Triples base CON and retains 1 CON on first knockout */
  triplesBaseConAndRetains?: boolean;
  /** Adds Atletismo to BPN when flying */
  atletismoBPNWhenFlying?: boolean;
  /** Adds Atletismo to BPN in aquatic environments */
  atletismoBPNAquatic?: boolean;
  /** Reduces opponent technique bonus by half, +1 EN cost */
  reducesOpponentTechBonus?: boolean;
  /** Allows converting defensive item bonuses to attack attributes */
  convertDefItemsToAttack?: boolean;
  /** Increases King Haki range and adds Ambition to resistant targets' PRE penalty */
  enhancesKingHaki?: boolean;
  /** Kabuto: +range and weapon bonus to PRE */
  increasesRange?: boolean;
  addWeaponBonusToPRE?: boolean;
  /** Special: adds 3 levels to the wielder */
  grantsThreeLevels?: boolean;
  /** Doubles paramecia active ability bonuses with no extra energy */
  doublesParameciaActives?: boolean;
  /** Doubles Logia intangibility bonus */
  doublesLogiaIntangibility?: boolean;
  /** Triples weapon bonus during territory liberation/domination/protection */
  triplesForTerritory?: boolean;
  /** Doubles prestige and salary */
  doublesPrestige?: boolean;
  /** Double Ciborgue shift bonus + free extra Gear for complete cyborg */
  doublesShiftAndFreeGear?: boolean;
  /** Adds adventure bonus as if with 1 extra player */
  adventureExtraPlayerBonus?: boolean;
  /** Mascote Rank A even without Adestrador profession */
  mascoteRankA?: boolean;
}

export const UNIQUE_WEAPONS: Record<UniqueWeaponCharacteristic, UniqueWeaponData> = {
  haissaikai: {
    id: "haissaikai", name: "Haissaikai", gemCost: 20,
    origin: "Enorme porrete de Kaido, o Rei das Feras.",
    effect: "Recebe os mesmos bônus do point Zoan ativo. Point Desperto: metade dos bônus.",
    mechanics: { mirrorsZoanPoints: true },
  },
  kitetsu: {
    id: "kitetsu", name: "Kitetsu", gemCost: 20,
    origin: "Espadas amaldiçoadas do lendário ferreiro Kitetsu.",
    effect: "Dobra o bônus BASE das técnicas. Sofre 1 de dano direto na CON base por técnica usada.",
    mechanics: { doublesTechniqueBase: true, directConCostPerTech: 1 },
  },
  enma: {
    id: "enma", name: "Enma", gemCost: 20,
    origin: "Uma das espadas de Oden, herdada por Zoro.",
    effect: "Dobra o bônus em Poder do Haki do Armamento.",
    mechanics: { doublesHakiArmamentPow: true },
  },
  yoru: {
    id: "yoru", name: "Yoru", gemCost: 20,
    origin: "Grande espada de Dracule Mihawk.",
    effect: "Reduz pela metade o gasto de energia em técnicas (mínimo 1) e permite alternar bônus ofensivos (POD/PRE) ou defensivos (DEF/CON).",
    mechanics: { halvesEnergyCost: true },
  },
  ame_no_habakiri: {
    id: "ame_no_habakiri", name: "Ame no Habakiri", gemCost: 20,
    origin: "Uma das espadas de Oden, herdada por Momonosuke.",
    effect: "Dobra o bônus das armas equipadas.",
    mechanics: { doublesWeaponBonus: true },
  },
  eisen: {
    id: "eisen", name: "Eisen", gemCost: 20,
    origin: "Espada de Ohm, sacerdote de Enel.",
    effect: "Aplica o bônus da arma a dois outros atributos diferentes.",
    mechanics: { applyBonusToExtraAttrs: 2 },
  },
  shusui: {
    id: "shusui", name: "Shusui", gemCost: 20,
    origin: "Espada do lendário samurai Ryuma.",
    effect: "Aplica o valor de Ambição ao BPN. Consome 2 de energia por turno.",
    mechanics: { addAmbitionToBPN: true, ambitionBPNCostPerTurn: 2 },
  },
  murakumogiri: {
    id: "murakumogiri", name: "Murakumogiri", gemCost: 20,
    origin: "Naginata de Barba Branca.",
    effect: "Triplica a Constituição inicial e retém 1 CON na primeira vez em que for nocauteado.",
    mechanics: { triplesBaseConAndRetains: true },
  },
  mogura: {
    id: "mogura", name: "Mogura", gemCost: 20,
    origin: "Tridente de Katakuri.",
    effect: "Reduz o bônus básico das técnicas do oponente pela metade e aumenta custo em 1 de energia.",
    mechanics: { reducesOpponentTechBonus: true },
  },
  daisenso: {
    id: "daisenso", name: "Daisenso", gemCost: 20,
    origin: "Lança de Don Krieg.",
    effect: "Converte bônus de equipamentos defensivos em atributo oposto (DEF↔PRE; CON↔POD) no turno de ataque.",
    mechanics: { convertDefItemsToAttack: true },
  },
  gryphon: {
    id: "gryphon", name: "Gryphon", gemCost: 20,
    origin: "Sabre de Shanks.",
    effect: "Aumenta eficácia da Presença do Rei para 3 níveis abaixo e reduz PRE dos resistentes pelo valor de Ambição.",
    mechanics: { enhancesKingHaki: true },
  },
  kabuto: {
    id: "kabuto", name: "Kabuto", gemCost: 20,
    origin: "Estilingue de Sogeking.",
    effect: "Aumenta alcance em 1 ação de movimento e concede bônus da arma em Precisão.",
    mechanics: { increasesRange: true, addWeaponBonusToPRE: true },
  },
  kirisama: {
    id: "kirisama", name: "Kirisama", gemCost: 20,
    origin: "Lâmina de Hody Jones.",
    effect: "Acrescenta Atletismo ao BPN em ambientes aquáticos.",
    mechanics: { atletismoBPNAquatic: true },
  },
  oto_kogarashi: {
    id: "oto_kogarashi", name: "Oto Kogarashi", gemCost: 20,
    origin: "Par de espadas de Shiki.",
    effect: "Acrescenta Atletismo ao BPN enquanto voa em combate.",
    mechanics: { atletismoBPNWhenFlying: true },
  },
  ace: {
    id: "ace", name: "Ace", gemCost: 20,
    origin: "Espada de Gol D. Roger.",
    effect: "Garante aumento de três níveis (pode ultrapassar o nível máximo).",
    mechanics: { grantsThreeLevels: true },
  },
  nanashaku: {
    id: "nanashaku", name: "Nanashaku", gemCost: 20,
    origin: "Jitte de Smoker, com fragmento de kairoseki.",
    effect: "Anula Invulnerabilidade de Logias, Passivas de Paramecia e Points de Zoan (Desperto: bônus reduzidos pela metade).",
    mechanics: {},
  },
  napoleon: {
    id: "napoleon", name: "Napoleon", gemCost: 20,
    origin: "Chapéu-espada de Big Mom.",
    effect: "Triplica o bônus desta arma em Libertação, Domínio ou Proteção de Territórios.",
    mechanics: { triplesForTerritory: true },
  },
  nonosama: {
    id: "nonosama", name: "Nonosama", gemCost: 20,
    origin: "Bastão de Enel.",
    effect: "Dobra o bônus da Intangibilidade do portador de Logia.",
    mechanics: { doublesLogiaIntangibility: true },
  },
  pretzel: {
    id: "pretzel", name: "Pretzel", gemCost: 20,
    origin: "Espada de Cracker.",
    effect: "Concede 20 gemas extras (além do limite de Rank) aos Companheiros.",
    mechanics: {},
  },
  raid_suit: {
    id: "raid_suit", name: "Raid Suit", gemCost: 20,
    origin: "Trajes da Germa 66.",
    effect: "Dobra o bônus de um shift de Ciborgue e permite um Gear extra gratuito para Ciborgue Completo.",
    mechanics: { doublesShiftAndFreeGear: true },
  },
  tsuji_shibai: {
    id: "tsuji_shibai", name: "Tsuji Shibai", gemCost: 20,
    origin: "Espada-pincel de Kanjuro.",
    effect: "Aplica bônus da arma ao teste de profissão. Aplica perícia da profissão à Precisão.",
    mechanics: {},
  },
  yakuza_kasen: {
    id: "yakuza_kasen", name: "Yakuza Kasen", gemCost: 20,
    origin: "Bengala do Almirante Fujitora.",
    effect: "Dobra o bônus em Defesa do Haki da Observação.",
    mechanics: { doublesHakiObsDefense: true },
  },
  durandal: {
    id: "durandal", name: "Durandal", gemCost: 20,
    origin: "Rapieira de Cavendish.",
    effect: "Dobra Prestígio e salário. Para Piratas: dobra pilhagem. Para Caçadores: +1/3 na recompensa.",
    mechanics: { doublesPrestige: true },
  },
  wado_ichimonji: {
    id: "wado_ichimonji", name: "Wado Ichimonji", gemCost: 20,
    origin: "Espada que Zoro herdou de Kuina.",
    effect: "Ao fim de uma aventura, recebe premiação como se houvesse um jogador a mais.",
    mechanics: { adventureExtraPlayerBonus: true },
  },
  warabide: {
    id: "warabide", name: "Warabide", gemCost: 20,
    origin: "Espada de palha de Basil Hawkins.",
    effect: "Duplica bônus das Habilidades Ativas de Paramecia sem gasto extra de energia.",
    mechanics: { doublesParameciaActives: true },
  },
  lassoo: {
    id: "lassoo", name: "Lassoo", gemCost: 20,
    origin: "Pistola de Mr. 4.",
    effect: "Funciona como um Mascote Rank A, mesmo sem a profissão Adestrador.",
    mechanics: { mascoteRankA: true },
  },
};
