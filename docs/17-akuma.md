# 17. Akuma no Mi

## Maldição

Usuários de Akuma no Mi perdem todos os poderes e ficam fracos ao entrarem em mares e lagos — qualquer quantidade de água que cubra ao menos até os joelhos. As propriedades físicas do corpo modificado permanecem (ex.: esticar o pescoço da Gomu Gomu funciona, mas a pessoa não consegue se mover enquanto submersa).

- **Afogamento:** ao cair em água onde possa se afogar, não há como se salvar sozinho.
- **Tritão com AM:** não se afoga, mas fica incapacitado (só pode se comunicar com animais marinhos). Sobrevive submerso por 1 aventura inteira (≈20 turnos); não sendo resgatado, morre.
- **Jogar água não remove poderes.** Logia perde invulnerabilidade ao ter contato com seu elemento fraco (ex.: areia vs. água), mas não os poderes em si.
- **Kairoseki:** enfraquece usuários por contato direto e contínuo. No sistema há apenas duas formas: Arma Única Nanashaku e Algemas de Kairoseki (aplicáveis só após derrota em combate).

---

## Aquisição

1. Solicitar reserva da AM no tópico oficial — apenas frutas não possuídas por outros jogadores podem ser compradas.
2. Pagar o custo em gemas com o valor integral disponível na ficha.
3. Comunicar o narrador; o fruto é entregue à personagem durante a próxima aventura (narrador decide a forma).
4. A compra é **intransferível** — não pode ser entregue a outra personagem.
5. É possível desistir ou trocar o fruto **antes de comer** em jogo; após comer, a única forma de perder os poderes é morte ou reset.
6. **3 meses sem postar:** AM liberada para outros jogadores. Se outro jogador comprar, a personagem original morre. Se o jogador voltar antes da compra, retoma normalmente.

Após a compra, o jogador elabora a tabela de poderes (modelos nos tópicos do fórum) e a posta no mesmo tópico da ficha.

---

## Smiles

Akumas no Mi artificiais usadas exclusivamente por **NPCs importantes** (não por personagens de jogadores):

- Um NPC pode ter o poder de uma AM existente como "Smile" — versão artificial com as mesmas características.
- Narradores têm liberdade de criar fichas próprias para Smiles, com poderes e efeitos diferentes da AM original.
- Smiles de AM compradas por jogadores **não podem** ser usadas em NPCs particulares de narradores.

---

## Tipos e Custos

| Tipo | Rank C | Rank B | Rank A | Rank S (Despertar) |
|------|--------|--------|--------|--------------------|
| Zoan | 30g | 60g | 90g | +50g (total 140g) |
| Logia | 30g | 60g | 90g | +50g (total 140g) |
| Paramecia | 30g | 60g | 90g | +50g (total 140g) |

- **Rank S (Despertar)** requer New World + 5 aventuras.
- Evolução: C→B = +30g (2 aventuras); B→A = +30g (3 aventuras); A→S = +50g (5 aventuras, New World).
- Técnicas gratuitas por rank: **Rank C** = +1 Rank A; **Rank B** = +1 Rank A (Rank B+ já começa com 2).

---

## Zoan

### Classes e Bônus de Perícia

| Classe | ID | Bônus |
|--------|----|-------|
| Alados | `flying` | +1 Atletismo |
| Herbívoros | `herbivore` | +1 Sobrevivência |
| Carnívoros | `carnivore` | +1 Furtividade |
| Racionais | `rational` | +1 Lógica |

### Points por Rank

Cada Zoan tem **Point Híbrido** e **Point Animal**, com atributo principal e complementar definidos pelo jogador. Bônus por rank:

| Rank | Bônus por atributo (cada point) |
|------|--------------------------------|
| C | +1 |
| B | +3 |
| A | +4 |

Para trocar de point em combate: 1 vez por turno, sem custo de energia.

**Point Desperto (Rank S):** +8 atributo principal, +8 atributo complementar. Exige 5 EN/turno.

### Vigor Animal

Bônus fixo de CON em **todas** as formas (inclusive humana):

| Rank | Bônus de CON |
|------|-------------|
| C | +2 |
| B | +4 |
| A | +6 |

### Efeito Aderido Especial — Bestialidade

Efeito aderido exclusivo de Zoan, adicionável a qualquer técnica sem custo extra:

```
Bestialidade: melhora o bônus da técnica em +1 para o atributo primário.
Funciona em técnicas OFENSIVAS e DEFENSIVAS.
Se usado em ambas no mesmo turno → +2 total.
```

### Habilidades (Rank A)

2 habilidades com 1 módulo cada. Custo: 1 EN. Pode ter condição (dobra o bônus numérico).

Zoans Mitológicas têm acesso a **módulos exclusivos**:

| Módulo exclusivo | Efeito |
|-----------------|--------|
| Restaura 1 CON perdido | — |
| **Retém 1 CON** na primeira vez que for nocauteado | `retemUsed` flag |
| Resistência a Status específico (turnos/2) | — |
| Altera ambiente ao redor por 2 turnos | — |

