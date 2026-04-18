# 18. Artes Marciais

## Visão Geral

O caminho de Artes Marciais é composto por **14 faixas** divididas em 3 grupos por localização. Cada faixa custa **10g** e todas as faixas anteriores devem ser adquiridas em ordem.

**Custo acumulado:**
- Faixa Branca (1ª): 10g
- Faixa Grão Mestre (14ª): 140g total

---

## Faixas Básicas — qualquer localização

| Faixa | ID | Bônus | Requisito |
|-------|----|-------|-----------|
| Branca | `branca` | +2 de bônus na arma equipada | Sobreviver a 1 combate |
| Cinza | `cinza` | +2 PRE | 1 turno de treinamento |
| Azul Clara | `azul_clara` | +2 DEF | 2 turnos de treinamento |
| Azul Escura | `azul_escura` | +2 POD | 3 turnos de treinamento |
| Amarela | `amarela` | +2 CON | 4 turnos de treinamento |

Os bônus de Cinza–Amarela são **cumulativos e flat**: personagem na Amarela tem +2 PRE, +2 DEF, +2 POD, +2 CON.

---

## Faixas Intermediárias — requerem Grand Line

| Faixa | ID | Bônus | Requisito |
|-------|----|-------|-----------|
| Laranja | `laranja` | +1 em todos os itens defensivos equipados; **2 Técnicas Rank A OU 1 Arma Única** gratuita | Finalizar 1 combate |
| Verde | `verde` | +2 bônus em técnicas **defensivas** | Finalizar 1 combate |
| Roxa | `roxa` | +2 bônus em técnicas **ofensivas** | Finalizar 1 combate |
| Marrom | `marrom` | +1 em todos os itens defensivos equipados; **1 Técnica Rank A** gratuita | Vencer 1 combate |

---

## Faixas Avançadas — requerem New World

| Faixa | ID | Bônus | Requisito |
|-------|----|-------|-----------|
| Preta | `preta` | Pode equipar **1 arma extra** (não permite 2 armas únicas simultâneas) | Vencer 1 oponente |
| Coral | `coral` | +2 bônus na **arma extra** | Vencer 1 oponente |
| Rajada | `rajada` | +1 em **todos os itens defensivos** equipados | Vencer 1 oponente |
| Vermelha | `vermelha` | +2 em POD **ou** PRE **ou** DEF **ou** CON por **2 EN** (escolha dura o turno inteiro) | Vencer 2 oponentes |
| Grão Mestre | `grao_mestre` | **Escolha:** +2 nas rolagens de ataque por 3 EN (evita falha crítica, facilita acerto crítico) **OU** -2 nas rolagens do oponente por 3 EN (facilita erro crítico, impede acerto crítico) | Vencer 2 oponentes |

---

## Escolha da Faixa Laranja

Ao atingir a **Faixa Laranja**, o personagem escolhe **uma** opção permanente:

| Opção | ID | Benefício |
|-------|----|-----------|
| 2 Técnicas Rank A | `techniques` | 2 técnicas Rank A gratuitas (`source: "artes_marciais"`) |
| Arma Única | `unique_weapon` | 1 Arma Única gratuita (não cobra 20g) |

A Arma Única da Laranja pode ser **aplicada a armas já existentes ou a armas de outras qualidades**, com pagamento do valor em berries (sem custo de gemas).

---

## Bônus em Equipamentos Defensivos

As faixas Laranja, Marrom e Rajada somam bônus em itens defensivos equipados:

| Faixa | Bônus |
|-------|-------|
| Laranja | +1 em cada item defensivo |
| Marrom | +1 adicional (total +2) |
| Rajada | +1 adicional (total +3) |

> **Nota de implementação:** esses bônus são sobre **equipamentos defensivos**, não flat de atributo. Precisam ser calculados em conjunto com o sistema de Equipamentos.

---

## Bônus Flat de Atributo (Cinza–Amarela)

Implementados em `getFaixaBonuses()` no `combatEngine.ts`:

```ts
cinza:       { precision: 2 }
azul_clara:  { defense: 2 }
azul_escura: { power: 2 }
amarela:     { constitution: 2 }
// branca, laranja..grao_mestre: sem flat de atributo
```

---

## Rokushiki — Técnicas de AM

Disponível apenas para **Agentes do Governo e Marinheiros**. A cada 2 técnicas de Rokushiki, ganha-se 1 Técnica Rank A vinculada.

| Técnica | Custo | EN | Bônus | Atributo | Efeito Aderido |
|---------|-------|-----|-------|----------|----------------|
| Shigan | 5g | 3 | +2 POD | power | Consecutiva |
| Tekkai | 5g | 3 | +2 CON | constitution | Postura Defensiva |
| Soru | 5g | 3 | +3 PRE | precision | — |
| Kami-e | 5g | 3 | +3 DEF | defense | — |
| Rankyaku | 5g | 3 | +2 PRE | precision | Acerto Múltiplo |
| Geppo | 5g | 3 | +2 DEF | defense | Aérea |

**Técnica Combinada (requer todas as 6):**

| Técnica | Custo | EN | Bônus | Efeito Especial |
|---------|-------|-----|-------|-----------------|
| Rokougan | 10g | 5 | +4 POD | 1 dano direto na CON base (ignora temp) |

---

## Validação

| Regra | ID |
|-------|----|
| Faixas intermediárias (Laranja-Marrom) requerem Grand Line | `am_intermediate_location` |
| Faixas avançadas (Preta-Grão Mestre) requerem New World | `am_advanced_location` |
| Faixa Laranja sem escolha definida | `am_laranja_no_choice` |

---

## Implementação

```ts
// src/shared/types/character.ts → AMFaixaId, ArtesMarciais
// src/features/character/utils/gemBudget.ts → GEM_COSTS.artesMarciais (10g/faixa)
// src/data/techniques.ts → ROKUSHIKI[], ROKOUGAN
// src/features/character/utils/validator.ts → checkArtesMarciais()
// src/features/combat/engine/combatEngine.ts:
//   getFaixaBonuses() → flat attrs (Cinza–Amarela)
//   resolveTechniqueBonus() → +2 Verde (def), +2 Roxa (off)
//   Vermelha e Grão Mestre → mecânicas ativas pendentes de implementação
//   Laranja/Marrom/Rajada → bônus em equipamentos defensivos pendente
```

---

[← Akuma no Mi](./17-akuma.md) | [Técnicas →](./19-tecnicas.md)
