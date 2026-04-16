# 7. Sistema de Validação

## Categorias e Verificações

| Categoria | Verificações | Severidades possíveis |
|-----------|--------------|----------------------|
| **Gemas** | Orçamento excedido; gemas não alocadas | Error, Warning, Info |
| **Atributos** | Pontos acima do máximo por nível; valores negativos; Ambição > 5 | Error, Warning |
| **Haki** | Secundário > primário; estágio 3+ sem Grand Line; Rei sem estágio 5; Avançado sem New World; King Advanced sem Controlled | Error, Info |
| **Akuma no Mi** | Rank S sem New World; Mitológica sem habilidades configuradas; Logia sem Status Aprimorado | Error, Warning |
| **Artes Marciais** | Faixas intermediárias sem Grand Line; avançadas sem New World; Laranja sem escolha definida | Error, Warning |
| **Técnicas** | Efeitos Rank A em técnicas de rank inferior; efeitos ofensivos em técnicas defensivas; nomes duplicados | Error, Warning |
| **Equipamentos** | Mais de 2 defensivos ativos; Arma Única possivelmente paga em duplicata | Error, Warning |
| **Ciborgue** | Gear sem 6 shifts; Gear sem New World; localizações de shift duplicadas | Error |
| **Energia** | Menos de 2 turnos estimados no pico; borderline 2-3 turnos | Warning, Info |

---

## Estrutura de um Issue

```ts
interface ValidationIssue {
  id: string;
  severity: "error" | "warning" | "info";
  category: string;
  field?: string;
  title: string;
  description: string;
  fix: string;                                    // sugestão de correção em PT-BR
  autoFix?: (char: Character) => Character;       // correção automática, quando possível
}
```

Todo issue tem obrigatoriamente um `fix` — issues sem sugestão de correção são considerados incompletos.

---

## Auto-Fix

Alguns issues têm `autoFix()` que corrige o problema automaticamente. O design intencional é **limitar auto-fixes a casos com exatamente uma correção possível e sem ambiguidade**.

| Issue | Auto-Fix |
|-------|----------|
| `ambition_over_max` | Reduz Ambição para 5 |

Erros como "pontos de atributo excedidos" não têm auto-fix porque o sistema não sabe quais atributos reduzir.

---

## ValidationReport

```ts
interface ValidationReport {
  isValid: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
  byCategory: Record<string, ValidationIssue[]>;  // agrupado para a UI
}
```

---

## ValidationPanel — Comportamento da UI

- Issues agrupados por categoria em acordeões colapsáveis.
- Categorias com erros têm fundo avermelhado no header.
- Cada issue tem botão **"Como corrigir"** que revela o texto de sugestão sem poluir a tela por padrão.
- Botão **"⚡ Corrigir automaticamente"** aparece apenas nos issues com `autoFix` disponível.
- Modo `compact` exibe apenas erros (e avisos se não houver erros) — usado no header do builder.

---

## ValidationBadge

Badge compacta para o header do Character Builder:

- ✓ **Verde** — ficha válida sem avisos.
- **! N avisos** — âmbar, clicável, abre o painel.
- **✕ N erros** — vermelho, clicável, abre o painel.

---

## Adicionando Novas Regras

Para adicionar uma nova verificação ao validador:

```ts
// validator.ts
function checkNovaRegra(char: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (/* condição de violação */) {
    issues.push({
      id: "nova_regra_id",
      severity: "error",       // ou "warning" ou "info"
      category: "Categoria",
      title: "Título descritivo",
      description: "O que está errado e por quê.",
      fix: "Como o usuário deve corrigir.",
      // autoFix: (c) => ({ ...c, campo: valorCorrigido }),  // opcional
    });
  }

  return issues;
}

// Incluir na função principal:
export function validateCharacterFull(char: Character): ValidationReport {
  const allIssues: ValidationIssue[] = [
    // ...checkers existentes,
    ...checkNovaRegra(char),
  ];
  // ...
}
```

---

[← Calculadora de Combate](./06-calculadora-combate.md) | [Import / Export →](./08-import-export.md)
