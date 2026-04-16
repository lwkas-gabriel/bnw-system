# 2. Stack Técnica e Decisões de Tecnologia

## Dependências Principais

| Biblioteca | Versão | Papel | Justificativa |
|------------|--------|-------|---------------|
| React | 18.x | UI Framework | Hooks e Suspense cobrem todos os casos de uso. Ecossistema maduro. |
| TypeScript | 5.x | Type Safety | Essencial para codificar as regras do sistema como tipos explícitos. Evita bugs de lógica. |
| Vite | 5.x | Build tool | HMR instantâneo, tree-shaking nativo, lazy loading por rota sem configuração extra. |
| Zustand | 4.x | State Management | Mais simples que Redux para este escopo. Store pequena, sem boilerplate, middleware Immer embutido. |
| Immer | 10.x | Imutabilidade | Permite mutations diretas no Zustand sem copiar objetos manualmente. Crítico para fichas aninhadas. |
| React Router v6 | 6.x | Roteamento | Lazy loading nativo por rota. Cada módulo carrega sob demanda, mantendo bundle inicial leve. |
| React Hook Form | 7.x | Formulários | Performance superior (sem re-renders por keystroke) + integração nativa com Zod. |
| Zod | 3.x | Validação | Schemas TypeScript-first derivados dos tipos do personagem. Um schema serve validação e tipagem. |
| Tailwind CSS | 3.x | Estilização | Utility-first garante consistência sem CSS global. Dark theme via variáveis CSS. |
| Recharts | 2.x | Gráficos | Probabilidades de hit na calculadora de combate. |

---

## Por que Zustand e não Redux Toolkit

A ficha de personagem tem estrutura aninhada profunda:

```
Character
  └── haki
        └── advancedType
  └── akuma
        └── points[0]
              └── bonus
```

Redux Toolkit requereria slices separados com reducers complexos ou normalização de estado. Zustand com Immer permite escrever a mutação diretamente:

```ts
updateDraft(c => { c.haki!.kingStage = 'advanced'; });
```

sem criar um novo objeto para cada nível da hierarquia. O Immer garante imutabilidade por baixo. Para o escopo do projeto (sem colaboração em tempo real), Zustand é a escolha certa.

---

## Por que a engine de combate é TypeScript puro

O `combatEngine.ts` não importa nenhum módulo React. Decisão deliberada com três benefícios diretos:

1. **Testabilidade** — a engine pode ser testada com Vitest sem montar nenhum componente React.
2. **Reutilização** — a mesma engine serve a UI, testes automatizados e eventualmente uma API backend.
3. **Separação de responsabilidades** — bugs de cálculo e bugs de UI são investigados em camadas distintas.

---

## Scripts Disponíveis

```bash
npm run dev          # servidor de desenvolvimento (HMR)
npm run build        # build de produção (tsc + vite build)
npm run preview      # preview do build de produção
npm run test         # testes com Vitest
npm run test:ui      # testes com interface visual
npm run lint         # ESLint
npm run type-check   # verificação de tipos sem build
```

---

[← Visão Geral](./01-visao-geral.md) | [Arquitetura →](./03-arquitetura.md)
