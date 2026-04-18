# 20. Armas Únicas

## Visão Geral

Armas Únicas são equipamentos especiais com mecânicas exclusivas. Cada uma custa **20g** (a não ser que obtida pela Faixa Laranja de AM, caso em que é gratuita).

Um personagem pode equipar **1 arma** (ofensiva) e **2 equipamentos defensivos** por cena/combate.

---

## Aquisição

1. Adquirir a arma base (seguindo custos de fabricação/compra em Itens, Equipamentos e Mercado).
2. Pagar **20g** e passar a arma pelas mãos de um **Ferreiro** (NPC ou PJ). Ferreiros NPC podem ser contratados via Submundo.
3. Se criar a arma do zero, ainda é necessário o teste de profissão do Ferreiro. Se apenas aprimorar uma arma existente, não há teste.

---

## Funcionamento — Troca de Armas

- Só é possível se beneficiar dos efeitos de **1 arma única por vez**.
- É possível alternar entre armas únicas em combate **sem gastar ação**, mas apenas **1 vez por rodada** (inclui turno de ataque e turno de defesa).
- Ao ter mais de uma arma única, é necessário declarar ao narrador qual está equipada e ativa.
- **Faixa Preta de AM** permite equipar **2 armas** ao mesmo tempo. Ainda assim, os efeitos de apenas 1 arma única são válidos por rodada.

---

## Lista de Armas Únicas (26 armas)

### Espadas e Armas Brancas — Mecânicas de Combate

| Arma | Origem | Efeito | Mecânica |
|------|--------|--------|----------|
| **Kitetsu** | Espadas amaldiçoadas de Kitetsu | Dobra o bônus BASE das técnicas. 1 dano direto na CON base por técnica usada. | `doublesTechniqueBase: true`, `directConCostPerTech: 1` |
| **Enma** | Espada de Oden (herdada por Zoro) | Dobra o bônus em Poder do Haki do Armamento. | `doublesHakiArmamentPow: true` |
| **Yoru** | Grande espada de Mihawk | Reduz pela metade EN de técnicas (mín. 1). Permite alternar bônus ofensivos (POD/PRE) ou defensivos (DEF/CON). | `halvesEnergyCost: true` |
| **Ame no Habakiri** | Espada de Oden (herdada por Momonosuke) | Dobra o bônus das armas equipadas. | `doublesWeaponBonus: true` |
| **Eisen** | Espada de Ohm | Aplica o bônus da arma em 2 outros atributos adicionais. | `applyBonusToExtraAttrs: 2` |
| **Shusui** | Espada do lendário samurai Ryuma | Adiciona Ambição ao BPN. Consome 2 EN/turno. | `addAmbitionToBPN: true`, `ambitionBPNCostPerTurn: 2` |
| **Murakumogiri** | Naginata de Barba Branca | Triplica a CON inicial. Retém 1 CON na primeira vez que for nocauteado. | `triplesBaseConAndRetains: true` |
| **Mogura** | Tridente de Katakuri | Reduz pela metade o bônus base das técnicas do oponente. +1 EN no custo das técnicas do oponente. | `reducesOpponentTechBonus: true` |
| **Daisenso** | Lança de Don Krieg | Converte bônus de equipamentos defensivos em atributo oposto no turno de ataque (DEF↔PRE; CON↔POD). | `convertDefItemsToAttack: true` |
| **Gryphon** | Sabre de Shanks | Aumenta a Presença do Rei para alvos 3 níveis abaixo (era 5). Reduz PRE dos resistentes pelo valor de Ambição. | `enhancesKingHaki: true` |
| **Yakuza Kasen** | Bengala do Almirante Fujitora | Dobra o bônus em Defesa do Haki da Observação. | `doublesHakiObsDefense: true` |
| **Ace** | Espada de Gol D. Roger | Garante +3 níveis efetivos (pode ultrapassar o nível 40). | `grantsThreeLevels: true` |
| **Wado Ichimonji** | Espada herdada de Kuina (Zoro) | Ao fim de aventura, recebe premiação como se houvesse 1 jogador a mais no grupo. | `adventureExtraPlayerBonus: true` |
| **Warabide** | Espada de palha de Basil Hawkins | Dobra bônus das Habilidades Ativas de Paramecia sem gasto extra de EN. | `doublesParameciaActives: true` |

