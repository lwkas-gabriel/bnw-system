# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# BNW System — Instruções para o Claude

## Comandos

```bash
npm run dev          # servidor de desenvolvimento (Vite)
npm run build        # tsc + vite build
npm run type-check   # tsc --noEmit (sem gerar arquivos)
npm run lint         # eslint (.eslintrc.cjs) com max-warnings 0
npm run test         # vitest (watch mode)
npm run test:run     # vitest uma vez — use para validar antes de commitar
npm run test:ui      # vitest com UI interativa
```

Antes de qualquer commit: `type-check`, `lint` e `test:run` sem erros.

## Commits e PRs

Não adicione o Claude como co-autor: nenhuma linha `Co-Authored-By: Claude ...` em commits e nenhum rodapé `Generated with Claude Code` em PRs.

## Skill Files

Antes de qualquer tarefa, leia:
- `skills/bnw-overview/SKILL.md` — sempre, é o mapa do projeto

Em seguida, baseado na tarefa:
- Regra/mecânica/combate → `skills/bnw-rules/SKILL.md`
- Componente/UI/página → `skills/bnw-frontend/SKILL.md`
- Módulo novo → `skills/bnw-features/SKILL.md`
- Versão / entrega / PR → `skills/bnw-versioning/SKILL.md` (e o comando `/deliver`)

## Convenções de código e manutenibilidade

As regras de ouro (lógica fora de componentes, `GEM_COSTS` como fonte única, `updateDraft` como único ponto de escrita da ficha, engine pura, types primeiro) estão em `skills/bnw-overview/SKILL.md` e valem sempre. As convenções abaixo complementam essas regras.

### Onde cada coisa vive

| O quê | Onde |
|---|---|
| Tabelas de regra, labels de domínio e constantes do jogo | `src/data/*` — nunca redeclarar em componente, util ou exporter |
| Custos em gemas e limites de orçamento (20/400, desconto de facção) | `src/data/gemCosts.ts` (`GEM_COSTS`, `GEM_BUDGET_MIN/MAX`, `FACTION_DISCOUNT_GEMS`) |
| Regras de domínio (cálculos, validação, export/import) | `src/features/<feature>/utils/*` — funções puras e testáveis |
| Helpers genéricos sem domínio (formatação, download, leitura de arquivo, labels) | `src/shared/utils/*` |
| Hooks genéricos | `src/shared/hooks/*`; hooks de uma feature em `src/features/<feature>/hooks/*` |
| Componentes reutilizáveis | `src/shared/components/index.tsx` |
| Subcomponentes de uma seção grande | pasta ao lado da seção (`components/akuma/`, `components/equipment/`, `features/ships/components/`) |

Se um valor ou label aparece em mais de um arquivo, ele pertence a `src/data`. Exemplo: o rótulo de uma perícia é `PERICIAS[id].name`, nunca uma string ou um mapa local.

### Antes de criar, procure

Já existem, e devem ser reutilizados:

- **Dados:** `ATTR_KEYS`/`ATTR_SHORT_LABELS`/`ATTR_LABELS`/`BASE_ATTRIBUTES` (`data/attributes`), `AM_FAIXAS` + `faixaIndex`/`hasReachedFaixa`/`faixaStatBonuses` (`data/artesMarciais`), `CYBORG_LOCATIONS` + `cyborgBonusLabel` (`data/cyborg`), `QUALITY_LABELS`/`EQUIPMENT_PRICES`/`SLOT_ATTRS` (`data/equipment`), `LOCATION_LABELS` (`data/locations`), `HAKI_TYPE_NAMES` (`data/haki`), `SHIP_ROLE_LABELS`/`SHIP_OWNERSHIP_LABELS`/`ENGINEER_DISCOUNT`/`KLABAUTERMANN_*` (`data/ships`), mapas `*_BY_ID` (use-os em vez de `.find`).
- **Regras:** `characterMaxEnergy`, `baseAttributes`, `bpn` (`attrCalc`); `computeHakiCost`/`hakiStageNum` (`haki`); `isUniqueWeapon`/`hasWeaponTrait` (`equipment`); `isUniqueWeaponFromLaranja` (`artesMarciais`); `createAkuma`/`applyAkumaRank`/`syncFreeTechniques` (`akuma`); `computeAttrBreakdown` (`attrBreakdown`); `computeShipTotalPrice`/`usedComodoSlots`/`shipHullPrice` (`ships/utils/shipCalc`).
- **Utils:** `formatBerries`/`formatBerriesShort`/`pad2` (`shared/utils/format`), `downloadText`/`slugify`/`copyToClipboard` (`download`), `readFileAsText`/`validateImportFile`/`readClipboardText`/`regexCapture` (`importIO`), `invertLabels` (`labels`).
- **UI:** `ToggleButton`, `SegmentedControl`, `StatTile`, `Callout`, `ProgressBar`, `Switch`, `Spinner`, `EmptyState` (`compact`), `CopyButton`, `ExportActions`, `FileDropZone`, `OrDivider`, `ImportStatusBanner`, `MessageList`, além de `Button`/`Input`/`Select`/`Badge`/`SectionCard`/`Tabs`/`NumberStepper`. Hooks: `useDraft` (seções do builder), `useCopyToClipboard`, `useFileImport`.

