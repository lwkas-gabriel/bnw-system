# Entrega 0.7.1 — Rótulo da patente no export do fórum

**Data:** 2026-10-12
**Branch:** develop
**Versão anterior:** 0.7.0

---

## Resumo

Corrige o export de ficha para o fórum: a linha "Recompensa / Patente / Cargo / Rank" exibia o ID interno da patente (ex: `vice_comandante`, `ouro_b`) em vez do rótulo legível ("Vice-Comandante"). Também atualiza as diretrizes de entrega: o Claude não deve se adicionar como co-autor, e o `/deliver` ganha um passo opcional para criar o PR.

---

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/data/factions.ts` | Novo helper `getFactionLabel()` (rótulo da patente, com fallback para o ID) |
| `src/features/character/utils/exporter.ts` | `exportToForumHTML` usa `getFactionLabel()` na linha de patente |
| `CLAUDE.md` | Seção "Commits e PRs": sem co-autoria/rodapé do Claude |
| `.claude/commands/deliver.md` | Regra de co-autoria nos Passos 3 e 8; novo Passo 9 (criar PR sob demanda) |

---

## Detalhes

- `getFactionLabel(type, rankId)` reutiliza `getFactionRank()`, cobrindo ranks normais e laterais (ex: Agente Duplo, Radical). Se o ID não existir (ficha antiga/inválida), retorna o próprio ID para não gerar linha vazia.
- Passo 9 do `/deliver`: só roda quando pedido; exige `develop` já enviada ao remoto, evita PR duplicado e gera título `release {VERSION}: {TITLE}` e body (Resumo, O que mudou, Commits, Versão, Verificação) a partir do arquivo de entrega.

---

## Verificação

1. `npm run type-check` — zero erros ✓
2. `npx vitest run` — 119 testes passando ✓
3. Manual: ficha com facção (ex: Marinha / Vice-Almirante) → exportar para fórum → linha de patente mostra o rótulo.
