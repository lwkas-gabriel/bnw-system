import type { ShipSize, ShipSizeData, ShipMechanismData, ShipComodoData, ShipRole, ShipOwnership } from "../shared/types/ship";

// ─── Ship sizes ───────────────────────────────────────────────────────────────
// Fonte: regras BNW — tabela de embarcações.

export const SHIP_SIZES: Record<ShipSize, ShipSizeData> = {
  individual: {
    id: "individual",
    name: "Individual",
    price: 300_000,
    percepaoRequired: 0,
    maxCrew: 1,
    maxMechanisms: 2,
    comodoSlots: 0,
    maxHull: 10,
  },
  pequeno: {
    id: "pequeno",
    name: "Pequeno",
    price: 600_000,
    percepaoRequired: 1,
    maxCrew: 6,
    maxMechanisms: 2,
    comodoSlots: 4,
    maxHull: 20,
  },
  medio: {
    id: "medio",
    name: "Médio",
    price: 15_000_000,
    percepaoRequired: 2,
    maxCrew: 15,
    maxMechanisms: 2,
    comodoSlots: 8,
    maxHull: 40,
  },
  grande: {
    id: "grande",
    name: "Grande",
    price: 40_000_000,
    percepaoRequired: 3,
    maxCrew: 25,
    maxMechanisms: 2,
    comodoSlots: 12,
    maxHull: 70,
  },
  gigante: {
    id: "gigante",
    name: "Gigante",
    price: 75_000_000,
    percepaoRequired: 4,
    maxCrew: 50,
    maxMechanisms: 2,
    comodoSlots: 16,
    maxHull: 110,
  },
  colossal: {
    id: "colossal",
    name: "Colossal",
    price: 150_000_000,
    percepaoRequired: 5,
    maxCrew: 100,
    maxMechanisms: 2,
    comodoSlots: 20,
    maxHull: 160,
  },
};

/** Tamanhos em ordem crescente (usado em upgrades) */
export const SHIP_SIZES_ORDERED: ShipSize[] = Object.keys(SHIP_SIZES) as ShipSize[];

/** Desconto no preço do casco quando construído por um Engenheiro */
export const ENGINEER_DISCOUNT = 0.3;

/** Viagens necessárias para despertar o Klabautermann */
export const KLABAUTERMANN_VOYAGES = 10;
/** Preço (Berries) de despertar o Klabautermann usando o Desconto de Facção */
export const KLABAUTERMANN_DISCOUNT_PRICE = 20_000_000;

export const SHIP_ROLE_LABELS: Record<ShipRole, string> = {
  captain:       "Capitão",
  first_mate:    "Imediato",
  navigator:     "Navegante",
  doctor:        "Médico",
  cook:          "Cozinheiro",
  shipwright:    "Carpinteiro",
  musician:      "Músico",
  sniper:        "Atirador",
  archaeologist: "Arqueólogo(a)",
  crew:          "Tripulante",
};

export const SHIP_OWNERSHIP_LABELS: Record<ShipOwnership, string> = {
  owned:          "Próprio",
  navy_permanent: "Comissionado (Marinha)",
  cp_temporary:   "Temporário (CP — 1 aventura)",
  cp_galeon:      "Galeão Emprestado (CP Comandante)",
};

// ─── Mecanismos Avançados (max 2 por navio, permanentes) ─────────────────────
// Fonte: regras BNW — tabela de mecanismos avançados.

export const SHIP_MECHANISMS: ShipMechanismData[] = [
  {
    id: "submarino",
    name: "Submarino",
    description: "Permite navegar submerso sem limitações e fugir de combates em alto mar contra outras embarcações.",
    price: 50_000_000,
  },
  {
    id: "aeronave",
    name: "Aeronave",
    description: "Permite acessar ilhas do céu sem limitações e fugir de combates em alto mar contra Reis dos Mares.",
    price: 50_000_000,
  },
  {
    id: "tanque",
    name: "Tanque",
    description: "Permite viajar sobre a terra sem limitações.",
    price: 50_000_000,
  },
  {
    id: "docas",
    name: "Docas",
    description: "Permite armazenar até 5 embarcações que sejam dois tamanhos menores (ex.: Médio armazena Individuais).",
    price: 50_000_000,
  },
  {
    id: "revestimento_de_kairoseki",
    name: "Revestimento de Kairoseki",
    description: "Permite navegar no Calm Belt em segurança. Usuários de Akuma no Mi sofrem penalidades ao tocar o navio.",
    price: 100_000_000,
  },
  {
    id: "madeira_de_adam",
    name: "Madeira de Adam",
    description: "Evita que o navio naufrague em caso de derrota no Combate em Alto Mar (não requer reparos).",
    price: 100_000_000,
  },
  {
    id: "mecha",
    name: "Mecha",
    description: "Permite acoplar-se a um Ciborgue com Gear Mecha, concedendo +1 de Constituição por 3 de Combustível (acumula até +2).",
    price: 100_000_000,
  },
  {
    id: "tracao_animal",
    name: "Tração Animal",
    description: "Substitui a profissão Navegador pela profissão Adestrador em todo o sistema de Navegação e Embarcações.",
    price: 100_000_000,
  },
  {
    id: "anexo_insular",
    name: "Anexo Insular",
    description: "Transforma a embarcação em tamanho colossal e em uma 'ilha móvel' Rank E (requer aventura completa ou 3 desafios).",
    price: 150_000_000,
  },
];

