# 11. Princípios de Desenvolvimento

## Regras de Ouro

1. **Lógica de negócio nunca fica em componentes React.**  
   Toda regra do sistema fica em `utils/` ou na engine de combate. Componentes apenas leem estado e disparam updates.

2. **`GEM_COSTS` é a única fonte de verdade para custos.**  
   Nunca hardcode valores de gema em JSX ou em outros arquivos. Se o sistema mudar os preços, apenas `gemBudget.ts` precisa ser atualizado.

3. **Dados do sistema são imutáveis em `src/data/`.**  
   `races.ts`, `haki.ts`, `techniques.ts`, `uniqueWeapons.ts` são constantes — nunca modificados em runtime.

4. **Types primeiro.**  
   Qualquer nova mecânica começa com tipos TypeScript explícitos em `shared/types/`. Só depois vêm dados, engine e UI.

5. **Validação sempre em PT-BR com sugestão de correção.**  
   Issues sem campo `fix` preenchido são considerados incompletos.

6. **Coming soon = rota real com `ComingSoonPage`.**  
   Nunca remover uma rota — apenas substituir o componente quando o módulo estiver pronto.

7. **`updateDraft()` é o único ponto de entrada para modificações de ficha.**  
   Nunca modificar `draft` diretamente. O Immer só funciona dentro do updater.

---

## Padrão para Adicionar uma Nova Regra

Quando uma nova mecânica do sistema é identificada:

```
1. Adicionar o tipo em shared/types/character.ts
2. Adicionar dados em src/data/ (se constante do sistema)
3. Implementar na engine (combatEngine.ts) se afeta combate
4. Adicionar validação em validator.ts
5. Adicionar custo em gemBudget.ts se tem custo em gemas
6. Adicionar default em importer.ts → migrateCharacter()
7. Criar/atualizar componente de UI na feature correspondente
```

---

## Testes

Regras de negócio são TypeScript puro e devem ter testes (Vitest, `environment: node`).

```bash
npm run test:run  # executa todos os testes uma vez
npm run test      # modo watch
npm run test:ui   # interface visual do Vitest
```

Os testes ficam em `__tests__/` ao lado do código; fixtures de personagem em
`src/features/character/utils/__tests__/fixtures.ts` (`createCharacterFixture`, `createRichCharacterFixture`).

| Área | Arquivo(s) | O que cobre |
|------|------------|-------------|
| Engine de combate | `combat/engine/__tests__/combatEngine.test.ts` | atributos, CON temp, dano, técnicas, `processTurn`, estado inicial |
| Validação | `character/utils/__tests__/validator.test.ts` | cada categoria de erro com ficha inválida |
| Gemas / Haki | `gemBudget.test.ts`, `haki.test.ts` | custos, secundário grátis, Rei, Arma Única via Laranja |
| Export / Import | `exporter.test.ts` (+ snapshots) | formato do fórum, round-trip JSON e fórum, Akuma, energia, aliases |
| Utils de domínio | `attrCalc`, `attrBreakdown`, `akuma`, `equipment` | regras extraídas dos componentes |
| Stores | `character/store/__tests__`, `ships/store/__tests__` | ações e invariantes |
| Navios | `ships/utils/__tests__` | `shipCalc`, round-trip de export/import |
| Dados | `data/__tests__` | facções, faixas de AM, Ciborgue |
| Shared | `shared/utils/__tests__` | formatação, `invertLabels` |

Regras: toda regra nova ganha teste; bug corrigido ganha um teste que falharia antes da correção;
mudança em exporter/importer exige round-trip.

---

## Convenções de Código

### Nomes de funções

- `resolve*` — funções que calculam um valor baseado em múltiplas entradas (ex: `resolveAttributes`).
- `compute*` — funções que agregam dados em um resultado complexo (ex: `computeGemBudget`).
- `validate*` — funções que verificam regras e retornam issues (ex: `validateCharacterFull`).
- `check*` — checkers individuais chamados pelo validador principal (ex: `checkHaki`).
- `export*` / `import*` — funções de serialização/deserialização.
- `build*` — funções que constroem estruturas de dados (ex: `buildTempConStack`).

### Tipos vs Interfaces

- `interface` para tipos de objetos que podem ser estendidos (ex: `Character`, `Technique`).
- `type` para unions, aliases e tipos compostos (ex: `RaceId`, `TechniqueRank`).

---

[← Coming Soon](./10-coming-soon.md) | [Glossário →](./12-glossario.md)
