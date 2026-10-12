import type { AkumaRank, AkumaType } from "../shared/types/character";

export interface AkumaModuleOption {
  id: string;
  label: string;
  description: string;
  slots: number;
  mythicalOnly?: boolean;
  parameciaOnly?: boolean;
}

export const PARAMECIA_MODULES: AkumaModuleOption[] = [
  // 1 slot
  { id: "pow1",       label: "+1 POD",                    description: "+1 Poder ao personagem",                              slots: 1 },
  { id: "pre1",       label: "+1 PRE",                    description: "+1 Precisão ao personagem",                           slots: 1 },
  { id: "def1",       label: "+1 DEF",                    description: "+1 Defesa ao personagem",                             slots: 1 },
  { id: "con1",       label: "+1 CON",                    description: "+1 Constituição ao personagem",                       slots: 1 },
  { id: "neg_opp",    label: "-1 atributo oponente",       description: "-1 POD/PRE/DEF/CON temporário no alvo (a escolher)",   slots: 1 },
  { id: "range",      label: "Ataque à distância",         description: "A habilidade pode ser usada à distância",             slots: 1 },
  // 2 slots
  { id: "adherence",  label: "Efeito Aderido extra",       description: "Adiciona um efeito aderido específico à habilidade",  slots: 2 },
  { id: "resistance", label: "Resistência específica",     description: "Resistência a um tipo de dano ou status",             slots: 2 },
  { id: "restore_con",label: "Restaura 1 CON",             description: "Restaura 1 CON base ao ser usado (ativo)",            slots: 2 },
  // 3 slots
  { id: "restore_en", label: "Restaura 3 EN",              description: "Restaura 3 EN sem custo extra",                       slots: 3 },
  { id: "retem",      label: "Retém 1 CON",                description: "Ao ser nocauteado pela 1ª vez, sobrevive com 1 CON",  slots: 3 },
  { id: "pericia4",   label: "+4 em Perícia",              description: "+4 em uma perícia específica a escolher",             slots: 3 },
  // Despertar (Rank S) — distribuídos em 5 slots totais
  { id: "awake_intang",    label: "Intangibilidade",        description: "+4 DEF +4 CON passivo (modo desperto ativo)",         slots: 3, parameciaOnly: true },
  { id: "awake_techplus1", label: "+1 em todas as técnicas",description: "+1 ao bônus básico de todas as técnicas",            slots: 2, parameciaOnly: true },
];

export const ZOAN_MODULES: AkumaModuleOption[] = [
  // Gerais (1 slot cada)
  { id: "pow1",       label: "+1 POD",                    description: "+1 Poder ao personagem",                                    slots: 1 },
  { id: "pre1",       label: "+1 PRE",                    description: "+1 Precisão ao personagem",                                 slots: 1 },
  { id: "def1",       label: "+1 DEF",                    description: "+1 Defesa ao personagem",                                   slots: 1 },
  { id: "con1",       label: "+1 CON",                    description: "+1 Constituição ao personagem",                             slots: 1 },
  { id: "adherence",  label: "Efeito Aderido extra",       description: "Adiciona um efeito aderido específico à habilidade",       slots: 1 },
  { id: "pericia2",   label: "+2 em Perícia",              description: "+2 em uma perícia específica a escolher",                  slots: 1 },
  // Exclusivos Mitológica (1 slot cada)
  { id: "restore_con",label: "Restaura 1 CON",             description: "Restaura 1 CON perdido ao ativar",                         slots: 1, mythicalOnly: true },
  { id: "retem",      label: "Retém 1 CON",                description: "Ao ser nocauteado pela 1ª vez, sobrevive com 1 CON",       slots: 1, mythicalOnly: true },
  { id: "status_res", label: "Resistência a Status",        description: "Resiste a um tipo de status (duração ÷ 2)",               slots: 1, mythicalOnly: true },
  { id: "alter_env",  label: "Altera Ambiente",             description: "Altera o ambiente de combate por 2 turnos",               slots: 1, mythicalOnly: true },
];

export const PARAMECIA_MODULES_BY_ID: Record<string, AkumaModuleOption> = Object.fromEntries(
  PARAMECIA_MODULES.map(m => [m.id, m]),
);

export const ZOAN_MODULES_BY_ID: Record<string, AkumaModuleOption> = Object.fromEntries(
  ZOAN_MODULES.map(m => [m.id, m]),
);

export const AKUMA_TYPE_LABELS: Record<AkumaType, string> = {
  zoan: "Zoan", logia: "Logia", paramecia: "Paramecia",
};

// ─── Regras por rank ──────────────────────────────────────────────────────────

/** Bônus fixo de CON do Vigor Animal (Zoan) */
export const ZOAN_VIGOR_ANIMAL: Record<AkumaRank, number> = { C: 2, B: 4, A: 6, S: 6 };
/** Bônus por atributo de cada Point (Híbrido/Animal) da Zoan */
export const ZOAN_POINT_BONUS: Record<AkumaRank, number> = { C: 1, B: 3, A: 4, S: 4 };
/** Slots de módulo por habilidade passiva / ativa da Paramecia, e EN das ativas */
export const PARAMECIA_PASSIVE_SLOTS: Record<AkumaRank, number> = { C: 2, B: 3, A: 3, S: 5 };
export const PARAMECIA_ACTIVE_SLOTS: Record<AkumaRank, number> = { C: 2, B: 3, A: 3, S: 0 };
export const PARAMECIA_ACTIVE_EN: Record<AkumaRank, number> = { C: 2, B: 3, A: 3, S: 0 };

/** Técnicas Rank A gratuitas concedidas pela Akuma: C = 1, B/A/S = 2 */
export const AKUMA_FREE_TECH_COUNT: Record<AkumaRank, number> = { C: 1, B: 2, A: 2, S: 2 };