export const SHIP_MECHANISMS_BY_ID: Record<string, ShipMechanismData> = Object.fromEntries(
  SHIP_MECHANISMS.map(m => [m.id, m])
);

// ─── Cômodos (30 opções com custo de slots e bônus de jogo) ──────────────────
// Fonte: regras BNW — tabela de cômodos.
// Preços: tamanho 1 = 20M · tamanho 2 = 40M · tamanho 3 = 60M berries.

export const SHIP_COMODOS: ShipComodoData[] = [
  // ── Tamanho 1 (20M cada) ──────────────────────────────────────────────────
  {
    id: "cozinha_industrial",
    name: "Cozinha Industrial",
    description: "Cômodo adaptado com fornos e equipamentos culinários de ponta.",
    bonus: "+1 nas rolagens de criação de lanches.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "oficina",
    name: "Oficina",
    description: "Cômodo adaptado com ferramentas e ferragens para projetos de engenharia.",
    bonus: "+1 nas rolagens de criação de bugigangas.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "forja",
    name: "Forja",
    description: "Cômodo adaptado com forno de alta temperatura e equipamentos para metalurgia.",
    bonus: "+1 nas rolagens de criação de equipamentos.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "laboratorio",
    name: "Laboratório",
    description: "Cômodo adaptado com instrumentos farmacológicos e químicos diversos.",
    bonus: "+1 nas rolagens de criação de pomadas.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "escritorio",
    name: "Escritório",
    description: "Cômodo dedicado ao estudo e elaboração de cartas náuticas e mapas.",
    bonus: "+1 nas rolagens de criação de Eternal Pose.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "biblioteca",
    name: "Biblioteca",
    description: "Cômodo dedicado ao armazenamento e estudo de livros diversos.",
    bonus: "+1 nas rolagens para localizar Poneglyph.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "picadeiro",
    name: "Picadeiro",
    description: "Cômodo com espaço e utensílios para auxiliar a domesticação de animais.",
    bonus: "+1 em testes de adestramento.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "motor",
    name: "Motor",
    description: "Cômodo ocupado por um motor movido a combustível.",
    bonus: "Ciborgues navegam no Calm Belt gastando 30% do combustível total por viagem.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "remos",
    name: "Remos",
    description: "Cômodo adaptado para projetar remos em ambos os lados da embarcação.",
    bonus: "Usuários de Haki ou Artes Marciais navegam no Calm Belt gastando 30% da energia total por viagem.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "turbina",
    name: "Turbina",
    description: "Mecanismo especial que usa os poderes de Akuma no Mi para funcionar.",
    bonus: "Personagens com Akuma no Mi navegam no Calm Belt gastando 30% da energia total por viagem.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "cabine_do_capitao",
    name: "Cabine do Capitão",
    description: "Cômodo de luxo capaz de causar a melhor das impressões em qualquer visitante.",
    bonus: "+1 em testes de Persuasão.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "academia",
    name: "Academia",
    description: "Cômodo adaptado com equipamentos para treinamentos físicos diversos.",
    bonus: "+1 em testes de Atletismo.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "camarim",
    name: "Camarim",
    description: "Cômodo para armazenamento de figurinos e aplicação de maquiagem para disfarces.",
    bonus: "+1 em testes de Furtividade.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "canhao",
    name: "Canhão",
    description: "Cômodo para armazenamento e manuseio de um canhão e seus projéteis.",
    bonus: "Ataque à 2 ações de distância contra alvos na superfície ou no ar. Caso acerte, impede fuga aérea.",
    size: 1,
    price: 20_000_000,
  },
  {
    id: "torpedo",
    name: "Torpedo",
    description: "Cômodo com mecanismo de disparo de torpedos subaquáticos.",
    bonus: "Ataque à 2 ações de distância contra alvos na superfície ou submersos. Caso acerte, impede fuga submarina.",
    size: 1,
    price: 20_000_000,
  },

  // ── Tamanho 2 (40M cada) ──────────────────────────────────────────────────
  {
    id: "aquario",
    name: "Aquário",
    description: "Tanque de água para armazenar peixes e frutos do mar vivos.",
    bonus: "−10% no preço de custo de lanches e banquetes.",
    size: 2,
    price: 40_000_000,
  },
  {
    id: "arsenal",
    name: "Arsenal",
    description: "Espaço para armazenar e expor armas de tipos e tamanhos variados.",
    bonus: "−10% no preço de custo de equipamentos.",
    size: 2,
    price: 40_000_000,
  },
  {
    id: "enfermaria",
    name: "Enfermaria",
    description: "Ala equipada para atender ferimentos e realizar operações médicas complexas.",
    bonus: "Dobra a recuperação de Constituição por Médicos fora de combate.",
    size: 2,
    price: 40_000_000,
  },
  {
    id: "estabulo",
    name: "Estábulo",
    description: "Área adaptada para hospedagem e cuidado de animais adestrados.",
    bonus: "+10 passageiros exclusivos para animais adestrados.",
    size: 2,
    price: 40_000_000,
  },
  {
    id: "gancho_retrator",
    name: "Gancho Retrator",
    description: "Aparato capaz de perfurar outras embarcações e puxá-las para perto.",
    bonus: "Rouba a iniciativa em Combates em Alto Mar. Ataque à 2 ações de distância — acerto aproxima as embarcações a 0 de distância.",
    size: 2,
    price: 40_000_000,
  },
  {
    id: "horta",
    name: "Horta",
    description: "Área fertilizada para plantação e cultivo de hortaliças.",
    bonus: "−10% no preço de custo de pomadas.",
    size: 2,
    price: 40_000_000,
  },
  {
    id: "museu",
    name: "Museu",
    description: "Espaço para exposição e estudo de relíquias e fontes materiais.",
    bonus: "Realiza duas rolagens para definir relíquias e escolha o resultado.",
    size: 2,
    price: 40_000_000,
  },
  {
    id: "observatorio",
    name: "Observatório",
    description: "Espaço elevado e equipado para observação das estrelas.",
    bonus: "1 rolagem extra por aventura para a criação de Eternal Pose.",
    size: 2,
    price: 40_000_000,
  },
  {
    id: "usina_de_reciclagem",
    name: "Usina de Reciclagem",
    description: "Sistema para reaproveitar materiais em criações diversas.",
    bonus: "−10% no preço de custo de bugigangas.",
    size: 2,
    price: 40_000_000,
  },

  // ── Tamanho 3 (60M cada) ──────────────────────────────────────────────────
  {
    id: "concha_acustica",
    name: "Concha Acústica",
    description: "Palco com redoma que amplifica o som para apresentações artísticas.",
    bonus: "+10% no teto de ganhos da aventura em apresentações artísticas.",
    size: 3,
    price: 60_000_000,
  },
  {
    id: "brigue",
    name: "Brigue",
    description: "Série de celas para prender pessoas de alto risco.",
    bonus: "+10% no valor da recompensa por procurados.",
    size: 3,
    price: 60_000_000,
  },
  {
    id: "antena",
    name: "Antena",
    description: "Aparato que amplifica comunicação e controle de dispositivos conectados a um Ciborgue.",
    bonus: "+1 de Precisão no Gear Drone.",
    size: 3,
    price: 60_000_000,
  },
  {
    id: "loja",
    name: "Loja",
    description: "Área aberta ao público para exposição e venda de produtos.",
    bonus: "+10% no valor de todos os itens vendidos a NPCs.",
    size: 3,
    price: 60_000_000,
  },
  {
    id: "sonar",
    name: "Sonar",
    description: "Equipamento de localização e garra de extração para coletar tesouros submersos.",
    bonus: "Recebe 1d100 × 100.000 em berries a cada viagem em alto mar.",
    size: 3,
    price: 60_000_000,
  },
  {
    id: "tanque_reserva",
    name: "Tanque Reserva",
    description: "Grande tanque de combustível capaz de armazenar grandes volumes.",
    bonus: "Recupera 50% do Combustível total uma vez por aventura.",
    size: 3,
    price: 60_000_000,
  },
];

export const SHIP_COMODOS_BY_ID: Record<string, ShipComodoData> = Object.fromEntries(
  SHIP_COMODOS.map(c => [c.id, c])
);

/** Profissão beneficiada por cada cômodo (badge na UI) */
export const COMODO_PROFESSION: Record<string, string> = {
  cozinha_industrial: "Cozinheiro",
  oficina:            "Engenheiro",
  forja:              "Ferreiro",
  laboratorio:        "Médico",
  escritorio:         "Navegador / Arqueólogo",
  biblioteca:         "Arqueólogo",
  picadeiro:          "Adestrador",
  motor:              "Ciborgue",
  remos:              "Haki / AM",
  turbina:            "Akuma no Mi",
  brigue:             "Caçador",
  antena:             "Ciborgue (Gear Drone)",
  tanque_reserva:     "Ciborgue (Combustível)",
  enfermaria:         "Médico",
};

export const SHIP_ROLES = Object.keys(SHIP_ROLE_LABELS) as ShipRole[];