### Tipagem e imports

- **`any` é proibido** (o lint barra). Prefira narrowing por discriminante (`akuma.type === "zoan"`) e type guards (`isUniqueWeapon`). Use `as` só quando o formato já foi validado (ex.: após o schema zod no importer), e `!` só com justificativa em comentário.
- Unions de domínio têm tipo nomeado em `shared/types` (`LocationId`, `PrimaryHakiType`, `TechniqueSource`, `PericiaId`…). Não reescreva a união inline.
- Importe direto do arquivo (`../../../data/ships`), não do barrel `data/index.ts`.
- Seções do builder leem a ficha com `useDraft()`, nunca com `useCharacterStore()` sem seletor (isso re-renderiza a cada mudança do store).

### Nomenclatura

Substantivos do domínio em português (`faixa`, `pericia`, `companheiro`), verbos e estrutura de código em inglês (`compute*`, `resolve*`, `check*`, `render*`, `parse*`). Não faça renomeações em massa para "corrigir" nomes existentes.

### Ficha do fórum é um contrato

- O texto gerado por `exportToForumHTML` é lido de volta por `parseImportForumHTML`, e por fichas já publicadas no fórum. Mudar uma string do export exige atualizar o importer.
- Os snapshots em `features/character/utils/__tests__/__snapshots__` fixam o formato. Se um snapshot mudar, a mudança tem de ser intencional (commit `fix`/`feat`), nunca efeito colateral de refactor.
- Os mapas reversos do importer são derivados dos mesmos labels do export (`invertLabels`). Ao adicionar um label, não crie um mapa reverso à mão.
- Berries sempre via `formatBerries` (símbolo `B$`), na UI e no fórum.

### Testes

- Ficam em `__tests__/` ao lado do código, com fixtures em `features/character/utils/__tests__/fixtures.ts` (`createCharacterFixture`, `createRichCharacterFixture`).
- Toda regra nova em `utils/` ou `data/` ganha teste. Mudanças em exporter/importer exigem teste de round-trip (export → import).
- Bug corrigido = teste que falharia antes da correção.

### Componentes

- Um componente com mais de ~300 linhas, ou com subcomponentes que não dependem dele, deve ser quebrado em uma pasta ao lado.
- Arquivos `.tsx` exportam só componentes (regra `react-refresh`). Constantes e funções compartilhadas vão para um `.ts`.
- Tons e espaçamentos vêm dos primitivos acima: não reproduza à mão o padrão "âmbar quando ativo" nem caixas de aviso.

### Dívida técnica conhecida

Não corrigida nesta etapa; trate quando tocar no código relacionado:

- **Dois validadores:** `attrCalc.validateCharacter` (legado, usado pelo store) e `validator.validateCharacterFull`. Unificar muda os erros exibidos no builder.
- **Probabilidade no combate:** a página `CombatPage` calcula a probabilidade de acerto com atributos base, sem os bônus de caminhos que o engine usa.
- **Bônus Zoan/Logia em técnicas:** está pendente de confirmação de regra. O código comentado foi removido do `combatEngine`; reimplementar só com a regra documentada em `docs/`.
- **Formulários:** ainda há `<input>`/`<select>`/`<textarea>` montados à mão (Akuma, Companheiros, Ciborgue, Builder) e cartões de opção selecionável (`OptionTile`) repetidos. São candidatos a primitivos `Field`/`Textarea`/`OptionTile` e a variantes de tamanho de `Input`/`Select`.
- **Exclusões sem confirmação:** excluir personagem, navio, Akuma ou Ciborgue não pede confirmação. Adicionar uma confirmação muda o comportamento.
- **CSP do `index.html`:** não libera `fonts.googleapis.com`/`fonts.gstatic.com`, então o `@import` das fontes Cinzel/Inter em `src/index.css` é bloqueado e o app usa as fontes de fallback. Em `npm run dev`, o script de debug do Vercel Analytics (`va.vercel-scripts.com`) também é bloqueado; em produção ele vem de `/_vercel/insights`, na mesma origem, e funciona.
- **`noUncheckedIndexedAccess`:** está desligado no tsconfig. Ligar exige revisar os acessos `MAP[key]`.
