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
| Fazer bump de versão / preparar PR para main | `bnw-versioning/SKILL.md` |
| Qualquer coisa que envolva combate ou engine | `bnw-rules/SKILL.md` + verificar `src/features/combat/engine/combatEngine.ts` |
| Qualquer coisa que envolva gemas / validação | `bnw-rules/SKILL.md` + verificar `src/features/character/utils/` |

---

## Mapa de Arquivos Críticos

```
src/shared/types/character.ts     ← TIPOS: Character, Haki, Akuma, AM, Cyborg, Technique, PericiaId,
                                            FactionType, FactionData, LocationId, PrimaryHakiType, TechniqueSource
src/shared/types/combat.ts        ← TIPOS: CombatantState, TurnChoice, DiceRoll, CombatSummary
src/shared/types/ship.ts          ← TIPOS: Ship, ShipSize, ShipOwnership, Klabautermann
src/shared/types/io.ts            ← ImportStatus, ExportEnvelope (JSON exportado)
src/data/                         ← DADOS IMUTÁVEIS do sistema (nunca modificar em runtime)
  gemCosts.ts      ← GEM_COSTS (FONTE ÚNICA de custos), GEM_BUDGET_MIN/MAX, FACTION_DISCOUNT_GEMS
  attributes.ts    ← ATTR_KEYS, ATTR_SHORT_LABELS (POD/PRE/DEF/CON), ATTR_LABELS, BASE_ATTRIBUTES
  artesMarciais.ts ← AM_FAIXAS (14 faixas), faixaIndex(), hasReachedFaixa(), faixaStatBonuses()
  cyborg.ts        ← CYBORG_LOCATIONS, CYBORG_SHIFT_BONUS, cyborgBonusLabel()
  equipment.ts     ← QUALITY_LABELS, QUALITY_BONUS, EQUIPMENT_PRICES, SLOT_LABELS, SLOT_ATTRS
  locations.ts     ← LOCATION_LABELS
  races.ts, haki.ts (HAKI_TYPE_NAMES), techniques.ts (TECHNIQUE_RANKS, TECHNIQUE_SOURCE_LABELS), uniqueWeapons.ts
  akumaModules.ts  ← módulos Zoan/Paramecia, *_BY_ID, AKUMA_TYPE_LABELS, regras por rank (Vigor, Points, slots)
  pericias.ts      ← PERICIAS (11), RACE_PERICIA_BONUS (derivado de RACES), ZOAN_CLASS_PERICIA_BONUS
  professions.ts   ← PROFESSIONS (7), PROFESSIONS_BY_ID, STANDARD_CRAFT_DC
  bugigangas.ts    ← BUGIGANGAS (16), BUGIGANGAS_BY_ID
  ships.ts         ← SHIP_SIZES (com maxHull), SHIP_MECHANISMS, SHIP_COMODOS, SHIP_ROLE_LABELS,
                     SHIP_OWNERSHIP_LABELS, ENGINEER_DISCOUNT, KLABAUTERMANN_VOYAGES
  factions.ts      ← FACTIONS (5), getFactionRank(), getFactionLabel(), COMMISSIONED_SHIP_PRESET
src/features/character/utils/
  attrCalc.ts      ← bpn(), energyMax(), characterMaxEnergy(), baseAttributes(), totalAttributePoints()
  gemBudget.ts     ← computeGemBudget(), computeFactionDiscount()
  haki.ts          ← computeHakiCost(), hakiCostBreakdown(), hakiStageNum()
  akuma.ts         ← createAkuma(), applyAkumaRank(), syncFreeTechniques()
  equipment.ts     ← isUniqueWeapon(), hasWeaponTrait()
  artesMarciais.ts ← isUniqueWeaponFromLaranja()
  attrBreakdown.ts ← computeAttrBreakdown() (somatória de atributos por fonte)
  validator.ts     ← validateCharacterFull(), ValidationIssue, ValidationCategory, ValidationReport
  exporter.ts      ← exportToJSON(), exportToForumHTML() (render* por seção), downloadCharacter*()
  importer.ts      ← parseImportJSON(), parseImportForumHTML() (parsers por seção), importFromFile/Clipboard()
src/features/character/hooks/useDraft.ts       ← { draft, updateDraft } com seletores (use nas seções)
src/features/character/store/characterStore.ts  ← updateDraft(), saveDraft(), loadCharacter()
src/features/character/components/              ← seções do builder; subpastas akuma/ e equipment/
src/features/combat/engine/combatEngine.ts      ← ENGINE PURA (sem React): resolveAttributes, processTurn, simulateCombat
src/features/combat/store/combatStore.ts        ← simulate(), setCharA/B(), setChoice()
src/features/ships/store/shipStore.ts           ← CRUD de navios (helper withShip), mecanismos, cômodos, viagens
src/features/ships/utils/                       ← shipCalc (preço, slots), shipExporter, shipImporter
src/features/ships/components/                  ← abas da página de Embarcações
src/shared/components/index.tsx                 ← TODOS os componentes reutilizáveis
src/shared/utils/                               ← format (formatBerries), download, importIO, labels (invertLabels)
src/shared/hooks/                               ← useCopyToClipboard, useFileImport
src/router/index.tsx                            ← rotas com lazy loading
src/shared/components/AppLayout.tsx             ← sidebar nav (array NAV)
src/pages/
  HomePage.tsx, CharacterListPage.tsx, CharacterBuilderPage.tsx
  CombatPage.tsx, ItemsPage.tsx, ImportPage.tsx
  ShipsPage.tsx, PericiasPage.tsx, ProfissoesPage.tsx
```

Convenções de código (onde cada coisa vive, tipagem, testes, contrato da ficha do fórum, dívida conhecida): seção "Convenções de código e manutenibilidade" do `CLAUDE.md`.

---

## Regras de Ouro (NUNCA violar)

1. **Lógica de negócio NUNCA em componentes React** → vai em `utils/` ou `combatEngine.ts`
2. **Custos de gemas SEMPRE em `GEM_COSTS`** em `src/data/gemCosts.ts` — nunca hardcode em JSX
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
