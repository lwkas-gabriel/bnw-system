# Entrega 0.6.4 — Fix: Escolha do Haki Primário

**Data:** 2026-04-19
**Branch:** develop
**Versão anterior:** 0.6.3

---

## Problema

Ao adquirir Haki pela primeira vez, o sistema sempre inicializava o **Armamento** como primário (pago) e a **Observação** como secundário (gratuito), independente da intenção do jogador.

A regra correta é: **o primeiro Haki escolhido é o primário** e custa gemas. O segundo é sempre gratuito, avançando apenas por aventuras.

---

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/features/character/components/HakiSection.tsx` | `initHaki()` recebe tipo primário; estado vazio exibe seleção |
| `src/shared/components/AppLayout.tsx` | Versão → v0.6.4 |
| `package.json` | Versão → 0.6.4 |

---

## Solução

- `initHaki(primary: "armament" | "observation")` — o tipo primário é passado como parâmetro
- O estado vazio agora exibe dois cards clicáveis: **Armamento** e **Observação**
- O card clicado se torna o primário (pago, 100g para 5 estágios)
- O outro é automaticamente definido como secundário (gratuito)

---

## Verificação

1. `npm run type-check` — zero erros ✓
2. Aba Haki sem haki adquirido → dois cards de seleção visíveis
3. Clicar em Observação → "Haki da Observação (Primário)" com badge "Pago"; Armamento com badge "Gratuito"
4. Clicar em Armamento → comportamento inverso
5. Custo no GemBudgetBar reflete o tipo primário selecionado
