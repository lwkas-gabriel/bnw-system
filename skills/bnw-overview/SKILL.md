---
name: bnw-overview
description: >
  Leia este skill SEMPRE que for trabalhar em qualquer tarefa do projeto BNW System.
  Ele funciona como mapa — aponta para onde cada coisa está antes de você começar a codar.
---

# BNW System — Mapa do Projeto

## Qual skill ler dependendo da tarefa

| Tarefa | Skill a ler em seguida |
|--------|------------------------|
| Adicionar/editar regra de jogo (fórmula, mecânica) | `bnw-rules/SKILL.md` |
| Criar componente React, section do builder, nova página | `bnw-frontend/SKILL.md` |
| Adicionar módulo novo (Profissões, Perícias, Embarcações) | `bnw-features/SKILL.md` |
| Qualquer coisa que envolva combate ou engine | `bnw-rules/SKILL.md` + verificar `src/features/combat/engine/combatEngine.ts` |
| Qualquer coisa que envolva gemas / validação | `bnw-rules/SKILL.md` + verificar `src/features/character/utils/` |

---

## Mapa de Arquivos Críticos

```
src/shared/types/character.ts     ← TIPOS: Character, Haki, Akuma, AM, Cyborg, Technique, PericiaId
src/shared/types/combat.ts        ← TIPOS: CombatantState, TurnChoice, DiceRoll, CombatSummary
src/shared/types/ship.ts          ← TIPOS: Ship, ShipSize, ShipMechanism, ShipComodo, Klabautermann
src/data/                         ← DADOS IMUTÁVEIS do sistema (nunca modificar em runtime)
  races.ts, haki.ts, techniques.ts, uniqueWeapons.ts
  pericias.ts     ← PERICIAS (11), PERICIAS_DC, periciaRollBonus()
  professions.ts  ← PROFESSIONS (7), PROFESSIONS_BY_ID, ProfessionData
  bugigangas.ts   ← BUGIGANGAS (16), BugigangaData
  ships.ts        ← SHIP_SIZES, SHIP_MECHANISMS, SHIP_COMODOS
src/features/character/utils/
  attrCalc.ts     ← bpn(), energyMax(), totalAttributePoints(), totalPericiaPoints()
  gemBudget.ts    ← GEM_COSTS (FONTE ÚNICA), computeGemBudget()
  validator.ts    ← validateCharacterFull(), ValidationIssue, ValidationReport
  exporter.ts     ← exportToJSON(), exportToForumText()
  importer.ts     ← importFromFile(), migrateCharacter()
src/features/character/store/characterStore.ts  ← updateDraft(), saveDraft(), loadCharacter()
src/features/combat/engine/combatEngine.ts      ← ENGINE PURA (sem React)
src/features/combat/store/combatStore.ts        ← simulate(), setCharA/B(), setChoice()
src/features/ships/store/shipStore.ts           ← CRUD de navios, mecanismos, cômodos, viagens
src/shared/components/index.tsx                 ← TODOS os componentes reutilizáveis
src/router/index.tsx                            ← rotas com lazy loading
src/shared/components/AppLayout.tsx             ← sidebar nav (array NAV)
src/pages/
  HomePage.tsx, CharacterListPage.tsx, CharacterBuilderPage.tsx
  CombatPage.tsx, ItemsPage.tsx, ImportPage.tsx
  ShipsPage.tsx, PericiasPage.tsx, ProfissoesPage.tsx
```

---

## Regras de Ouro (NUNCA violar)

1. **Lógica de negócio NUNCA em componentes React** → vai em `utils/` ou `combatEngine.ts`
2. **Custos de gemas SEMPRE em `GEM_COSTS`** em `gemBudget.ts` — nunca hardcode em JSX
3. **`updateDraft(c => { ... })`** é o único ponto de entrada para modificar ficha
4. **Engine de combate é TypeScript puro** — não importar React, não importar stores
5. **Types primeiro** — qualquer nova mecânica começa em `shared/types/character.ts`
6. **Validação sempre em PT-BR** com campo `fix` preenchido
7. **Módulos implementados usam páginas reais** — substituir `<Navigate>` ou `ComingSoonPage` por lazy-loaded pages em `router/index.tsx` e marcar `available: true` no `MODULES` de `HomePage.tsx`

---

## Stack em Uso

React 18 + TypeScript 5 + Vite + Zustand + Immer + React Router v6 + Tailwind CSS + Recharts

---

## Onde Está a Documentação Completa

```
docs/
  README.md              ← índice
  01-visao-geral.md
  02-stack.md
  03-arquitetura.md      ← fluxo de dados, estrutura de pastas
  04-regras.md           ← mecânicas de combate implementadas (fórmulas, CON temp, JxJ)
  05-character-builder.md
  06-calculadora-combate.md
  07-validacao.md
  08-import-export.md
  09-componentes.md      ← catálogo de componentes shared
  10-coming-soon.md      ← passo a passo para novos módulos
  11-principios.md       ← padrões de código
  12-glossario.md
  13-progressao.md       ← tabela XP, gemas (início=20, max=400, excesso→4XP)
  14-pericias.md         ← 11 perícias, roll, DCs, pontos por nível
  15-racas.md            ← 8 raças com bônus de atributo e perícia
  16-haki.md             ← estágios Armamento/Observação, Rei, Avançado
  17-akuma.md            ← Zoan/Logia/Paramecia, ranks, passivos
  18-artes-marciais.md   ← 14 faixas, escolha Laranja, Rokushiki
  19-tecnicas.md         ← ranks E-A, efeitos aderidos gerais e Rank A
  20-armas-unicas.md     ← 26 armas com mecânicas detalhadas
  21-ciborgue.md         ← 6 shifts, Gears, Ciborgue Completo
  22-faccoes.md          ← 5 facções, hierarquias, Desconto de Facção, Prisão
  23-gemas.md            ← início=20g, máx=400g, formas de ganhar/gastar
  24-profissoes.md       ← 7 profissões, mecânicas de craft, DC 9/18/27
  25-companheiros.md     ← Ranks C/B/A, Mascotes, Autômatos, recrutamento
  26-navegacao.md        ← turnos em alto mar, rotas, Combate em Alto Mar
  27-embarcacoes.md      ← tamanhos, mecanismos, cômodos, Klabautermann
  28-itens.md            ← equipamentos, consumíveis, bugigangas, mercado global
```

Se precisar de detalhe de uma mecânica específica, leia o doc correspondente via `view`.
Não re-explique o que já está nos docs — apenas aponte para eles se necessário.
