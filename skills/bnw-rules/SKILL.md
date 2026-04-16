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
pontosAttr   = 6 + level + bonusRaciais
rollAtaque   = PRE + BPN + modificadores + 3d6
thresholdDef = DEF + BPN + modificadores + 10
danoBase     = POD + modificadores   // vs CON (temp first, depois base)
```

**Probabilidade de acerto com PRE = DEF (mesmo nível): ~58%** — sistema é levemente pró-ofensivo por design.

---

## Onde Estão os Dados do Sistema

```
src/data/races.ts          → RaceData: attrBonus, periciaBonus, specialAbility
src/data/haki.ts           → HAKI_ARMAMENT_STAGES[], HAKI_OBSERVATION_STAGES[], ADVANCED_HAKI[], KING_HAKI
src/data/techniques.ts     → TECHNIQUE_RANKS{}, ADHERENCES[], ROKUSHIKI[]
src/data/uniqueWeapons.ts  → UNIQUE_WEAPONS{} — todas as 25 armas com UniqueWeaponMechanics
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
```

**Não inclui Arma Única se `laranjaChoice === 'unique_weapon'`.**

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
// Condição: isKnockout && !retemUsed && akuma.type === 'zoan' && akuma.isMythical
// Efeito: newCon = 1, retemUsed = true
// Registrado em DamageResult.retemActivated = true
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

## migrateCharacter — Ao Adicionar Campo no Character

```ts
// src/features/character/utils/importer.ts → migrateCharacter()
// SEMPRE adicionar o default para o novo campo:
novoCampo: (raw.novoCampo as any) ?? defaultSeguro,
```
