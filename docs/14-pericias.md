# 14. Sistema de Perícias

## O que são Perícias

Perícias representam habilidades aprendidas fora de combate. Cada perícia tem gradação de **0 a 5** e influencia os testes de habilidade feitos durante aventuras.

---

## Lista de Perícias (11 no total)

| ID | Nome | Descrição resumida |
|----|------|-------------------|
| `ambicao` | Ambição | Força de vontade, determinação, presença intimidadora |
| `atletismo` | Atletismo | Corrida, natação, escalada, resistência física |
| `destreza` | Destreza | Agilidade fina, acrobacias, equilíbrio |
| `erudicao` | Erudição | Conhecimento histórico, náutico, científico |
| `expressao` | Expressão | Atuação, disfarce, performance |
| `furtividade` | Furtividade | Stealth, bater carteira, se esconder |
| `investigacao` | Investigação | Análise de cenas, dedução, farejamento de pistas |
| `logica` | Lógica | Estratégia, xadrez, planejamento tático |
| `percepcao` | Percepção | Sentidos aguçados, detectar emboscadas |
| `persuasao` | Persuasão | Blefe, negociação, sedução, intimidação social |
| `sobrevivencia` | Sobrevivência | Orientação, caça, primeiros socorros no campo |

---

## Distribuição de Pontos

### Início (nível 1)

O personagem começa com **3 pontos** para distribuir livremente entre as 11 perícias.

### Ganho por Nível

A cada **nível par** (2, 4, 6, 8...), o personagem ganha **+1 ponto** de perícia.

```
Pontos ganhos por nível par = (nível / 2)
Total de pontos ao longo do jogo = 3 + floor(39 / 2) = 3 + 19 = 22... 
```

| Nível máximo (40) | Pontos iniciais | Pontos ganhos (níveis 2,4,6...40 = 20 níveis pares) | Total |
|------------------|-----------------|------------------------------------------------------|-------|
| 40               | 3               | 20                                                   | **23** |

---

## Rolagem de Perícia

```
Roll = 3d6 + (nível da perícia × 3)
```

Cada ponto investido numa perícia agrega **+3** ao resultado da rolagem.

| Nível de perícia | Bônus de roll |
|-----------------|---------------|
| 0 | +0 |
| 1 | +3 |
| 2 | +6 |
| 3 | +9 |
| 4 | +12 |
| 5 | +15 |

---

## Classes de Dificuldade (DC)

| Dificuldade | DC |
|-------------|-----|
| Trivial | 8 |
| Fácil | 11 |
| Médio | 14 |
| Difícil | 17 |
| Muito Difícil | 20 |
| Heroico | 23 |
| Lendário | 26+ |

---

## Ambição — Integração com Combate

A perícia **Ambição** tem papel especial no combate quando o personagem possui Haki do Rei Avançado:

- Com Rei Avançado ativo, o bônus de **todas** as técnicas usadas recebe +Ambição adicional.
- Exemplo: Ambição 5 + técnica ofensiva Rank A (base +5) → +5 (base) +5 (ambição) = +10.

**Atenção (implementação):** Atualmente `char.ambition` existe como campo isolado em `Character`. Ao implementar o sistema completo de perícias, migrar esse campo para `char.pericias.ambicao` e atualizar a referência em `combatEngine.ts`.

---

## Implementação Pendente

O módulo de Perícias ainda não está implementado. Ver `skills/bnw-features/SKILL.md` para o checklist completo. Pontos críticos:

1. Adicionar `PericiaId` e `CharacterPericias` em `src/shared/types/character.ts`
2. **Migrar** `char.ambition` → `char.pericias.ambicao` (não duplicar)
3. Atualizar referência em `combatEngine.ts`
4. Adicionar pontos de perícia disponíveis em `attrCalc.ts`
5. Não há custo de gemas para perícias — pontos são distribuídos por progressão de nível
6. Validar que total investido ≤ `3 + floor((nivel - 1) / 2) * 1`... ← recalcular regra exata

---

[← Progressão](./13-progressao.md)
