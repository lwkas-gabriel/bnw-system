# 5. Character Builder

## Fluxo de Criação

O builder é organizado em 6 abas acessíveis via navegação horizontal. Não há ordem obrigatória.

| Aba | Conteúdo |
|-----|----------|
| Atributos | Raça, distribuição de pontos, energia, ambição, BPN automático |
| Haki | Primário/secundário, estágios, Rei, Avançado |
| Akuma no Mi | Tipo (Zoan/Logia/Paramecia), rank, configs específicas |
| Artes Marciais | Seleção de faixa com filtro de localização, escolha da Laranja |
| Técnicas | Técnicas gratuitas (por caminhos) + formulário para comprar |
| Equipamentos | Slots de arma e dois defensivos *(em desenvolvimento)* |

---

## Validação em Tempo Real

A cada `updateDraft()`, o `characterStore` revalida automaticamente via `validateCharacterFull()`. O resultado é exibido em três camadas:

1. **`ValidationBadge` no header** — contagem de erros/avisos, clicável para abrir o painel completo.
2. **Mensagens inline por seção** — ex: erro de pontos excedidos aparece direto em Atributos.
3. **`GemBudgetBar`** — barra de progresso visual do orçamento, fica vermelha quando excedido.

---

## characterStore — API Principal

```ts
// Criar personagem novo
newCharacter(name: string, gemBudget?: number): void

// Carregar ficha salva no draft
loadCharacter(id: string): void

// Salvar draft na lista de salvos
saveDraft(): void

// Aplicar mutação com re-validação automática
updateDraft(updater: (char: Character) => void): void

// Deletar ficha salva
deleteCharacter(id: string): void
```

O `updateDraft` é o único ponto de entrada para modificações. Nunca modifique `draft` diretamente — o Immer só funciona dentro do updater.

---

## Cálculo de Gemas — gemBudget.ts

`GEM_COSTS` é a **fonte única de verdade** para todos os custos do sistema:

```ts
export const GEM_COSTS = {
  akuma:        { C: 30, B: 60, A: 90, S: 50 },
  haki:         { stageBase: 20, secondary: 0, king: 20, advancedPartial: 20, advancedComplete: 20 },
  artesMarciais: { branca: 10, cinza: 10, /* ... todas as faixas */ },
  cyborg:       { perShift: 20, gear: 20 },
  uniqueWeapon: 20,
  technique:    { E: 6, D: 7, C: 8, B: 9, A: 10 },
  profession:   10,
  energyPerGem: 1,
}
```

> ⚠️ **Nunca hardcode valores de gema em componentes.** Se o sistema mudar os preços, apenas `GEM_COSTS` precisa ser atualizado.

`computeGemBudget()` retorna um `GemBudgetResult` com:
- `spent` — total gasto
- `remaining` — saldo
- `breakdown` — linha a linha por categoria
- `isOverBudget` — flag para a UI

**Casos especiais tratados:**
- Haki secundário (`secondary: 0`) não entra no breakdown.
- Arma Única obtida via Faixa Laranja (`laranjaChoice === 'unique_weapon'`) não é cobrada.

---

## Seções — Detalhes de Implementação

### AttributesSection

- Seleção de raça via grid de cards — click alterna a raça ativa.
- Botões +/− por atributo via `StatControl`. Mostra valor total (base + racial + investido).
- Contador de pontos restantes em tempo real, fica vermelho se excedido.
- Seção de derived stats: BPN, Energia, Ambição com `NumberStepper`.
- Breakdown de gemas expandido ao final.

### HakiSection

- Seletor primário/secundário via botões de toggle.
- `StageProgress` — 5 botões de estágio, ativo = highlight colorido.
- Toggle de Haki do Rei desabilitado se estágio 5 não atingido.
- Grid de variantes avançadas filtrado por localização (New World only).

### AkumaSection

- Seleção de tipo via cards descritivos (Zoan/Logia/Paramecia).
- Após seleção, configs específicas aparecem:
  - **Zoan:** vigorAnimal, toggle mitológica, nota sobre Desperto.
  - **Logia:** selector de atributo da Natureza Elemental, display de Intangibilidade e Área grátis.
  - **Paramecia:** *(configuração expandida pendente)*.

### ArtesMarciaisSection

- Lista vertical de todas as 14 faixas com indicador de disponibilidade por localização.
- Clicar em uma faixa seleciona até aquela (todas as anteriores são incluídas automaticamente).
- Faixas indisponíveis pela localização ficam opacas e desabilitadas.
- Bloco de escolha da Laranja (Arma Única vs 2 Técnicas Rank A) aparece ao atingir essa faixa.

### TechniquesSection

- Lista separada: técnicas gratuitas (por caminhos) e técnicas compradas.
- Formulário inline `NewTechForm` para adicionar técnicas compradas:
  - Seleção de rank, tipo (ofensiva/defensiva), atributo alvo.
  - Preview automático de bônus e custo de EN baseado no rank.

---

[← Regras Implementadas](./04-regras.md) | [Calculadora de Combate →](./06-calculadora-combate.md)
