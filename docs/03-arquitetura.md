# 3. Arquitetura da Aplicação

## Estrutura de Pastas

```
src/
├── shared/
│   ├── types/
│   │   ├── character.ts      ← Tipos do personagem: Character, Haki, Akuma, AM, Cyborg...
│   │   └── combat.ts         ← Tipos de combate: CombatantState, TurnChoice, DiceRoll...
│   └── components/
│       └── index.tsx         ← Componentes reutilizáveis: Button, Input, Badge...
│
├── data/                     ← Constantes imutáveis do sistema
│   ├── races.ts
│   ├── haki.ts
│   ├── techniques.ts
│   ├── uniqueWeapons.ts
│   └── index.ts              ← Barrel export
│
├── features/
│   ├── character/
│   │   ├── components/       ← AttributesSection, HakiSection, AkumaSection...
│   │   ├── store/
│   │   │   └── characterStore.ts
│   │   └── utils/
│   │       ├── attrCalc.ts   ← bpn(), energyMax(), validateAttributes()
│   │       ├── gemBudget.ts  ← computeGemBudget(), GEM_COSTS
│   │       ├── validator.ts  ← validateCharacterFull(), ValidationReport
│   │       ├── exporter.ts   ← exportToJSON(), exportToForumText()
│   │       └── importer.ts   ← importFromFile(), parseImportJSON()
│   │
│   ├── combat/
│   │   ├── engine/
│   │   │   └── combatEngine.ts  ← Lógica pura, sem React
│   │   └── store/
│   │       └── combatStore.ts
│   │
│   └── items/                ← Estrutura pronta, UI pendente
│
├── pages/                    ← Orquestradores (sem lógica de negócio)
│   ├── HomePage.tsx
│   ├── CharacterListPage.tsx
│   ├── CharacterBuilderPage.tsx
│   ├── CombatPage.tsx
│   ├── ImportPage.tsx
│   ├── ItemsPage.tsx
│   └── ComingSoonPage.tsx
│
└── router/
    └── index.tsx             ← Rotas com lazy loading
```

---

## Regra de Ouro da Arquitetura

> **Nenhum feature importa diretamente de outro.**  
> Comunicação entre features ocorre via `shared/` ou via stores Zustand.

---

## Fluxo de Dados — Character Builder

O fluxo segue o padrão unidirecional:

```
Usuário interaje com componente (ex: HakiSection)
    ↓
Componente chama updateDraft(c => { ... })
    ↓
Zustand + Immer aplica a mutação
    ↓
characterStore revalida via validateCharacter()
    e recomputa gemBudget automaticamente
    ↓
Componentes leem draft, errors e budget reativamente
```

> **Regra:** nenhum componente faz cálculo de regras. Toda lógica de negócio fica em `utils/` ou na engine de combate.

---

## Fluxo de Dados — Combate

```
useCombatStore.simulate()
    ↓
simulateCombat(charA, charB, choices, mode)  ← combatEngine.ts
    ↓
processTurn() × N turnos
    ↓
CombatSummary { turns, winner, narration }
    ↓
combatStore.result → CombatPage renderiza log
```

---

## Persistência

O `characterStore` usa o middleware `persist` do Zustand com `localStorage`. Apenas o array `saved` é persistido — o `draft` (ficha em edição) é descartado ao fechar o navegador.

> **Decisão intencional:** evita fichas parcialmente editadas reaparecendo inesperadamente na próxima sessão.

Para migração futura (novos campos no tipo `Character`), o `importer.ts` usa `migrateCharacter()` que preenche campos ausentes com defaults seguros — fichas exportadas em versões anteriores continuam funcionando.

---

## Lazy Loading por Módulo

Cada página é carregada via `React.lazy()` e envolvida em `Suspense`. O bundle inicial carrega apenas `AppLayout`, `HomePage` e o router. Módulos pesados (Character Builder, Combat Engine) só são baixados quando o usuário navega até eles.

```ts
// router/index.tsx
const CharacterBuilderPage = lazy(() => import("../pages/CharacterBuilderPage"));
const CombatPage           = lazy(() => import("../pages/CombatPage"));
```

---

[← Stack Técnica](./02-stack.md) | [Regras Implementadas →](./04-regras.md)
