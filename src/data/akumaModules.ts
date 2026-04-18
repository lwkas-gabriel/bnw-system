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
