---
name: bnw-rules
description: >
  Leia quando for implementar ou corrigir qualquer regra do sistema BNW:
  fórmulas de combate, mecânicas de Haki/Akuma/AM, validação, custos de gemas.
---

# BNW Rules — Referência de Mecânicas

## Fórmulas Fundamentais

```ts
BPN          = Math.floor(level * 3 / 4)
energia      = level * 3 + gemasInvestidas
pontosAttr   = level + bonusRaciais   // base 6 já fixos na ficha, não investíveis
rollAtaque   = PRE + BPN + modificadores + 3d6
thresholdDef = DEF + BPN + modificadores + 10
danoBase     = POD + modificadores   // vs CON (temp first, depois base)
rollPericias = (pericia × 3) + 3d6
```

**Probabilidade de acerto com PRE = DEF (mesmo nível): ~58%** — sistema é levemente pró-ofensivo por design.

---

## Onde Estão os Dados do Sistema

```
src/data/races.ts          → RaceData: attrBonus, periciaBonus, specialAbility
src/data/haki.ts           → HAKI_ARMAMENT_STAGES[], HAKI_OBSERVATION_STAGES[], ADVANCED_HAKI[], KING_HAKI
src/data/techniques.ts     → TECHNIQUE_RANKS{}, ADHERENCES[], ROKUSHIKI[]
src/data/uniqueWeapons.ts  → UNIQUE_WEAPONS{} — todas as 26 armas com UniqueWeaponMechanics
```

Estes arquivos são **imutáveis em runtime**. Se uma regra mudar, edite o arquivo de dados.

---

## GEM_COSTS — Única Fonte de Verdade

```ts
// src/features/character/utils/gemBudget.ts
GEM_COSTS.akuma           = { C:30, B:60, A:90, S:50 }  // S = custo do Despertar sobre o A
GEM_COSTS.haki.stageBase  = 20   // × 5 estágios = 100g primário
GEM_COSTS.haki.secondary  = 0    // ← GRATUITO — apenas aventuras
GEM_COSTS.haki.king       = 20
GEM_COSTS.haki.advancedPartial   = 20
GEM_COSTS.haki.advancedComplete  = 20
GEM_COSTS.artesMarciais   = { branca:10, cinza:10, ... }  // cada faixa = 10g
GEM_COSTS.cyborg          = { perShift:20, gear:20 }
GEM_COSTS.uniqueWeapon    = 20
GEM_COSTS.technique       = { E:6, D:7, C:8, B:9, A:10 }
GEM_COSTS.energyPerGem    = 1
GEM_COSTS.profession      = 10  // por profissão
```

**Não inclui Arma Única se `laranjaChoice === 'unique_weapon'`.**

### Orçamento de Gemas

```
gemBudget inicial (nível 1) = 20g
máximo investível           = 400g
excesso → 4 XP por gema (só após atingir 400g)
```

~~**Bug pendente:** `createBlankCharacter` inicializa `gemBudget: 420`~~ — **corrigido para `20`**.

---

## Haki — Regras Críticas

| Regra | Implementação |
|-------|---------------|
| Secundário gratuito (0g) | `GEM_COSTS.haki.secondary = 0` |
| Só 1 tipo de Haki Avançado | Validado em `checkHaki()` no `validator.ts` |
| Rei requer estágio 5 | `checkHaki()` → `id: "haki_king_requires_5"` |
| Avançado requer New World | `checkHaki()` → `id: "haki_advanced_location"` |
| Rei Avançado: +Ambição em todas as técnicas | `resolveTechniqueBonus()` em `combatEngine.ts` |

---

## CON Temporária — Stack

```ts
// CombatantState.tempConStack: { source: string; value: number }[]
// Fontes: "haki_armament" e "tech_defensive"
// Absorvida ANTES da CON base via absorbDamage()
// Dano direto à CON base (ignora stack): Ryuo completo (+4), Kitetsu self (-1/tech)
```

---

## Armas Únicas — Mecânicas Especiais

| Arma | Mechanic key | Efeito no engine |
|------|-------------|------------------|
| `kitetsu` | `doublesTechniqueBase: true` | `baseBonus *= 2` em `resolveTechniqueBonus()` + `-1 CON` por tech |
| `haissaikai` | `mirrorsZoanPoints: true` | Adiciona bônus do point ativo à arma em `resolveAttributes()` |
| `enma` | `doublesHakiArmamentPow: true` | Dobra bônus POD do Haki Arm em `resolveAttributes()` |
| `murakumogiri` | `triplesBaseConAndRetains: true` | CON base × 3 + flag de Retém |

---

## Retém 1 CON

