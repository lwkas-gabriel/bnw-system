# BNW Character System

Aplicação para montagem de personagens e calculadora de combate do RPG de fórum BNW (One Piece).

## Stack

| Lib | Uso |
|-----|-----|
| React 18 + Vite | UI e build |
| TypeScript | Tipagem das regras do sistema |
| Zustand + Immer | Estado global (fichas, combate) |
| React Router v6 | Roteamento por módulo com lazy loading |
| React Hook Form + Zod | Formulários e validação de fichas |
| Tailwind CSS | Estilização utility-first |
| Recharts | Gráficos de probabilidade de combate |
| Vitest | Testes unitários do combatEngine |

## Setup

```bash
npm install
npm run dev
```

## Estrutura

```
src/
  features/
    character/          ← Character Builder
      store/            ← Zustand slice
      utils/            ← attrCalc, gemBudget
    combat/             ← Calculadora de Combate
      engine/           ← combatEngine.ts (puro, sem React)
      store/            ← Zustand slice
    items/              ← Construtor de Itens
    ships/              ← 🔜 Coming soon
    professions/        ← 🔜 Coming soon
    pericias/           ← 🔜 Coming soon
  shared/
    types/              ← character.ts, combat.ts
  data/                 ← Dados estáticos do sistema
    races.ts
    haki.ts
    techniques.ts
    uniqueWeapons.ts
```

## Módulos disponíveis

| Módulo | Status |
|--------|--------|
| Character Builder (raça, atributos, caminhos, técnicas) | ✅ Dados completos |
| Calculadora de Combate (engine, stores) | ✅ Dados completos |
| Construtor de Itens | ✅ Dados parciais |
| Embarcações | 🔜 Aguardando regras |
| Profissões | 🔜 Aguardando regras |
| Perícias | 🔜 Aguardando regras |

## Testando o combatEngine

O `combatEngine.ts` é puro TypeScript sem dependências de React — pode ser testado diretamente com Vitest:

```bash
npm run test
```

## Próximos passos

1. Implementar componentes UI do Character Builder
2. Implementar tela de Calculadora de Combate
3. Receber arquivos de regras de Perícias, Profissões e Embarcações
4. Expandir módulos de coming soon
