# 21. Ciborgue

## Visão Geral

O caminho Ciborgue consiste em **6 shifts** (modificações corporais) + 1 **Gear** opcional. Cada shift custa **20g**.

```
Total máximo: 6 shifts × 20g + 1 gear × 20g = 140g
```

Não há restrições de localidade para os shifts — podem ser adquiridos de qualquer lugar.

---

## Shifts — Partes do Corpo e Bônus

| Parte | ID | Bônus |
|-------|----|-------|
| Cabeça | `head` | +4 PRE |
| Braço Direito | `right_arm` | +4 POD |
| Braço Esquerdo | `left_arm` | +4 POD |
| Perna Direita | `right_leg` | +4 DEF |
| Perna Esquerda | `left_leg` | +4 DEF |
| Tronco | `torso` | +4 CON |

Cada parte do corpo só pode ter **um shift**. Shifts duplicados no mesmo local são inválidos.

**Exemplo — Ciborgue Completo (6 shifts):**
- +4 PRE (cabeça) + +8 POD (2 braços) + +8 DEF (2 pernas) + +4 CON (tronco) = +24 de atributos totais

> **Bug corrigido:** `resolveAttributes()` no `combatEngine.ts` agora aplica os bônus de shift na CON inicial de combate.

---

## Shift 3 — Combustível e Bônus de Progressão

A partir do **3º shift**, o corpo passa a operar por **combustível** (não mais energia orgânica):
- Consumíveis: frascos de combustível (reposição maior que lanches comuns)
- Limite: 3 consumíveis por combate

Ao aplicar o 3º shift, o personagem escolhe **uma** opção permanente:

| Opção | ID | Benefício |
|-------|----|-----------|
| 2 Técnicas Rank A | `techniques` | Técnicas gratuitas (`source: "ciborgue"`) |
| +20 de Energia | `energy` | Bônus fixo de +20 EN |

---

## Bugigangas

Cada shift inclui 1 **bugiganga** instalável à escolha do jogador. Bugigangas não podem ser removidas ou substituídas. Regras completas em Itens, Equipamentos e Mercado.

---

## Gears (Ciborgue Completo)

Disponível **apenas** ao completar os **6 shifts** e estar no **New World**. Custo: **20g**. Apenas 1 Gear por ciborgue.

### 3.1 Overclock
Aumenta a rotação de funcionamento dos shifts, gastando mais combustível por maior potência.
```
Dobra o custo de combustível de 1 técnica por turno.
Bônus: + metade do efeito da técnica sobrecarregada (arredonda para cima).
Exemplo: técnica +5 POD → gasta 10 EN mas recebe +3 POD extra.
```

### 3.2 Laser
Domínio sobre tecnologia laser — penetra qualquer defesa, incluindo Intangibilidade de Logias.
```
+2 de Dano + 2 de Dano Direto na CON do oponente (ignora CON temporária).
Custo: 5 EN/turno de uso.
Requer acerto do golpe (com ou sem técnica).
```

### 3.3 Drone
Unidades externas (drones ou formas mecânicas) que rastreiam oponentes e melhoram precisão.
```
+2 PRE + +2 nas rolagens de ataque.
Impede falha crítica; facilita acerto crítico.
Custo: 5 EN/turno.
```

### 3.4 Mecha
Conexão com mecanismos externos formando um "tanque ambulante".
```
+4 CON por 5 EN/turno.
Este bônus é consumido primeiro por ataques (funciona como CON temp).
Mantém-se enquanto houver investimento de combustível.
```

### 3.5 Stealth
Camuflagem perfeita no ambiente — praticamente invisível.
```
Força o oponente a rolar 2 dados de ataque e escolher o menor resultado.
1× por turno. Custo: 5 EN/turno.
```

---

## Raid Suit — Interação com Arma Única

A arma **Raid Suit** tem efeito especial para Ciborgues:
- Dobra o bônus de 1 shift escolhido
- **Ciborgue Completo:** concede 1 Gear extra gratuito

---

## Compatibilidade

- **Ciborgue + Haki Armamento Estágio 5:** compatíveis
- **Ciborgue + Akuma no Mi:** possível narrativamente
- **Ciborgue + Artes Marciais:** compatíveis sem restrição

---

## Validação

| Regra | ID |
|-------|----|
| Gear requer 6 shifts | `cyborg_gear_needs_6` |
| Gear requer New World | `cyborg_gear_location` |
| Shifts em mesma parte do corpo | `cyborg_duplicate_locations` |

---

## Implementação

```ts
// src/shared/types/character.ts → CyborgPath, CyborgShiftData, CyborgGear
// src/features/character/utils/gemBudget.ts → GEM_COSTS.cyborg = { perShift:20, gear:20 }
// src/features/character/utils/validator.ts → checkCyborg()
// src/features/combat/engine/combatEngine.ts → resolveAttributes() aplica bônus de shift
//
// Bônus de shift por localização (a criar em src/data/cyborg.ts):
//   head:       { precision: 4 }
//   right_arm:  { power: 4 }
//   left_arm:   { power: 4 }
//   right_leg:  { defense: 4 }
//   left_leg:   { defense: 4 }
//   torso:      { constitution: 4 }
```

---

[← Armas Únicas](./20-armas-unicas.md) | [Técnicas →](./19-tecnicas.md)
