# Gemas

## O que são

Moeda especial do fórum. Não são itens físicos — não podem ser perdidas, roubadas ou transferidas. Representam tempo de jogo e contribuição ao fórum.

- Todos os personagens começam com **20 gemas**.
- Limite máximo investível: **400 gemas**.
- Gemas excedentes (acima de 400): convertem em **4 XP cada**.

---

## Como ganhar

| Fonte | Quantidade |
|-------|-----------|
| Aventura completa (jogador) | Variável por mar e nº de jogadores |
| Aventura completa (narrador) | Variável |
| Moderador/Administrador | 3g/mês |
| Administrador (atualização de sistema) | +3g extras |
| Central de Projetos (tarefa aprovada) | 3g/tarefa |
| Cenário (alteração narrativa — narradores) | 3g/aventura narrada |
| Manchete publicada | 1g |
| Mini-evento (participação/vitória) | 1g / 3g |
| Evento médio (participação) | 5g |
| Evento global (participação) | 10g |
| Diário de Bordo (600–6000 chars, aventura completa) | 1g |

---

## Como gastar

### Caminhos (140g cada para completar)

| Caminho | Detalhes |
|---------|---------|
| Akuma no Mi | C:30g · B:60g · A:90g · Despertar:50g |
| Haki | 20g/estágio (5 estágios = 100g); secundário grátis; Rei:20g; Avançado:20g+20g |
| Ciborgue | 20g/shift (6 shifts = 120g); Gear:20g cada |
| Artes Marciais | 10g/faixa (14 faixas = 140g total) |

Média de equilíbrio: **+1 bônus de combate a cada 5 gemas investidas**.

### Outros benefícios (gastos únicos)

| Item | Custo |
|------|-------|
| Arma Única | 20g |
| Profissão | 10g cada |
| Aumento de Energia | 1g = +1 EN |
| Técnica Rank E | 6g |
| Técnica Rank D | 7g |
| Técnica Rank C | 8g |
| Técnica Rank B | 9g |
| Técnica Rank A | 10g |
| Companheiro Rank C | 10g |
| Companheiro Rank B | 20g |
| Companheiro Rank A | 30g |

### Desconto de Facção

20g de desconto ao atingir o cargo de facção correspondente ao Nível 12 + Prestígio 20. **Único por personagem, não entra no limite de 400g.**

---

## Conversão de Excedente

Só gemas que ultrapassem 400 podem ser convertidas. Registrar na ficha como entrada única:

```
Conversão de Gemas Excedentes (50 gemas em 200 XP)
```

Novas conversões alteram os valores da entrada existente em vez de criar nova.

---

## Notas de Implementação

```ts
// src/features/character/utils/gemBudget.ts
GEM_COSTS (fonte única — nunca hardcode em JSX)
gemBudget inicial  = 20g
máximo investível  = 400g
excedente → 4 XP por gema
energia            = nível × 3 + gemasInvestidasEmEnergia
```
