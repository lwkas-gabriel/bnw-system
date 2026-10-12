---
name: bnw-versioning
description: >
  Leia quando for fazer bump de versão do BNW System: como determinar o número
  correto, onde atualizar e como documentar no PR.
---

# BNW Versioning — Guia de Versionamento

## Formato: `0.MINOR.PATCH`

```
Major (0): API pré-estável — permanece 0 até o produto ser considerado estável para produção.
Minor (X): Adição de novos módulos ou funcionalidades retrocompatíveis.
Patch (Y): Correções de bug sem novas funcionalidades.
```

**Regra de reset:** ao incrementar MINOR, resetar PATCH para 0.
Bug fixes bundled na mesma release de features **não somam ao PATCH** — eles são absorvidos pelo MINOR bump.
O PATCH só cresce em hotfixes *isolados* publicados após um MINOR sem nenhuma feature nova (ex: `0.5.1`).

---

## Como Determinar a Versão

### Bump de MINOR (+0.1.0) quando:
- Novo módulo implementado no builder (ex: Facções, Perícias, Profissões)
- Nova página ou feature de produto end-to-end
- Adição de tipos e dados que expandem o sistema

**Escala sugerida para um PR com vários módulos:**
- 1 módulo → +1 MINOR
- 2–3 módulos → +2 MINOR
- 4+ módulos → +3–4 MINOR (nunca mais que o nº de módulos)

### Bump de PATCH (+0.0.1) quando:
- Correção de bug sem nova funcionalidade
- Ajuste de UI que não adiciona features
- Atualização de documentação/skills interna

### Não altera versão:
- Refactor interno sem mudança de comportamento
- Atualização de testes
- Commits de `chore` ou `docs` isolados

---

## Onde Atualizar

Dois arquivos, sempre juntos:

```
package.json                              → campo "version"
src/shared/components/AppLayout.tsx       → string literal "vX.Y.Z — Alpha"
```

Nunca atualizar apenas um dos dois.

---

## Histórico de Versões

| Versão | Descrição | Módulos adicionados |
|--------|-----------|---------------------|
| 0.1.0  | Esqueleto base: Character Builder core (Atributos, Haki, Akuma, AM, Ciborgue, Técnicas) | — |
| 0.5.0  | Sprint completo: 7 novos módulos, testes unitários e sistema de facções | Perícias, Profissões, Equipamentos, Armas Únicas, Embarcações, Akuma editor, Facções |
| 0.5.1  | Security hardening: schema Zod no importer, limite de tamanho, MIME type, CSP e headers HTTP | — |
| 0.5.2  | Modos de criação de personagem: Jogador Novo, Personalizado e Máximo | — |
| 0.6.0  | Aba de embarcação comissionada no builder e upgrade de tamanho de navio | — |
| 0.7.0  | Exportador/importador de fichas de embarcação; tabelas completas AM no fórum; bônus racial+AM detalhados | ships/utils (shipExporter, shipImporter) |
| 0.7.1  | Fix: rótulo da patente da facção no export do fórum; /deliver com criação opcional de PR | — |
| 0.7.2  | Refatoração de manutenibilidade (fontes únicas em src/data, primitivos de UI, divisão de componentes, lint sem any) + 10 correções de bugs | — |

---

## Checklist de Versionamento

```
[ ] 1. Determinar novo número (ver tabela acima)
[ ] 2. Editar "version" em package.json
[ ] 3. Editar string de versão em AppLayout.tsx
[ ] 4. Adicionar linha no Histórico de Versões neste arquivo
[ ] 5. Commitar: chore(release): bump version to X.Y.Z
[ ] 6. Documentar no PR — seção "Versão" com número e critério de bump
```

---

## Template de Commit

```
chore(release): bump version to 0.X.Y

0.X.0: <lista dos módulos/features adicionados>
0.X.Y: <lista de bugs corrigidos se houver patch>
```

---

## Notas

- O versionamento é feito **uma vez por PR para main**, não por commit individual.
- Enquanto Major = 0, qualquer mudança de interface ou comportamento pode acontecer sem aviso — o projeto não tem API pública estável.
- A tag `— Alpha` em `AppLayout.tsx` permanece até Major ≥ 1.
