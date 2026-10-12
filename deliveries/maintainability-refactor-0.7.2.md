# Entrega 0.7.2 — Manutenibilidade: deduplicação, correções e convenções

**Data:** 2026-10-12
**Branch:** develop
**Versão anterior:** 0.7.1

---

## Resumo

Refatoração de manutenibilidade da codebase inteira. Um scan encontrou regras, labels e padrões de UI copiados em vários arquivos, e várias dessas cópias já divergiam entre si, o que gerava bugs. Esta entrega:

- Corrige 10 bugs, cada um com teste. Os principais: energia do Ciborgue, Akuma e facção perdidas no reimport, custo de Haki, bônus de Artes Marciais, narração e resultado do combate, rótulos crus na tela.
- Centraliza dados e regras em fontes únicas (`src/data`, `utils/`).
- Cria primitivos de UI compartilhados e quebra os componentes gigantes.
- Restaura o tooling: o lint voltou a funcionar e o `any` passa a ser proibido.
- Documenta as convenções no `CLAUDE.md`.

A saída da ficha do fórum continua idêntica à anterior, exceto nas correções de bug. Isso está garantido por snapshots e por uma comparação com a versão antiga.

---

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `.eslintrc.cjs`, `.gitattributes`, `.editorconfig`, `.gitignore`, `package.json`, `vitest.config.ts` | Lint funcionando (`no-explicit-any` como erro), finais de linha LF, script `test:run`, `dist` ignorado |
| `src/data/gemCosts.ts` | Novo: `GEM_COSTS` (saiu de `utils/gemBudget`), `akumaTotal`, `GEM_BUDGET_MIN/MAX`, `FACTION_DISCOUNT_GEMS` |
| `src/data/attributes.ts`, `artesMarciais.ts`, `cyborg.ts`, `equipment.ts`, `locations.ts` | Novos: labels de atributo, 14 faixas de AM (bônus, região), locais de Ciborgue, qualidade/preços/slots, localizações |
| `src/data/ships.ts`, `races.ts`, `factions.ts`, `haki.ts`, `techniques.ts`, `pericias.ts`, `akumaModules.ts`, `professions.ts` | `maxHull`, labels de função/aquisição, constantes do Klabautermann, `forumLabel`, `singularName`, `HAKI_TYPE_NAMES`, regras por rank da Akuma, mapas `*_BY_ID` |
| `src/shared/types/character.ts`, `combat.ts`, `ship.ts`, `io.ts` | `LocationId`, `PrimaryHakiType`, `TechniqueSource`, `PericiaId` nos bônus, `ImportStatus`/`ExportEnvelope` |
| `src/shared/utils/format.ts`, `download.ts`, `importIO.ts`, `labels.ts` | Novos: `formatBerries` (B$), download/clipboard, leitura e validação de import, `invertLabels` |
| `src/shared/hooks/*`, `src/shared/components/index.tsx` | `useCopyToClipboard`, `useFileImport`; `ToggleButton`, `SegmentedControl`, `StatTile`, `Callout`, `ProgressBar`, `Switch`, `Spinner`, `FileDropZone`, `ExportActions`, `CopyButton`, `ImportStatusBanner`, `MessageList`, `OrDivider` |
| `src/features/character/utils/haki.ts`, `akuma.ts`, `equipment.ts`, `artesMarciais.ts`, `attrBreakdown.ts`, `attrCalc.ts` | Regras extraídas dos componentes e unificadas (`computeHakiCost`, `characterMaxEnergy`, `baseAttributes`, `isUniqueWeapon`, `computeAttrBreakdown`…) |
| `src/features/character/utils/exporter.ts`, `importer.ts`, `validator.ts` | Export dividido por seção, parser do fórum por seção e sem `any`, mapas reversos derivados, coletor de issues por categoria |
| `src/features/character/components/**` | `AkumaSection` (1075 → ~170 linhas) e `EquipmentSection` (617 → ~210) divididos em subpastas; `useDraft`; uso dos primitivos |
| `src/features/ships/**`, `src/pages/ShipsPage.tsx` | `shipCalc`, `withShip` no store, abas em `features/ships/components` (página 736 → ~180 linhas) |
| `src/features/combat/engine/combatEngine.ts`, `src/pages/CombatPage.tsx` | `resolveStrike`, `initialCombatantState`, remoção de código morto; mensagem de resultado corrigida |
| `src/pages/ImportPage.tsx` | Reescrita com primitivos compartilhados (515 → ~270 linhas) |
| `src/**/__tests__/*` | 55 testes novos (119 → 174): snapshots do fórum, round-trips, stores, utils, data |
| `CLAUDE.md`, `skills/*`, `docs/03,08,09,11,README` | Seção "Convenções de código e manutenibilidade" e docs alinhados ao código |

