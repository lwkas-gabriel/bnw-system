# Entrega 0.6.3 — Aba Ciborgue + Aba Companheiros

**Data:** 2026-04-19
**Branch:** develop
**Versão anterior:** 0.6.2

---

## Escopo

Adição das abas **Ciborgue** e **Companheiros** ao CharacterBuilder, completando os dois caminhos do sistema que estavam sem UI. Inclui tipos, store, migração, orçamento de gemas, validação e correção de bug.

---

## Novos arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/features/character/components/CyborgSection.tsx` | UI completa do caminho Ciborgue |
| `src/features/character/components/CompanheirosSection.tsx` | UI completa de Companheiros |
| `deliveries/cyborg-companions-0.6.3.md` | Este arquivo |

---

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/shared/types/character.ts` | `CompanionRank`, `CompanionType`, `CompanionData`, `companions?` em `Character`, `bugigangaId?` em `CyborgShiftData` |
| `src/features/character/store/characterStore.ts` | `companions: []` em `createBlankCharacter` |
| `src/features/character/utils/importer.ts` | Migração: `companions: [] por padrão` |
| `src/features/character/utils/gemBudget.ts` | `GEM_COSTS.companion = { C:10, B:20, A:30 }` + loop no `computeGemBudget` |
| `src/features/character/utils/validator.ts` | `checkCompanions()`: mascote, autômato, múltiplos mascotes |
| `src/pages/CharacterBuilderPage.tsx` | Abas Ciborgue + Companheiros; fix modal "Novo Personagem" |
| `src/shared/components/AppLayout.tsx` | Versão → v0.6.3 |
| `package.json` | Versão → 0.6.3 |
| `skills/bnw-rules/SKILL.md` | Seção Companheiros com Ranks, Mascote, Autômato, recrutamento |

---

## Funcionalidades

### Aba Ciborgue

- **Shifts (1–6):** card por shift com select de localização (mostra bônus de atributo), nome, descrição e nome da bugiganga instalada
- **Resumo:** painel com bônus totais de POD/PRE/DEF/CON, badges de combustível/gear/shift3bonus
- **Bônus do 3º Shift:** aparece ao atingir 3 shifts — escolha entre 2 Técnicas Rank A ou +20 Energia
- **Gear:** seletor com os 5 gears (Overclock, Laser, Drone, Mecha, Stealth); bloqueado com razão visível se < 6 shifts ou localização ≠ New World
- **Custo:** integrado ao GemBudgetBar (20g/shift + 20g gear)

### Aba Companheiros

- **Lista dinâmica:** adicionar/remover companheiros com `crypto.randomUUID()`
- **Rank C/B/A:** select com custo e nível máximo exibidos; custo total somado ao orçamento
- **Tipo Mascote:** bloqueado se não for Adestrador; mostra bônus de gemas (`Sobrevivência × 2/4/6`)
- **Tipo Autômato:** bloqueado se não for Engenheiro; checklist visual de todos os requisitos (Rank B+, Engenheiro, Lógica 5, ≥120g, 6 shifts)
- **Notas:** campo livre opcional por companheiro

### Validação (`checkCompanions`)

| Regra | ID | Severity |
|-------|----|----------|
| Mascote sem Adestrador | `companions_mascote_no_adestrador` | error |
| Mais de 1 mascote | `companions_multiple_mascotes` | error |
| Autômato sem Engenheiro | `companions_automato_no_engenheiro` | error |
| Autômato Rank C | `companions_automato_rank_*` | error |
| Autômato sem 6 shifts | `companions_automato_shifts_*` | error |
| Autômato sem Lógica 5 | `companions_automato_logica_*` | error |
| Autômato sem 120g | `companions_automato_gems_*` | error |

---

## Bug fix

**"Novo Personagem" carregava draft existente** — `CharacterBuilderPage` só abria o modal de criação se `draft === null`. Corrigido: ao navegar para `/characters/new`, o modal é sempre exibido independente de draft existente.

---

## Compatibilidade

Fichas existentes salvas em localStorage são migradas automaticamente:
- `companions` → `[]` (array vazio)
- `bugigangaId` nos shifts → `undefined` (aceito sem migração)

---

## Verificação

1. `npm run type-check` — zero erros ✓
2. CharacterBuilder → aba Ciborgue: adicionar shifts, verificar bônus de atributo no resumo
3. Shift 3 → bônus aparece; shift 6 + New World → Gear disponível
4. Aba Companheiros → mascote sem Adestrador: select desabilitado
5. Autômato → checklist de requisitos atualiza em tempo real
6. Custo dos companheiros refletido no GemBudgetBar
7. Importar ficha antiga → sem erros, `companions: []`
8. Botão "+" na lista de personagens → sempre abre modal de criação
