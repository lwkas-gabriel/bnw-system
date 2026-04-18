# 13. Progressão de Nível e Sistema de Gemas

## Pontos de Atributo por Nível

Ao criar o personagem (nível 1), a ficha já vem com os 6 pontos-base distribuídos fixos:
- **POD: 1 · PRE: 1 · DEF: 1 · CON: 3** — imutáveis, não investíveis

A cada nível (incluindo o 1), o personagem recebe **+1 ponto investível** (+bônus raciais apenas no nível 1).

```
Total de pontos investíveis = nível + bônus raciais
```

Esses pontos podem ser distribuídos livremente entre POD, PRE, DEF e CON.

---

## Tabela de XP por Nível

| Nível | XP para este nível | XP Acumulado |
|-------|--------------------|--------------|
| 1     | —                  | 0            |
| 2     | 90                 | 90           |
| 3     | 105                | 195          |
| 4     | 120                | 315          |
| 5     | 135                | 450          |
| 6     | 150                | 600          |
| 7     | 165                | 765          |
| 8     | 180                | 945          |
| 9     | 195                | 1 140        |
| 10    | 210                | 1 350        |
| 11    | 225                | 1 575        |
| 12    | 240                | 1 815        |
| 13    | 255                | 2 070        |
| 14    | 270                | 2 340        |
| 15    | 285                | 2 625        |
| 16    | 300                | 2 925        |
| 17    | 315                | 3 240        |
| 18    | 330                | 3 570        |
| 19    | 345                | 3 915        |
| 20    | 360                | 4 275        |
| 21    | 375                | 4 650        |
| 22    | 390                | 5 040        |
| 23    | 405                | 5 445        |
| 24    | 420                | 5 865        |
| 25    | 435                | 6 300        |
| 26    | 450                | 6 750        |
| 27    | 465                | 7 215        |
| 28    | 480                | 7 695        |
| 29    | 495                | 8 190        |
| 30    | 510                | 8 700        |
| 31    | 525                | 9 225        |
| 32    | 540                | 9 765        |
| 33    | 555                | 10 320       |
| 34    | 570                | 10 890       |
| 35    | 585                | 11 475       |
| 36    | 600                | 12 075       |
| 37    | 615                | 12 690       |
| 38    | 630                | 13 320       |
| 39    | 645                | 13 965       |
| 40    | 660                | 14 625       |

**Fórmula:** XP para o nível N (N ≥ 2) = `75 + 15 × N`

---

## BPN — Bônus por Nível

Fórmula: `floor(nível × 3/4)`. O BPN é somado à PRE nos rolls de ataque e à DEF no threshold de defesa.

| Nível | BPN | Nível | BPN | Nível | BPN |
|-------|-----|-------|-----|-------|-----|
| 1 | 0 | 15 | 11 | 29 | 21 |
| 2 | 1 | 16 | 12 | 30 | 22 |
| 3 | 2 | 17 | 12 | 31 | 23 |
| 4–5 | 3 | 18 | 13 | 32–33 | 24 |
| 6 | 4 | 19 | 14 | 34 | 25 |
| 7 | 5 | 20–21 | 15 | 35 | 26 |
| 8–9 | 6 | 22 | 16 | 36–37 | 27 |
| 10 | 7 | 23 | 17 | 38 | 28 |
| 11 | 8 | 24–25 | 18 | 39 | 29 |
| 12–13 | 9 | 26 | 19 | 40 | 30 |
| 14 | 10 | 27 | 20 | | |

---

## End Game — Nível 40

O nível máximo jogável é **40**. Ao atingi-lo:
- O personagem acumula **14 625 XP** no total.
- Aventuras **não concedem mais XP**.
- O ganho de **gemas cai para 1/3** do valor normal.
- O foco passa de progressão para conquistas: domínio de territórios, desafios maiores, enfrentamento de líderes de facção.

### Jubilamento (opção para personagens nível 40)

O jogador pode "jubilar" o personagem, entregando-o ao cenário como NPC permanente:

1. O personagem se torna NPC e ocupa um dos cargos mais altos de sua facção (Yonkou, Almirante, Comandante de CP, Líder Revolucionário ou Imperador do Submundo).
2. Se não há vaga disponível, um evento global é gerado para acomodar a mudança.
3. A ficha do NPC é idêntica à última ficha jogável usada.
4. O jogador recebe um **reset especial**: nova personagem começa no **nível 10**, em qualquer ilha do **Paradise**, com **100 gemas** disponíveis e **50% de desconto** na aquisição e evolução de **um caminho** à escolha (Akuma no Mi, Haki, Ciborgue ou Artes Marciais).

---

## Sistema de Gemas

### Orçamento Inicial e Máximo

| Parâmetro | Valor |
|-----------|-------|
| Gemas iniciais (nível 1) | **20g** |
| Máximo investível | **400g** |

### Ganho de Gemas

Gemas são concedidas durante aventuras e pelo narrador como recompensa. Não há fórmula automática de ganho por nível — são distribuídas narrativamente.

### Excesso de Gemas → XP

Quando o personagem já tem 400g investidas e recebe novas gemas, cada gema excedente converte-se em **4 XP**. A conversão só ocorre quando o limite de 400g é atingido — não é possível converter antes.

```
Excesso = gemas recebidas quando totalInvestido ≥ 400
1 gema excedente = 4 XP
```

### Custos de Gemas (referência rápida)

Consulte `src/features/character/utils/gemBudget.ts → GEM_COSTS` para a fonte de verdade. Resumo:

| Item | Custo |
|------|-------|
| Akuma no Mi C | 30g |
| Akuma no Mi B | 60g |
| Akuma no Mi A | 90g |
| Despertar (sobre A) | +50g |
| Haki Primário (por estágio) | 20g |
| Haki Secundário | **Gratuito** |
| Haki do Rei | 20g |
| Haki Avançado Parcial | 20g |
| Haki Avançado Completo | 20g |
| Artes Marciais (por faixa) | 10g |
| Cyborg (por shift) | 20g |
| Arma Única | 20g |
| Técnica Rank E | 6g |
| Técnica Rank D | 7g |
| Técnica Rank C | 8g |
| Técnica Rank B | 9g |
| Técnica Rank A | 10g |
| Energia (+1 por gema) | 1g/EN |

**Nota sobre Arma Única:** não é cobrada se o personagem escolheu a Faixa Laranja de Artes Marciais com `laranjaChoice === 'unique_weapon'`.

---

## Bug Conhecido — `gemBudget: 420`

O `createBlankCharacter` em `src/features/character/store/characterStore.ts` atualmente inicializa `gemBudget: 420`. O valor correto é **`20`** (gemas iniciais). Corrigir antes de lançar qualquer funcionalidade de gerenciamento de gemas.

---

[← Glossário](./12-glossario.md) | [Perícias →](./14-pericias.md)
