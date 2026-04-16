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

A engine de combate é a camada mais crítica e deve ter cobertura de testes. Por ser TypeScript puro:

```bash
npm run test      # executa Vitest
npm run test:ui   # interface visual do Vitest
```

### Casos prioritários

| Teste | Arquivo | O que verificar |
|-------|---------|-----------------|
| `roll3d6()` | `combatEngine.test.ts` | Distribuição correta, detecção de críticos |
| `hitProbability()` | `combatEngine.test.ts` | Casos extremos (PRE >> DEF, PRE << DEF), PRE = DEF ≈ 58% |
| `resolveDamage()` | `combatEngine.test.ts` | Absorção de CON temp, Retém 1 CON, dano direto Ryuo |
| `processTurn()` | `combatEngine.test.ts` | JxJ simultâneo T1, protagonismo vs NPC, Kitetsu self-damage |
| `simulateCombat()` | `combatEngine.test.ts` | Cenários conhecidos com resultados validados manualmente |
| `validateCharacterFull()` | `validator.test.ts` | Cada categoria de erro com ficha deliberadamente inválida |
| `computeGemBudget()` | `gemBudget.test.ts` | Haki secundário grátis, Haissaikai via Laranja |
| `parseImportJSON()` | `importer.test.ts` | JSON inválido, campos ausentes, migração de versões anteriores |

### Estrutura sugerida para testes

```
src/
  features/
    combat/
      engine/
        combatEngine.ts
        combatEngine.test.ts    ← testes da engine
    character/
      utils/
        validator.ts
        validator.test.ts
        gemBudget.ts
        gemBudget.test.ts
        importer.ts
        importer.test.ts
```

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
