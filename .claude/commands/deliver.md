# /deliver — Skill de Entrega BNW

Execute os passos abaixo em ordem. Não faça push — o push é feito manualmente pelo usuário.

---

## Passo 1 — Ler o guia de versionamento

Leia `skills/bnw-versioning/SKILL.md` na íntegra antes de continuar.

---

## Passo 2 — Analisar o estado do repositório

Execute em paralelo:
- `git log main..HEAD --oneline` — **todos** os commits já feitos nesta branch desde o último merge com main
- `git diff --stat` — mudanças não commitadas (staged + unstaged)
- `git status` — arquivos novos não rastreados

> Os commits listados por `git log main..HEAD` fazem parte desta entrega tanto quanto as mudanças ainda não commitadas. Inclua todos eles no arquivo de entrega (Passo 6) e leve-os em conta ao determinar a versão (Passo 4).

---

## Passo 3 — Criar commits semânticos para mudanças não commitadas

Para cada grupo lógico de mudanças ainda não commitadas:

1. Identifique o escopo (ex: `export`, `haki`, `ui`, `importer`)
2. Escolha o prefixo correto: `feat`, `fix`, `chore`, `docs`, `refactor`
3. Escreva a mensagem aludindo ao **que foi feito**, não ao arquivo (ex: `feat(export): exibir bônus raciais separados nos atributos`)
4. Faça `git add` apenas dos arquivos daquele grupo, depois `git commit`
5. Repita para cada grupo

Nunca use `git add -A` ou `git add .` — adicione arquivos específicos.

---

## Passo 4 — Determinar o número da nova versão

Com base em **todos** os commits de `main..HEAD` — tanto os que já existiam antes de você começar (Passo 2) quanto os recém-criados (Passo 3) — e nas regras de `bnw-versioning`:

- Liste os commits agrupados por tipo (`feat`, `fix`, etc.)
- Aplique a regra MINOR vs PATCH
- Determine `{VERSION}` (ex: `0.7.0`)

---

## Passo 5 — Bump de versão

Atualize **os dois arquivos ao mesmo tempo**:

1. `package.json` → campo `"version": "{VERSION}"`
2. `src/shared/components/AppLayout.tsx` → string `"v{VERSION} — Alpha"`

Execute `npm run type-check` para confirmar zero erros.

---

## Passo 6 — Criar o arquivo de entrega

Use o template abaixo como modelo. Crie `deliveries/{slug}-{VERSION}.md` onde `{slug}` é um nome curto em kebab-case que resume o conteúdo (ex: `forum-export-0.6.5.md`). Preencha todos os campos com base nos commits desta branch — incluindo os que já existiam antes deste `/deliver` ser chamado.

### Template

```markdown
# Entrega {VERSION} — {TITLE}

**Data:** {DATE}
**Branch:** develop
**Versão anterior:** {PREV_VERSION}

---

## Resumo

{SUMMARY}

---

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `{FILE}` | {CHANGE} |

---

## Detalhes

{DETAILS}

---

## Verificação

1. `npm run type-check` — zero erros ✓
2. {CHECK}
```

---

## Passo 7 — Atualizar o histórico de versões

Em `skills/bnw-versioning/SKILL.md`, adicione uma linha na tabela **Histórico de Versões**:

```
| {VERSION} | {descrição curta} | {módulos adicionados ou "—"} |
```

---

## Passo 8 — Commit de versão

Agrupe os arquivos de versão em um único commit:

```
git add package.json src/shared/components/AppLayout.tsx skills/bnw-versioning/SKILL.md deliveries/{slug}-{VERSION}.md
git commit -m "chore(release): bump version to {VERSION}"
```

Corpo do commit deve listar as features/fixes incluídos, seguindo o template em `bnw-versioning/SKILL.md`.

---

## Fim

Informe ao usuário:
- A versão gerada e o critério de bump (MINOR ou PATCH)
- Os commits criados (lista)
- O arquivo de entrega criado
- Que o push deve ser feito manualmente
