import type { PericiaId, EquipmentQuality } from "../shared/types/character";

// ─── Bugigangas data ──────────────────────────────────────────────────────────
// Pequenos itens que podem ser integrados a equipamentos para efeitos especiais.
// Fonte: regras BNW — tabela de bugigangas.

export type BugigangaEffect = "pericia_bonus" | "interpretive";

export interface BugigangaData {
  id: string;
  name: string;
  description: string;
  quality: EquipmentQuality;
  effect: BugigangaEffect;
  /** If effect === "pericia_bonus": which péricia and by how much */
  periciaBonus?: { pericia: PericiaId; value: number };
  /** Free-form description of the interpretive effect */
  interpretive?: string;
  /** Market price in Berries */
  price: number;
  /** Cost in Ciborgue shifts to embed */
  ciborgueShifts: number;
}

export const BUGIGANGAS: BugigangaData[] = [
  // ── Comuns — Efeito Interpretativo (2M berries, 1 shift) ──────────────────
  {
    id: "visao_noturna",
    name: "Visão Noturna",
    description: "Sistema óptico instalado nos olhos que amplifica a luz ambiente.",
    quality: "common",
    effect: "interpretive",
    interpretive: "O personagem enxerga normalmente no escuro total.",
    price: 2_000_000,
    ciborgueShifts: 1,
  },
  {
    id: "compartimento_inviolavel",
    name: "Compartimento Inviolável",
    description: "Cofre blindado embutido no corpo, invisível ao toque.",
    quality: "common",
    effect: "interpretive",
    interpretive: "Armazena objetos pequenos de forma completamente oculta. Só pode ser aberto pelo próprio portador.",
    price: 2_000_000,
    ciborgueShifts: 1,
  },
  {
    id: "filtro_de_ar",
    name: "Filtro de Ar",
    description: "Sistema respiratório aprimorado que filtra partículas e gases nocivos.",
    quality: "common",
    effect: "interpretive",
    interpretive: "O personagem é imune a efeitos de gases, fumaça e venenos inalados.",
    price: 2_000_000,
    ciborgueShifts: 1,
  },
  {
    id: "sistema_de_perucas_retrativas",
    name: "Sistema de Perucas Retráteis",
    description: "Compartimento craniano com perucas e disfarces rápidos.",
    quality: "common",
    effect: "interpretive",
    interpretive: "Permite trocar de aparência instantaneamente com um disfarce básico (cabelo, traços faciais).",
    price: 2_000_000,
    ciborgueShifts: 1,
  },

  // ── Esplêndidos — +1 Perícia (10M berries, 1 shift) ──────────────────────
  {
    id: "sistema_de_ganchos",
    name: "Sistema de Ganchos",
    description: "Lançadores de ganchos embutidos nos pulsos com cabo de alta resistência.",
    quality: "splendid",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "atletismo", value: 1 },
    price: 10_000_000,
    ciborgueShifts: 1,
  },
  {
    id: "ferramentas_embutidas",
    name: "Ferramentas Embutidas",
    description: "Conjunto de ferramentas de precisão retráteis nos dedos.",
    quality: "splendid",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "destreza", value: 1 },
    price: 10_000_000,
    ciborgueShifts: 1,
  },
  {
    id: "banco_de_dados",
    name: "Banco de Dados",
    description: "Biblioteca enciclopédica integrada ao cérebro com acesso instantâneo.",
    quality: "splendid",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "erudicao", value: 1 },
    price: 10_000_000,
    ciborgueShifts: 1,
  },
  {
    id: "radar",
    name: "Radar",
    description: "Sensor de longo alcance integrado que mapeia o ambiente ao redor.",
    quality: "splendid",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "percepcao", value: 1 },
    price: 10_000_000,
    ciborgueShifts: 1,
  },
  {
    id: "calculadora",
    name: "Calculadora",
    description: "Processador analítico de alta velocidade integrado ao córtex.",
    quality: "splendid",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "logica", value: 1 },
    price: 10_000_000,
    ciborgueShifts: 1,
  },
  {
    id: "raio_x",
    name: "Raio X",
    description: "Visão de raio-X integrada que permite ver através de materiais.",
    quality: "splendid",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "investigacao", value: 1 },
    price: 10_000_000,
    ciborgueShifts: 1,
  },

  // ── Lendários — +2 Perícia (60M berries, 2 shifts) ───────────────────────
  {
    id: "sistema_de_voo",
    name: "Sistema de Voo",
    description: "Propulsores dorsais de alta potência que permitem voo sustentado.",
    quality: "legendary",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "atletismo", value: 2 },
    interpretive: "Bônus de +2 Atletismo se aplica somente fora d'água.",
    price: 60_000_000,
    ciborgueShifts: 2,
  },
  {
    id: "sistema_de_propulsao_aquatica",
    name: "Sistema de Propulsão Aquática",
    description: "Turbinas aquáticas integradas que impulsionam o corpo na água.",
    quality: "legendary",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "atletismo", value: 2 },
    interpretive: "Bônus de +2 Atletismo se aplica somente dentro d'água.",
    price: 60_000_000,
    ciborgueShifts: 2,
  },
  {
    id: "sistema_de_som",
    name: "Sistema de Som",
    description: "Aparelho vocal aprimorado com modulação e amplificação de frequências.",
    quality: "legendary",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "expressao", value: 2 },
    price: 60_000_000,
    ciborgueShifts: 2,
  },
  {
    id: "sistema_de_disfrace",
    name: "Sistema de Disfarce",
    description: "Pele sintética que altera a aparência física do portador.",
    quality: "legendary",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "furtividade", value: 2 },
    price: 60_000_000,
    ciborgueShifts: 2,
  },
  {
    id: "sistema_de_boias",
    name: "Sistema de Boias",
    description: "Reservatórios de ar e flutuadores embutidos no corpo.",
    quality: "legendary",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "sobrevivencia", value: 2 },
    price: 60_000_000,
    ciborgueShifts: 2,
  },
  {
    id: "sistema_de_bronzeamento_artificial",
    name: "Sistema de Bronzeamento Artificial",
    description: "Controle da aparência e da linguagem corporal por micromonitores.",
    quality: "legendary",
    effect: "pericia_bonus",
    periciaBonus: { pericia: "persuasao", value: 2 },
    price: 60_000_000,
    ciborgueShifts: 2,
  },
];

export const BUGIGANGAS_BY_ID: Record<string, BugigangaData> = Object.fromEntries(
  BUGIGANGAS.map(b => [b.id, b])
);
