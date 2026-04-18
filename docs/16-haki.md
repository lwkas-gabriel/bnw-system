# 16. Haki

## Estrutura Geral

Cada personagem com Haki tem um **primário** (pago em gemas) e um **secundário** (gratuito — só aventuras). Além disso, pode adquirir o **Haki do Rei** e formas **Avançadas**.

```ts
HakiPath {
  primaryType:    "armament" | "observation"
  primaryStage:   HakiStage   // 0..5 | "advanced_partial" | "advanced_complete"
  secondaryType:  "armament" | "observation"
  secondaryStage: HakiStage   // gratuito
  hasKing:        boolean
  kingStage:      "dormant" | "controlled" | "advanced" | null
  advancedType:   AdvancedHakiVariant | null
}
```

---

## Ativação (Estágio 1)

No Estágio 1, o Haki **não ativa automaticamente**: é necessário um teste de Ambição a cada aventura.

| Situação | DC |
|----------|----|
| Personagem nível 5+ | DC 9 |
| Personagem abaixo do nível 5 | DC 18 |

Uma vez ativado na aventura, pode ser usado livremente até o fim do tópico. Mesmo em caso de falha, o EN é consumido. A partir do Estágio 2 o controle melhora e a ativação é direta.

---

## Haki do Armamento — Estágios

| Estágio | Custo | Bônus (POD + CON temp) | EN/turno | Localização | Aventuras prev. | Notas |
|---------|-------|------------------------|----------|-------------|-----------------|-------|
| 1 | 20g | +1 POD, +1 CON | 1 | Qualquer | 0 | "Sensação de pele mais densa." |
| 2 | 20g | +2 POD, +2 CON | 2 | Qualquer | 1 | "Revestimento de partes do corpo." |
| 3 | 20g | +3 POD, +3 CON | 3 | Grand Line | 1 | "Fica totalmente negro; atinge Logias." + 1 Técnica Rank A grátis |
| 4 | 20g | +4 POD, +4 CON | 4 | Grand Line | 2 | "Revestimento de áreas maiores." |
| 5 | 20g | +5 POD, +5 CON | 5 | Grand Line | 2 | "Domínio pleno. Compatível com Akuma e Ciborgue." |

**Custo total primário (5 estágios):** 100g  
**CON concedida é temporária** — absorvida antes da CON base (ver `tempConStack`).

---

## Haki da Observação — Estágios

| Estágio | Custo | Bônus (PRE + DEF) | EN/turno | Localização | Aventuras prev. | Notas |
|---------|-------|-------------------|----------|-------------|-----------------|-------|
| 1 | **0g** | +1 PRE, +1 DEF | 1 | Qualquer | 0 | "Sente objetos próximos." |
| 2 | **0g** | +2 PRE, +2 DEF | 2 | Qualquer | 1 | "Sente silhuetas ao redor." |
| 3 | **0g** | +3 PRE, +3 DEF, +1 Percepção | 3 | Grand Line | 1 | "Percebe emoções e doriki." |
| 4 | **0g** | +4 PRE, +4 DEF, +2 Percepção | 4 | Grand Line | 2 | "Vê todas as pessoas no raio." |
| 5 | **0g** | +5 PRE, +5 DEF, +3 Percepção | 5 | Grand Line | 2 | "Pressente intenções; alcance de 3 movimentos." |

**Haki secundário é sempre gratuito** — independente de ser Armamento ou Observação.

---

## Haki do Rei

| Nível | Custo | Efeito |
|-------|-------|--------|
| Dormente | 20g | 1× por aventura com teste de Ambição difícil (DC 18). Ativa automaticamente em acerto crítico. |
| Controlado | 0g (incluído nos 20g) | 5 EN/turno. Desmaia alvos com 5 níveis a menos. Resistentes (Obs 3+): sem ação de ataque por 2 turnos. +4 Persuasão. |
| Avançado | 20g (New World) | Adiciona valor de Ambição ao bônus de todas as técnicas enquanto Rei Controlado estiver ativo. |

**Requisitos:**
- Rei Dormente/Controlado: exige estágio 5 no Armamento **ou** Observação
- Rei Avançado: exige Rei Controlado + localização New World + 3 aventuras

---

## Haki Avançado — Variantes

Apenas **um** tipo de Haki Avançado por personagem. Todos requerem New World + 3 aventuras.

### Armamento Avançado

| Variante | Foco | Custo Parcial | Custo Completo | EN/turno | Bônus | Efeito Especial (Completo) |
|----------|------|--------------|----------------|----------|-------|---------------------------|
| `ryuo` | POD | 20g | 20g | 5 | +4 POD | Causa **4 de dano direto na CON base** do alvo (ignora CON temporária) |
| `repulsion` | CON | 20g | 20g | 5 | +4 CON | Aplica Bônus para Aliado, Área Controlado e Postura Defensiva **gratuitamente** em técnicas defensivas |

### Observação Avançada

| Variante | Foco | Custo Parcial | Custo Completo | EN/turno | Bônus | Efeito Especial (Completo) |
|----------|------|--------------|----------------|----------|-------|---------------------------|
| `mantra` | PRE | 20g | 20g | 5 | +4 PRE | Faz **duas rolagens de 3d6 ao atacar** e seleciona o maior |
| `future_vision` | DEF | 20g | 20g | 5 | +4 DEF | Força o oponente a fazer **duas rolagens de 3d6** e selecionar o menor |

### Rei Avançado

| Variante | Custo único | EN/turno extra | Efeito |
|----------|-------------|----------------|--------|
| `king_advanced` | 20g | 0 | Adiciona Ambição ao bônus de **todas** as técnicas com Rei ativo |

O Rei Avançado tem custo único (20g), sem fase parcial/completa separada.

---

## Regras de Validação

| Regra | ID |
|-------|----|
| Secundário não pode superar o primário | `haki_secondary_ahead` |
| Estágio 3+ requer Grand Line | `haki_stage3_location` |
| Rei requer estágio 5 | `haki_king_requires_5` |
| Avançado requer New World | `haki_advanced_location` |
| Rei Avançado requer Controlado | `haki_king_advanced_no_controlled` |
| Só 1 tipo de Haki Avançado | (validado em `checkHaki()`) |

---

## Custo Total por Configuração

| Configuração | Gemas |
|-------------|-------|
| Primário 5 estágios | 100g |
| Secundário (qualquer estágio) | 0g |
| + Rei Controlado | +20g |
| + Rei Avançado | +20g |
| + Armamento/Observação Avançado (parcial+completo) | +40g |
| Máximo possível (primário + rei + 1 avançado) | 160g |

---

## Implementação

```ts
// src/data/haki.ts → HAKI_ARMAMENT_STAGES[], HAKI_OBSERVATION_STAGES[], ADVANCED_HAKI[], KING_HAKI
// src/features/combat/engine/combatEngine.ts → resolveAttributes() aplica bônus de Haki
// src/features/character/utils/gemBudget.ts → custo calculado em computeGemBudget()
// src/features/character/utils/validator.ts → checkHaki()
```

---

[← Raças](./15-racas.md) | [Akuma no Mi →](./17-akuma.md)