```ts
// CombatantState.retemUsed: boolean
// Condição: isKnockout && !retemUsed && (
//   (akuma.type === 'zoan' && akuma.isMythical) || equippedWeapon.characteristic === 'murakumogiri'
// )
// Efeito: newCon = 1, retemUsed = true
// Registrado em DamageResult.retemActivated = true
// Fontes: Zoan Mitológica (passivo de raça) e Murakumogiri (arma única)
```

---

## JxJ vs NPC

```ts
// mode === 'jxj' && turnNumber === 1 → ambos atacam (simultâneo)
// mode === 'vs_npc' → A ataca, B só ataca se A não KO
// T2+ (qualquer modo): mais ferido age primeiro
```

---

## Logia Passivos

```ts
// Sempre ativos (sem EN):
base.defense      += 4   // Intangibilidade
base.constitution += 4   // Intangibilidade
base[elementalNatureAttr] += 5  // Natureza Elemental
// Área Controlado: grátis em todas as técnicas ofensivas de Logia
// Elementalista: Status Aprimorado em ataque por 1 EN
```

---

## Validação — Adicionar Nova Regra

```ts
// src/features/character/utils/validator.ts
function checkMinhaRegra(char: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (/* condição */) {
    issues.push({
      id: "id_unico_snake_case",
      severity: "error",       // "warning" | "info"
      category: "Nome da Categoria",
      title: "Título curto",
      description: "O que está errado.",
      fix: "Como corrigir em PT-BR.",
      // autoFix: (c) => ({ ...c, campo: valor }),  // opcional
    });
  }
  return issues;
}
// Incluir em validateCharacterFull():
// ...checkMinhaRegra(char),
```

---

## Bônus de AM por Faixa (flat nos atributos base)

```ts
// src/features/combat/engine/combatEngine.ts → getFaixaBonuses()
branca:      {}               // nenhum flat (mas ver mecânica Haissaikai)
cinza:       { precision: 2 }
azul_clara:  { defense: 2 }
azul_escura: { power: 2 }
amarela:     { constitution: 2 }
// laranja..grao_mestre: bônus via resolveTechniqueBonus() ou mecânicas ativas:
laranja: +1 em cada item defensivo equipado; 2 Técnicas Rank A OU 1 Arma Única gratuita
verde:   +2 bônus em técnicas DEFENSIVAS
roxa:    +2 bônus em técnicas OFENSIVAS
marrom:  +1 adicional em cada item defensivo equipado (total +2 desde Laranja); 1 Técnica Rank A gratuita
preta:   pode equipar 1 arma extra (não permite 2 armas únicas simultâneas)
coral:   +2 bônus na arma extra
rajada:  +1 adicional em todos os itens defensivos (total +3 desde Laranja)
vermelha: +2 em POD/PRE/DEF/CON por 2 EN (escolha dura o turno) — mecânica ativa pendente na engine
grao_mestre: +2 rolls de ataque por 3 EN OU -2 rolls oponente por 3 EN — mecânica ativa pendente na engine
```

Laranja/Marrom/Rajada somam bônus cumulativos em itens defensivos. Vermelha e Grão Mestre têm mecânicas ativas pendentes de implementação no combatEngine.

---

## Bônus de Técnica por Tipo de Akuma

Os bônus específicos de Zoan/Logia/Paramecia em técnicas (`+1 base`) estão **desabilitados no engine** até serem confirmados nas regras. Quando confirmados, adicionar em `resolveTechniqueBonus()` em `combatEngine.ts`.

---

## Perícias — Referência Rápida

```
11 perícias: ambicao, atletismo, destreza, erudicao, expressao,
             furtividade, investigacao, logica, percepcao, persuasao, sobrevivencia
Graduação: 0–5
Roll: 3d6 + (gradação × 3)
Pontos iniciais: 3
Ganho: +1 a cada nível par (total 23 no nível 40)
Custo em gemas: 0 (progressão por nível)
```

**Atenção na implementação:** `char.ambition` existe como campo isolado — migrar para `char.pericias.ambicao` e atualizar referência em `combatEngine.ts`.

---

## Progressão XP

```
XP para nível N (N ≥ 2) = 75 + 15 × N
Tabela resumida: L2=90, L10=225 cumul, L20=360 cumul, L40=660 (total 14625)
Após nível 40: aventuras NÃO concedem mais XP; ganho de gemas cai para 1/3 do normal.
Jubilamento disponível: entrega personagem como NPC, cria nova PJ no nível 10 em Paradise com 100g + 50% desconto em 1 caminho.
```

---

## migrateCharacter — Ao Adicionar Campo no Character

```ts
// src/features/character/utils/importer.ts → migrateCharacter()
// SEMPRE adicionar o default para o novo campo:
novoCampo: (raw.novoCampo as any) ?? defaultSeguro,
```
