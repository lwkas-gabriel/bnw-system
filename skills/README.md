# BNW Skills — Como Usar

Esta pasta contém **skills** para o Claude de desenvolvimento.
Cada skill é um arquivo `SKILL.md` que deve ser lido pelo Claude **antes** de começar uma tarefa.

## Instalação

Copie as pastas de skills para o diretório de skills do Claude:

```bash
cp -r skills/bnw-overview  /mnt/skills/user/
cp -r skills/bnw-rules     /mnt/skills/user/
cp -r skills/bnw-frontend  /mnt/skills/user/
cp -r skills/bnw-features  /mnt/skills/user/
```

## Uso

Ao iniciar uma sessão de desenvolvimento, instrua o Claude:

> "Antes de começar, leia `/mnt/skills/user/bnw-overview/SKILL.md`"

Ou adicione ao system prompt do seu ambiente de desenvolvimento:

```
Antes de qualquer tarefa neste projeto, leia:
/mnt/skills/user/bnw-overview/SKILL.md

E em seguida o skill específico para a tarefa conforme indicado nele.
```

## Descrição das Skills

| Skill | Quando usar |
|-------|-------------|
| `bnw-overview` | **Sempre** — mapa do projeto, regras de ouro, onde está cada coisa |
| `bnw-rules` | Implementar mecânica, regra de jogo, validação, combate |
| `bnw-frontend` | Criar/editar componente, section, página, estilização |
| `bnw-features` | Adicionar módulo novo ou expandir módulo existente |

## Benefício

Em vez de reexplicar toda a arquitetura e regras a cada sessão (~2000-4000 tokens), o Claude lê apenas o skill relevante (~300-600 tokens) e já sabe exatamente onde está cada coisa e quais padrões seguir.
