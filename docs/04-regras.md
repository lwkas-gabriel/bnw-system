# 4. Sistema de Regras Implementado

## Fórmulas Principais

| Stat | Fórmula | Arquivo |
|------|---------|---------|
| BPN | `floor(nível × 3/4)` | `attrCalc.ts → bpn()` |
| Energia | `nível × 3 + gemasInvestidas` | `attrCalc.ts → energyMax()` |
| Pontos de atributo | `6 + Nível + Bônus Raciais` | `attrCalc.ts → totalAttributePoints()` |
| Roll de ataque | `PRE + BPN + Modificadores + 3d6` | `combatEngine.ts → resolveAttack()` |
| Threshold de defesa | `DEF + BPN + Modificadores + 10` | `combatEngine.ts → resolveAttack()` |
| Dano por hit | `POD + Modificadores − CON (temp first)` | `combatEngine.ts → resolveDamage()` |
| Invasão (ataque) | `3d6 + POD + PRE` | — |
| Invasão (defesa) | `13 + DEF + CON` | — |

---

## Haki — Decisão Crítica: Secundário Gratuito

O Haki secundário **não custa gemas** — apenas aventuras. Representa uma economia de 100g que precisa ser refletida corretamente no orçamento.

**Implementação:**
- `gemBudget.ts` calcula o custo apenas do Haki primário (`primaryStage × 20g`).
- O `secondaryStage` não entra no breakdown de gemas.
- A UI exibe o badge `Gratuito` explicitamente para evitar confusão — este é um erro comum em fichas criadas manualmente.

---

## Haki Avançado — Só Um Tipo Permitido

O sistema permite apenas **um** tipo de Haki Avançado por personagem:

| Tipo | Custo | Benefício |
|------|-------|-----------|
| Armamento Avançado Completo | 40g | +4 POD ou +4 CON (+ efeito especial) |
| Observação Avançado Completo | 40g | +4 PRE ou +4 DEF (+ efeito especial) |
| Rei Avançado | **20g** | Adiciona Ambição ao bônus de todas as técnicas com Rei ativo |

O Rei Avançado é 20g mais barato que as outras opções. Com Ambição 5 (máximo) e usando 1 técnica ofensiva + 1 defensiva por turno, entrega +10 de bônus total por turno sem custo adicional de EN.

O sistema valida que apenas um tipo avançado está selecionado e impede combinações inválidas.

---

## CON Temporária — Stack de Absorção

CON temporária (Haki Armamento e técnicas defensivas de CON) é consumida **antes** da CON base. A implementação usa uma pilha em vez de um valor simples:

```ts
tempConStack: { source: string; value: number }[]
```

Isso permite rastrear a origem de cada buffer, essencial para efeitos que ignoram CON temporária:
- **Ryuo completo:** 4 de dano direto na CON base.
- **Kitetsu auto-dano:** 1 de dano direto por técnica usada.

A função `absorbDamage()` drena a pilha sequencialmente, retornando quanto foi absorvido e quanto chegou à CON base.

---

## Retém 1 CON — Mecânica de Zoans Mitológicas

Zoans Mitológicas têm acesso ao módulo exclusivo **"Retém 1 CON na primeira vez que for nocauteado"**.

**Implementação no `combatEngine.ts`:**
- `retemUsed: boolean` no `CombatantState` rastreia se já foi usado na aventura.
- Quando `isKnockout` seria `true` E `retemUsed` é `false` E a Akuma é Zoan Mitológica, o dano é limitado a deixar a CON em 1.
- `retemActivated: true` é retornado no `DamageResult` para o log de combate registrar o evento.

---

## JxJ — Turno 1 Simultâneo

Em combates Jogador × Jogador, ambos atacam e defendem **simultaneamente** no turno 1 — independente de quem teria sido nocauteado. A partir do turno 2, quem está mais ferido (menor CON) age primeiro.

O **protagonismo** (player age primeiro contra NPC) **não se aplica** no T1 de JxJ. Isso cria a possibilidade de destruição mútua — ambos nocauteados no mesmo turno.

---

## Haissaikai — Arma com Escala em Zoan

A característica Haissaikai espelha os bônus do point Zoan ativo na arma:

| Point ativo | Bônus na arma |
|-------------|---------------|
| Híbrido ou Animal (Rank A) | +4 atributo principal + +4 complementar |
| Desperto | +4/+4 (metade de +8/+8) |

A Faixa Branca de AM acumula +2 na arma, totalizando **+6 base** antes de qualquer técnica.

Pode ser obtido **gratuitamente** via Faixa Laranja de Artes Marciais, liberando 20g para outras alocações.

---

## Kitetsu — Dobra a Base, Não os Bônus de Caminhos

O Kitetsu dobra o bônus **BASE** da técnica (Rank A: +5 → +10), mas **não inclui** bônus adicionais de Caminhos (AM Roxa +2, AM Verde +2, Rei Avançado).

**Exemplo com Kitetsu + AM Roxa + Rei Avançado (Amb.5):**
```
(5 × 2) + 2 + 5 = +17 por técnica ofensiva
```

**Custo:** 1 de dano direto na CON base por técnica usada (2/turno usando ofensiva + defensiva). Este dano não regenera até o fim do combate.

---

## Logia — Intangibilidade e Área Gratuita

Duas mecânicas com impacto desproporcional:

| Mecânica | Efeito | Custo |
|----------|--------|-------|
| Intangibilidade | +4 DEF +4 CON passivos, sempre ativos | 0 EN |
| Ataque em Área Controlado | Grátis em todas as técnicas ofensivas | 0 slots |
| Elementalista | Aplica Status Aprimorado em qualquer ataque | 1 EN |

Em outras classes, Área Controlado consome um slot de Efeito Aderido Rank A. Para Logias, é incluído automaticamente.

---

[← Arquitetura](./03-arquitetura.md) | [Character Builder →](./05-character-builder.md)
