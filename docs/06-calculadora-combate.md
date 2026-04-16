# 6. Calculadora de Combate

## Engine — combatEngine.ts

TypeScript puro, sem dependências de React. Pode ser importado e testado de forma isolada.

### Funções Principais

| Função | Descrição |
|--------|-----------|
| `roll3d6()` | Rola 3d6, detecta crítico de sucesso (6,6,6) e falha (1,1,1) |
| `averageRoll()` | Retorna resultado médio (11) para simulação determinística |
| `calcBPN(level)` | Calcula BPN: `floor(level × 3/4)` |
| `calcEnergy(level, gems)` | Calcula energia: `level × 3 + gems` |
| `resolveAttributes(char, buffs)` | Calcula atributos efetivos dado o conjunto de buffs ativos |
| `resolveTechniqueBonus(char, choice, isOffensive)` | Bônus efetivo de técnica com Kitetsu, AM, Rei Avançado |
| `buildTempConStack(char, state, choice)` | Monta pilha de CON temporária do turno |
| `absorbDamage(incoming, stack)` | Drena a pilha de CON temp, retorna residual |
| `resolveAttack(attacker, choice, defender, choice)` | Roll de ataque vs threshold de defesa |
| `resolveDamage(attacker, choice, defenderState, choice)` | Dano com absorção, dano direto, Retém |
| `processTurn(stateA, stateB, choiceA, choiceB, turn, mode)` | Turno completo: ataques, energia, Kitetsu |
| `simulateCombat(charA, charB, choices, mode)` | Loop de turnos até fim do combate |
| `hitProbability(pre, def)` | % de acerto via contagem exaustiva das 216 combinações |
| `buildNarration(turns, charA, charB)` | Texto formatado para o fórum |

---

## TurnChoice — Configuração por Turno

```ts
interface TurnChoice {
  offensive: Technique | null;
  defensive: Technique | null;
  buffs: {
    hakiArmament: boolean;
    hakiObservation: boolean;
    hakiKing: boolean;
    hakiAdvanced: boolean;
    zoanPoint: "hybrid" | "animal" | "awakened" | null;
    logiaElementalDomain: boolean;
  };
  useElementalista: boolean;
}
```

Cada turno tem um `TurnChoice` independente para cada combatente. Isso permite simular estratégias variadas turno a turno — ex: turno 1 com `POD tech + CON tech`, turno 2 com `PRE tech + DEF tech`.

---

## Modos de Combate

| Modo | Comportamento |
|------|---------------|
| `"jxj"` | Turno 1: ambos atacam simultaneamente. A partir do T2: mais ferido age primeiro. |
| `"vs_npc"` | Protagonismo: player age primeiro. NPC só ataca se player não nocauteou no mesmo turno. |

---

## Ordem de Resolução por Turno

```
1. Ataque A → B (roll + damage)
2. Ataque B → A (simultâneo se JxJ T1, condicional nos demais)
3. Custo de energia (Haki + técnicas + Elementalista + Shusui)
4. Kitetsu self-damage (1 CON direto por técnica usada)
5. Verificação de fim de combate + próximo a agir
```

---

## resolveAttributes — Prioridade de Buffs

A função aplica os bônus na seguinte ordem:

1. **Base** (1/1/1/3 + investidos + racial)
2. **Akuma no Mi passivos** (Vigor Animal Zoan, Natureza Elemental Logia, Intangibilidade Logia)
3. **Point Zoan ativo** (se `buffs.zoanPoint !== null`)
4. **Logia Domínio Elemental** (se `buffs.logiaElementalDomain && rank === 'S'`)
5. **Haki do Armamento** (se `buffs.hakiArmament`)
6. **Haki da Observação** (se `buffs.hakiObservation`)
7. **Artes Marciais flat bonuses** (Cinza +2 PRE, Azul Clara +2 DEF, Azul Escura +2 POD, Amarela +2 CON)

CON temporária do Haki Armamento **não** entra em `resolveAttributes` — é gerenciada separadamente via `tempConStack`.

---

## combatStore — API Principal

```ts
setMode(mode: CombatMode): void
setCharA(char: Character): void
setCharB(char: Character): void
setChoice(turn: number, side: "a" | "b", choice: TurnChoice): void
addTurn(): void
removeTurn(index: number): void
toggleAverage(): void   // alterna entre 3d6 real e média (11)
simulate(): void        // executa em setTimeout para não bloquear a UI
reset(): void
```

---

## CombatSummary — Output

```ts
interface CombatSummary {
  mode: CombatMode;
  turns: TurnResult[];
  winner: string | null;     // character.id ou null (empate)
  turnsCount: number;
  finalStates: [CombatantState, CombatantState];
  narration: string;         // texto pronto para o fórum
}
```

---

[← Character Builder](./05-character-builder.md) | [Validação →](./07-validacao.md)