---

## Detalhes

### Bugs corrigidos

1. **Energia do Ciborgue no export:** a ficha do fórum ignorava o +20 de energia do Shift 3. Agora o export registra o bônus e o importer o lê de volta.
2. **Akuma perdida ao reimportar:** o importer não reconhecia o cabeçalho que o próprio exporter gera.
3. **Facção perdida no import JSON:** `migrateCharacter` descartava `faction` e `commissionedShipId`.
4. **Custo de Haki divergente:** a tela tratava o estágio avançado como 0 e usava outra regra para o Rei Avançado. O export mostrava sempre 20g para o Rei.
5. **Bônus acumulados de AM:** a lista do fórum ficava desalinhada a partir da faixa Laranja.
6. **Energia inicial do combate:** não incluía o +20 do Ciborgue.
7. **Narração do contra-ataque:** omitia o dano direto, porque os blocos A→B e B→A eram cópias que tinham divergido.
8. **Resultado do combate:** exibia "Empate — ambos nocauteados" mesmo quando os turnos acabavam sem nocaute.
9. **Rótulos crus:** a tela mostrava "POW" em vez de "POD" e o ID da perícia em vez do nome (cards de raça, Haki, técnicas, bugigangas).
10. **Ships:** o import de navio passa a validar tamanho e extensão do arquivo e a área de transferência vazia, como o de personagem.

### Mudanças visíveis

- **Berries:** a UI passa a usar `B$`, como nas fichas do fórum (antes era `₿`).
- **Embarcações:** o botão de copiar JSON agora mostra o feedback "Copiado!".
- **Tons unificados:** caixas de aviso e blocos de estatística têm tons ligeiramente unificados.

### Dívida registrada (não tratada)

Detalhada no `CLAUDE.md`:
- dois validadores coexistindo;
- probabilidade de acerto no combate calculada sem os bônus de caminhos;
- campos de formulário e cartões de opção ainda montados à mão;
- exclusões sem confirmação;
- CSP do `index.html` bloqueando as fontes Cinzel/Inter do Google Fonts.

---

## Verificação

1. `npm run type-check` — zero erros ✓
2. `npm run lint` — zero erros e zero avisos (`no-explicit-any` ativo) ✓
3. `npx vitest run` — 174 testes passando ✓
4. `npm run build` — ok ✓
5. **Smoke visual no Edge headless:**
   - Telas percorridas: builder (todas as abas, ficha Zoan e ficha humana com Logia), Import/Export, Embarcações (5 abas), Itens, Perícias, Profissões e Combate.
   - Interações exercitadas: editor de arma (Comum/Única/Lendária), seleção e troca de combatente e simulação.
   - Nenhum erro de JavaScript. Os únicos erros de console vieram do CSP (o do antivírus local e o do próprio `index.html` com as fontes).
6. **Sugestão manual:**
   - Criar uma ficha com Akuma, Haki, AM Laranja+ e Ciborgue (Shift 3 = energia), exportar para JSON e para o fórum e reimportar as duas.
   - Repetir com um navio.