### Rank S (Despertar)

Point 03 Desperto com 5 EN/turno + 1 Habilidade Desperta com 2 módulos (condição: forma desperta ativa).

### Módulos de Zoan

| Módulo Geral | Bônus |
|-------------|-------|
| +1 POD | — |
| +1 PRE | — |
| +1 DEF | — |
| +1 CON | — |
| Efeito Aderido extra | especificar |
| +2 em Perícia específica | — |

---

## Logia

### Passivos — Sempre Ativos (sem EN)

| Passivo | Efeito |
|---------|--------|
| Natureza Elemental | +5 no atributo elemental escolhido |
| Intangibilidade | +4 DEF, +4 CON |
| Área Controlado | Grátis em todas as técnicas ofensivas |

### Elementalista (Ativo)

- Custo: 1 EN
- Aplica o **Status Aprimorado** em qualquer ataque corpo a corpo

### Status Aprimorado

Combinação ou duplicação de efeitos aderidos de status existentes:

| Criação | Efeito |
|---------|--------|
| **Combinar 2 status** | Afeta os 2 atributos; duração é somada |
| **Dobrar 1 status geral** (Vulnerabilidade, Confusão, Fraqueza, Fragilidade) | Dobra penalidade e duração |
| **Dobrar 1 status Rank A** (Exaustão, Ferimento) | Mantém valores mas permite acumular penalidade |

Exemplos: Cegueira (dobrou Confusão) = -2 PRE por 4 golpes. Queimadura (dobrou Ferimento) = 1 dano direto/turno por 2 turnos, acumulável.

### Rank S (Despertar)

**Domínio Elemental:** +5 POD e +5 PRE por 5 EN/turno em área de 3 turnos de movimento.

---

## Paramecia

### Classes

| Classe | ID | Descrição |
|--------|----|-----------|
| Corpórea | `corporeal` | Altera o próprio corpo |
| Substancial | `substantial` | Gera/manipula substância |
| Surreal | `surreal` | Efeitos de distorção da realidade |

### Efeito Aderido Especial

Cada Paramecia tem 1 efeito aderido exclusivo. Técnicas que **têm** esse efeito aderido recebem **+1 ao bônus básico** (POD, PRE, DEF ou CON).

### Habilidades Passivas e Ativas

Ganha 1 passiva + 1 ativa por rank:

| Rank | Passiva (slots) | Ativa (slots / EN) | Condição |
|------|----------------|-------------------|----------|
| C | 2 slots | 2 slots / 2 EN | — |
| B | 3 slots | 3 slots / 3 EN | — |
| A | 3 slots | 3 slots / 3 EN | Opcional (+1 slot) |

### Módulos de Paramecia

| Módulo | Slots |
|--------|-------|
| +1 POD / PRE / DEF / CON | 1 |
| -1 POD / PRE / DEF / CON temp do oponente (ativo) | 1 |
| Ataque à distância | 1 |
| Efeito Aderido extra* | 2 |
| Resistência específica* | 2 |
| Restaura 1 CON (ativo) | 2 |
| Restaura 3 EN (sem custo, ativo) | 3 |
| **Retém 1 CON** na primeira vez que for nocauteado | 3 |
| +4 em Perícia específica | 3 |

| Módulo de Despertar | Slots |
|--------------------|-------|
| Intangibilidade | 3 |
| +1 em técnicas | 2 |

### Rank S (Despertar)

**Modo Desperto:** +5 PRE **OU** +5 DEF (escolha por turno) por 5 EN. Não tem habilidade ativa extra com custo adicional (5 slots, condição: Modo Desperto ativo).

---

## Regras de Localização

| Rank | Localização mínima |
|------|-------------------|
| C, B, A | Qualquer |
| S (Despertar) | New World (aventuras podem ser em qualquer lugar) |

---

## Validação

| Regra | ID |
|-------|----|
| Rank S requer New World | `akuma_s_location` |
| Zoan Mitológica Rank A: configurar 2 habilidades | `zoan_mythical_abilities` |
| Zoan Rank S: configurar Habilidade Desperta | `zoan_awakened_no_ability` |
| Logia: definir Status Aprimorado | `logia_no_status` |

---

## Implementação

```ts
// src/shared/types/character.ts → ZoanAkuma, LogiaAkuma, ParameciaAkuma, AkumaNoMi
// src/features/combat/engine/combatEngine.ts → resolveAttributes() aplica passivos de Logia e vigorAnimal
// src/features/character/utils/gemBudget.ts → costs = { C:30, B:60, A:90, S:140 }
// src/features/character/utils/validator.ts → checkAkuma()

// Bônus de Point por rank → ZoanPoint.bonus precisa refletir: C=1, B=3, A=4
// Vigor Animal por rank → ZoanAkuma.vigorAnimalBonus precisa refletir: C=2, B=4, A=6
```

---

[← Haki](./16-haki.md) | [Artes Marciais →](./18-artes-marciais.md)