### Armas Especiais / Situacionais

| Arma | Origem | Efeito | Mecânica |
|------|--------|--------|----------|
| **Haissaikai** | Porrete de Kaido | Espelha os bônus do Point Zoan ativo na arma. Point Desperto: metade dos bônus. | `mirrorsZoanPoints: true` |
| **Kabuto** | Estilingue de Sogeking | +1 ação de movimento de alcance. Bônus da arma em PRE. | `increasesRange: true`, `addWeaponBonusToPRE: true` |
| **Kirisama** | Lâmina de Hody Jones | Adiciona Atletismo ao BPN em ambientes aquáticos. | `atletismoBPNAquatic: true` |
| **Oto Kogarashi** | Par de espadas de Shiki | Adiciona Atletismo ao BPN enquanto voando em combate. | `atletismoBPNWhenFlying: true` |
| **Nanashaku** | Jitte de Smoker (com kairoseki) | Anula Invulnerabilidade de Logias, Passivas de Paramecia e Points de Zoan (Desperto: bônus reduzidos pela metade). | (sem flag no motor — lógica narrativa) |
| **Napoleon** | Chapéu-espada de Big Mom | Triplica o bônus da arma em Libertação, Domínio ou Proteção de Territórios. | `triplesForTerritory: true` |
| **Nonosama** | Bastão de Enel | Dobra o bônus da Intangibilidade de Logia (de +4 para +8 em DEF e CON). | `doublesLogiaIntangibility: true` |
| **Lassoo** | Pistola de Mr. 4 | Funciona como Mascote Rank A, mesmo sem a profissão Adestrador. | `mascoteRankA: true` |
| **Raid Suit** | Trajes da Germa 66 | Dobra o bônus de um shift de Ciborgue. Ciborgue Completo ganha 1 Gear extra gratuito. | `doublesShiftAndFreeGear: true` |
| **Tsuji Shibai** | Espada-pincel de Kanjuro | Aplica bônus da arma ao teste de profissão. Aplica perícia da profissão à PRE. | (sem flag — integração com módulo Profissões) |
| **Durandal** | Rapieira de Cavendish | Dobra Prestígio e salário. Piratas: dobra pilhagem. Caçadores: +1/3 na recompensa. | `doublesPrestige: true` |
| **Pretzel** | Espada de Cracker | Concede 20g extras (além do limite de Rank) aos Companheiros de tripulação. | (sem flag — impacta sistema de tripulação) |

---

## Mecânicas Especiais com Impacto no Engine

As 4 armas com mecânicas codificadas no `combatEngine.ts`:

| Arma | Onde atua | Efeito no engine |
|------|-----------|-----------------|
| **Kitetsu** | `resolveTechniqueBonus()` | `baseBonus *= 2` + `-1 CON base` por técnica |
| **Haissaikai** | `resolveAttributes()` | Adiciona bônus do point Zoan ativo como bônus de arma |
| **Enma** | `resolveAttributes()` | Dobra bônus POD do Haki Armamento |
| **Murakumogiri** | `resolveAttributes()` | `CON base × 3` + flag de Retém 1 CON |

---

## Armas Gratuitas

A arma pode ser obtida sem custo de gemas em dois cenários:
1. **AM Faixa Laranja** com `laranjaChoice === 'unique_weapon'` → `gemBudget.ts` não cobra as 20g
2. **Lassoo** com profissão **não** Adestrador → a arma substitui a habilidade de mascote

---

## Validação

| Regra | ID |
|-------|----|
| Arma Única paga em duplicata (Laranja + custo manual) | `equip_double_paid_unique` |
| Mais de 2 equipamentos defensivos equipados | `equip_too_many_defensive` |

---

## Implementação

```ts
// src/data/uniqueWeapons.ts → UNIQUE_WEAPONS record (26 armas)
// src/shared/types/character.ts → UniqueWeapon, UniqueWeaponCharacteristic
// src/features/combat/engine/combatEngine.ts → verifica mechanics no resolveAttributes() e resolveTechniqueBonus()
// src/features/character/utils/gemBudget.ts → só cobra 20g se !gotFromLaranja
// src/features/character/utils/validator.ts → checkEquipment()
```

---

[← Técnicas](./19-tecnicas.md) | [Ciborgue →](./21-ciborgue.md)
