# 15. Raças

## Visão Geral

A raça é escolhida na criação do personagem e **não pode ser alterada depois**. Cada raça concede bônus de atributo e/ou perícia, e algumas têm habilidades especiais.

**Importante:** pontos de atributo e perícia ganhos pela raça **não contam** nos cálculos de aumento de custo (não encarecem upgrades de atributo).

---

## Tabela de Raças

| ID | Nome | Bônus de Atributo | Bônus de Perícia | Habilidade Especial |
|----|------|-------------------|-----------------|---------------------|
| `human` | Humano | +1 em **qualquer atributo** (livre) | +1 em **qualquer perícia** (livre) | Escolha livre — máxima flexibilidade |
| `fishman` | Tritão | +1 POD | +1 Sobrevivência | — |
| `siren` | Sireno | +1 DEF | +1 Atletismo | — |
| `lunar` | Povo Lunar | +1 PRE | +1 Lógica | — |
| `mink` | Mink | — | +1 Percepção | Forma Sulong (ver Técnicas) |
| `dwarf` | Anão | +1 DEF | +1 Furtividade | — |
| `giant` | Gigante | +1 CON | +1 Sobrevivência | — |
| `half_giant` | Meio-gigante | +1 CON | +1 Sobrevivência | — |

---

## Detalhes por Raça

### Humano
A raça mais versátil. O bônus de +1 em atributo e +1 em perícia são completamente livres — o jogador escolhe na criação.

### Tritão (Fishman)
Humanoides anfíbios, agressivos e resistentes. Bônus fixo em Poder reforça personagens ofensivos.

### Sireno
Tritões mais ágeis. Após os 20 anos, a nadadeira se separa em duas pernas. Bônus em Defesa e Atletismo favorece combatentes esquivos.

### Povo Lunar
Inclui Birkans, Shandians e Skypeans — descendentes dos habitantes da Lua, com asas decorativas. Bônus em Precisão e Lógica favorece suportes e estrategistas.

### Mink
Humanoides com semelhança a mamíferos, originários de Zou. Não recebem bônus de atributo — apenas +1 Percepção e a Forma Sulong como habilidade especial (ver Técnicas).

### Anão (Tontatta)
Pessoas pequenas de força surpreendente, especialistas em plantio e furtividade. Bônus em Defesa e Furtividade.

### Gigante / Meio-gigante
Imensos guerreiros de Elbaf. Meio-gigantes variam entre 5–7 metros. Ambos usam a mesma tabela de bônus: +1 CON e +1 Sobrevivência.

---

## Raças Variantes

Além das 7 raças principais, existem "sub-raças" — mestiços ou variações com a mesma essência e apenas um traço diferente. Não há tabelas separadas; a interpretação e estética distinguem cada variante.

| Variante | Regra |
|----------|-------|
| Longleg, Longarm, Snakeneck, Three-Eye | Usam a tabela dos **Humanos**. Aparência é meramente estética. |
| Mestiços (ex.: Wotan = Meio-Tritão + Meio-Gigante) | O jogador **escolhe uma** das tabelas das duas raças parentais. |

---

## Implementação

```ts
// src/data/races.ts → RACES record
// Tipo: RaceId em src/shared/types/character.ts
// Campo no Character: char.race, char.racialBonus
```

A raça é carregada em `createBlankCharacter` e não pode ser alterada após a criação (a ser validado em `validator.ts`).

---

[← Péricias](./14-pericias.md) | [Haki →](./16-haki.md)
