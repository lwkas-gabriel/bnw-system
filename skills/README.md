# BNW Skills — Como Usar

Esta pasta contém **skills** para o Claude de desenvolvimento.
Cada skill é um arquivo `SKILL.md` que deve ser lido pelo Claude **antes** de começar uma tarefa.

## Uso

As skills ficam versionadas em `skills/` e são referenciadas pelo `CLAUDE.md` da raiz, que o
Claude Code carrega automaticamente. Não é preciso copiá-las para outro diretório: o `CLAUDE.md`
indica qual `SKILL.md` ler para cada tipo de tarefa.

## Descrição das Skills

| Skill | Quando usar |
|-------|-------------|
| `bnw-overview` | **Sempre** — mapa do projeto, regras de ouro, onde está cada coisa |
| `bnw-rules` | Implementar mecânica, regra de jogo, validação, combate |
| `bnw-frontend` | Criar/editar componente, section, página, estilização |
| `bnw-features` | Adicionar módulo novo ou expandir módulo existente |
| `bnw-versioning` | Bump de versão, arquivo de entrega e PR (usado pelo `/deliver`) |

## Benefício

Em vez de reexplicar toda a arquitetura e regras a cada sessão (~2000-4000 tokens), o Claude lê apenas o skill relevante (~300-600 tokens) e já sabe exatamente onde está cada coisa e quais padrões seguir.
