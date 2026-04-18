# 19. Técnicas

## Sistema de Ranks

Cada técnica tem um **Rank** (E a A) que define custo em gemas, custo de energia, bônus base e capacidade de efeitos aderidos.

| Rank | Custo (g) | Bônus Base | EN/uso | Efeitos Aderidos | Efeitos Rank A |
|------|-----------|------------|--------|------------------|----------------|
| E | 6g | +1 | 1 | ✗ | ✗ |
| D | 7g | +2 | 2 | ✓ | ✗ |
| C | 8g | +3 | 3 | ✓ | ✗ |
| B | 9g | +4 | 4 | ✓ | ✗ |
| A | 10g | +5 | 5 | ✓ | ✓ |

**Upgrade de rank:** custo = `GEM_COSTS.technique[novoRank] - GEM_COSTS.technique[rankAtual]`
- E→D = +1g · D→C = +1g · C→B = +1g · B→A = +1g · E→A direto = +4g

---

## Tipos de Técnica

| Tipo | Atributo alvo | Efeito no combate |
|------|--------------|-------------------|
| `offensive` | POD ou PRE | Aumenta roll de ataque |
| `defensive` | DEF ou CON | Aumenta threshold de defesa ou CON temporária |

---

## Técnicas Gratuitas (por caminho)

| Caminho | Condição | Técnica |
|---------|----------|---------|
| Haki Armamento Estágio 3 | — | 1 Técnica Rank A (`source: "haki"`) |
| AM Faixa Laranja (choice=techniques) | — | 2 Técnicas Rank A (`source: "artes_marciais"`) |
| Ciborgue Shift 3 (choice=techniques) | `shift3Bonus === "techniques"` | Técnicas extras (`source: "ciborgue"`) |
| Akuma no Mi | — | Habilidades específicas (`source: "akuma"`) |

---

## Efeitos Aderidos Gerais (Rank D+)

### Ataque

| Efeito | ID | Descrição |
|--------|----|-----------| 
| Acerto Múltiplo | `multiple_hit` | Atinge +1 alvo por aplicação |
| Anti Aéreo | `anti_air` | +2 bônus contra alvos voando (por aplicação) |
| Anti Aquático | `anti_aquatic` | +2 bônus contra alvos na água (por aplicação) |
| Bônus para Aliado | `ally_bonus_atk` | Transfere bônus para 1 aliado (por aplicação) |
| Confusão | `confusion` | -1 PRE do alvo por 2 turnos (por aplicação) |
| Dois Gumes | `double_edge` | +2 bônus, mas 1 dano direto na CON base do usuário |
| Fragilidade | `fragility` | -1 CON temporária do alvo por 2 turnos (por aplicação) |
| Fraqueza | `weakness` | -1 POD do alvo por 2 turnos (por aplicação) |
| Segurança | `safety` | Nega falha crítica; dados 3 garantem acerto |
| Vulnerabilidade | `vulnerability` | -1 DEF do alvo por 2 turnos (por aplicação) |

### Defesa

| Efeito | ID | Descrição |
|--------|----|-----------| 
| Aérea | `aerial` | +1 DEF no ar por 2 turnos (+1 turno por aplicação extra) |
| Bônus para Aliado | `ally_bonus_def` | Transfere bônus para 1 aliado (por aplicação) |

---

## Efeitos Aderidos Rank A (exclusivos)

### Ataque

| Efeito | ID | Descrição |
|--------|----|-----------| 
| Ataque em Área Controlado | `area_controlled` | Atinge todos os inimigos a 1 ação de movimento |
| Consecutiva | `consecutive_atk` | +1 bônus a cada turno consecutivo de uso |
| Exaustão | `exhaustion` | +1 EN em técnicas do oponente por 2 turnos |
| Ferimento | `wound` | 1 dano direto na CON base por 2 turnos (por aplicação) |

### Defesa

| Efeito | ID | Descrição |
|--------|----|-----------| 
| Consecutiva | `consecutive_def` | +1 bônus a cada turno consecutivo de uso |
| Postura Defensiva | `defensive_posture` | +2 bônus defensivo, -1 POD e -1 PRE (por aplicação) |

---

## Regras de Uso em Combate

- Técnicas **ofensivas**: só podem ter efeitos de ataque
- Técnicas **defensivas**: só podem ter efeitos de defesa
- Técnicas defensivas de CON: bônus vai para `tempConStack` (absorvido antes da CON base)
- **Ataque em Área Controlado**: Logias têm isso grátis em técnicas ofensivas; outras classes precisam do slot Rank A

---

## Kitetsu — Dobra Base, Não Bônus de Caminho

```
Bônus final = (baseBonus × 2) + AM_verde + AM_roxa + rei_avancado + ...
```

Apenas `baseBonus` é dobrado. Bônus de caminhos (AM, Rei Avançado) são somados depois.

---

## Validação

| Regra | ID |
|-------|----|
| Efeito Rank A em técnica de rank inferior | `tech_rank_a_adherence_{id}` |
| Efeito defensivo em técnica ofensiva | `tech_wrong_adherence_def_{id}` |
| Efeito ofensivo em técnica defensiva | `tech_wrong_adherence_atk_{id}` |
| Técnicas com nomes duplicados | `tech_duplicates` |

---

## Forma Sulong (Mink)

Técnica passiva exclusiva dos Minks. **Gratuita** — deve constar na lista de técnicas.

```
Nome: Forma Sulong
Requisitos: Raça Mink Pura; contato visual direto com a lua cheia.
Efeito: +1 de bônus em TODAS as técnicas.
Custo: +1 EN em TODAS as técnicas (enquanto transformado).
Nível mínimo para controlar: 10 (abaixo → modo berserker).
```

| Nível mínimo | Turnos controlados | Turnos berserker | Desmaio |
|-------------|---------------------|-----------------|---------|
| 1 | — | 2 turnos | após o 2º |
| 10 | 3 turnos | 2 turnos | após o 5º |
| 25 | 5 turnos | — | após o 5º |

Máximo de **5 turnos** transformado. Lua cheia determinada por mecânica de dado no início de cada aventura (1d4 → 1 = lua cheia; probabilidade aumenta a cada aventura sem lua cheia).

---

## Implementação

```ts
// src/shared/types/character.ts → Technique, TechniqueAdherence, AdherenceEffect
// src/data/techniques.ts → TECHNIQUE_RANKS, ADHERENCES, ROKUSHIKI, ROKOUGAN
// src/features/combat/engine/combatEngine.ts → resolveTechniqueBonus()
// src/features/character/utils/gemBudget.ts → custo por rank (6-10g)
// src/features/character/utils/validator.ts → checkTechniques()
// Forma Sulong: pendente de implementação no engine (buffs.sulongActive)
```

---

[← Artes Marciais](./18-artes-marciais.md) | [Armas Únicas →](./20-armas-unicas.md)
