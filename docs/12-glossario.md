# 12. Glossário

## Termos do Sistema de Jogo

| Termo | Definição |
|-------|-----------|
| **BPN** | Bônus por Nível — `floor(nível × 3/4)`. Adicionado ao roll de ataque e ao threshold de defesa. |
| **CON temp** | Constituição temporária — buffers de Haki Armamento e técnicas de CON consumidos antes da CON base. |
| **Retém 1 CON** | Módulo exclusivo de Zoans Mitológicas: evita o primeiro nocaute da aventura, deixando o personagem com 1 CON. |
| **JxJ** | Jogador × Jogador — modo de combate onde ambos atacam simultaneamente no turno 1. |
| **Point** | Forma de transformação da Zoan (Híbrido, Animal, Desperto) com bônus de atributo específicos. |
| **Haissaikai** | Arma Única que espelha os bônus do point Zoan ativo. Obtível gratuitamente via Faixa Laranja de AM. |
| **Kitetsu** | Arma Única que dobra o bônus BASE das técnicas. Custo: 1 de dano direto na CON base por técnica usada. |
| **Elementalista** | Habilidade de Logia que adiciona o Status Aprimorado a qualquer ataque corpo a corpo por 1 EN. |
| **Vigor Animal** | Bônus fixo de CON das Zoans, ativo em todas as formas incluindo a humana. |
| **Intangibilidade** | Passiva de Logia: +4 DEF +4 CON permanentes, sem custo de energia. |
| **Status Aprimorado** | Status exclusivo da Logia criado combinando ou dobrando Efeitos Aderidos de status. |
| **Protagonismo** | Regra do sistema: em combate vs NPC, o jogador age primeiro no T1. Não se aplica em JxJ. |
| **Faixa Laranja** | Faixa intermediária de AM que oferece 2 Técnicas Rank A OU 1 Arma Única gratuitamente. |

---

## Termos Técnicos do Código

| Termo | Definição |
|-------|-----------|
| **`updateDraft()`** | Função do `characterStore` que recebe um updater (Immer), aplica, revalida e recalcula budget automaticamente. Único ponto de entrada para modificações de ficha. |
| **`migrateCharacter()`** | Função do `importer.ts` que preenche campos ausentes com defaults ao importar fichas de versões anteriores. |
| **`resolveAttributes()`** | Engine: calcula atributos efetivos dado o conjunto de buffs ativos (Haki, points Zoan, Logia passivos, AM flat). |
| **`resolveTechniqueBonus()`** | Engine: calcula bônus efetivo de uma técnica aplicando Kitetsu, Bestialidade, Logia aderido, AM e Rei Avançado. |
| **`tempConStack`** | Pilha de CON temporária no `CombatantState`. Drena sequencialmente antes de atingir a CON base. |
| **`TurnChoice`** | Configuração de um combatente para um turno: técnica ofensiva, defensiva e flags de buffs ativos. |
| **`CombatSummary`** | Output do `simulateCombat()`: todos os turnos, estados finais, vencedor e narração em texto. |
| **`GEM_COSTS`** | Objeto constante em `gemBudget.ts` — fonte única de verdade para todos os custos em gemas do sistema. |
| **`ValidationIssue`** | Um problema encontrado na ficha: severidade, descrição, sugestão de correção e auto-fix opcional. |
| **`ValidationReport`** | Resultado completo da validação: contagens por severidade, issues e agrupamento por categoria. |
| **`ImportResult`** | Output do importador: status, personagem migrado, erros de parse e relatório de validação. |
| **Feature** | Módulo autossuficiente em `src/features/` com seus próprios componentes, store e utils. |
| **Barrel export** | Arquivo `index.ts` que re-exporta tudo de uma pasta, simplificando os imports. |

---

## Abreviações de Atributos

| Abreviação | Atributo | Papel |
|------------|----------|-------|
| **POD** | Poder | Dano causado por acerto |
| **PRE** | Precisão | Roll de ataque |
| **DEF** | Defesa | Threshold para ser acertado |
| **CON** | Constituição | HP / resistência |
| **EN** | Energia | Recurso consumido por Haki, técnicas e habilidades |
| **AM** | Artes Marciais | Caminho de faixas |
| **BPN** | Bônus por Nível | Modifier derivado do nível |

---

[← Princípios](./11-principios.md) | [← Índice](./README.md)
