# Responsividade Mobile — v0.6.2

**Data:** 2026-04-19
**Branch:** develop
**Versão anterior:** 0.6.1
**Versão entregue:** 0.6.2

---

## Contexto

O BNW System foi desenvolvido com foco exclusivo em desktop. Em telas mobile (~375px)
o layout quebrava em múltiplos pontos críticos: a sidebar ocupava 224px deixando apenas
151px para o conteúdo, tabs extravasavam horizontalmente, grids de 3–4 colunas ficavam
ilegíveis e o ShipsPage tinha um layout two-column impossível de usar.

O objetivo desta entrega foi tornar todas as páginas utilizáveis a partir de 375px
(iPhone SE/mini) sem quebrar o layout desktop.

---

## O que foi feito

### P0 — Bloqueantes

**Sidebar com hamburger drawer (`src/shared/components/AppLayout.tsx`)**

- No mobile a sidebar é um drawer deslizante (`fixed`, `translate-x`) com overlay
  escuro que fecha ao clicar fora.
- Botão hamburger (`lg:hidden`) fixo no canto superior esquerdo.
- Todos os NavLinks chamam `close()` ao navegar.
- Desktop (`lg:`) inalterado — sidebar sempre visível.

**Tabs com scroll horizontal (`src/shared/components/index.tsx`)**

- Adicionado `overflow-x-auto scrollbar-none` no container.
- Botões recebem `flex-shrink-0` para não colapsarem.
- Afeta CharacterBuilder, ShipsPage e ItemsPage.

**ShipsPage — layout master-detail mobile (`src/pages/ShipsPage.tsx`)**

- Estado `mobileView: "list" | "detail"` controla qual painel é exibido.
- Lista de navios ocupa tela toda no mobile; painel de detalhe fica oculto.
- Ao selecionar um navio, muda para `"detail"`.
- Botão "← Embarcações" (`lg:hidden`) no topo do detalhe para voltar.

---

### P1 — Importantes

**CharacterBuilderPage (`src/pages/CharacterBuilderPage.tsx`)**

- Modal de criação: `w-[480px]` → `w-full max-w-[480px] mx-4`.
- Modos de criação: `grid-cols-3` → `grid-cols-1 sm:grid-cols-3`.
- Header do builder reestruturado:
  - Abaixo de 579px: grid 2 colunas (Nome/Level na linha 1, Local/Gemas na linha 2,
    Actions `col-span-2` na linha 3 alinhadas à direita).
  - Acima de 579px: flex row com wrap natural; Actions empurradas com `ml-auto`.
  - `GemBudgetBar` oculta no mobile (`lg:hidden`); substituída por contador de texto
    `gasto/totalg` nas demais resoluções.
  - Input do nome usa atributo `size` para ocupar apenas o espaço do conteúdo.
- `pt-14 lg:pt-4` no header para não colidir com o hamburger.

**ItemsPage (`src/pages/ItemsPage.tsx`)**

- Regras de Craft: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`.
- Consumíveis: `grid-cols-3` → `grid-cols-1 sm:grid-cols-3`.
- Tabs do catálogo com `overflow-x-auto` e botões `flex-shrink-0`.

**CharacterListPage (`src/pages/CharacterListPage.tsx`)**

- Stats do personagem: `grid-cols-4` → `grid-cols-2 sm:grid-cols-4`.

**CombatPage (`src/pages/CombatPage.tsx`)**

- Painéis dos combatentes: `flex-row` → `flex-col lg:flex-row`.
- Atributos por combatente: `grid-cols-4` → `grid-cols-2 sm:grid-cols-4`.

---

### P2 — Enhancements

**PericiasPage (`src/pages/PericiasPage.tsx`)**

- Exemplos de nível: `grid-cols-6` → `grid-cols-2 sm:grid-cols-3 md:grid-cols-6`.

**ImportPage (`src/pages/ImportPage.tsx`)**

- Botões de export: `flex` → `flex flex-wrap`.

**AttributesSection (`src/features/character/components/AttributesSection.tsx`)**

- Container dos StatControls: `flex justify-around` → `flex flex-wrap justify-around gap-4`
  para que os atributos quebrem linha em telas muito pequenas em vez de comprimir.

---

### Componentes compartilhados

**PageHeader (`src/shared/components/index.tsx`)**

- `pt-14 lg:pt-6` para dar espaço ao hamburger em todas as páginas que usam o componente.
- `px-4 lg:px-6` para padding lateral responsivo.

**SectionCard (`src/shared/components/index.tsx`)**

- Header com `flex-wrap gap-2`: título e action ficam na mesma linha enquanto couber,
  quebram automaticamente quando o espaço apertar.

**HomePage (`src/pages/HomePage.tsx`)**

- `pt-16 lg:pt-8` no container principal (não usa PageHeader).

---

## Arquivos alterados

| Arquivo | Mudança principal |
|---------|-----------------|
| `src/shared/components/AppLayout.tsx` | Hamburger + sidebar drawer mobile |
| `src/shared/components/index.tsx` | Tabs scroll, PageHeader padding, SectionCard wrap |
| `src/pages/CharacterBuilderPage.tsx` | Header 2-col mobile, modal width, grid breakpoints |
| `src/pages/ShipsPage.tsx` | Master-detail mobile com mobileView state |
| `src/pages/ItemsPage.tsx` | Grids responsivos, tabs scroll |
| `src/pages/CharacterListPage.tsx` | Stats grid |
| `src/pages/CombatPage.tsx` | Painéis stack + attrs grid |
| `src/pages/PericiasPage.tsx` | Level examples grid |
| `src/pages/ImportPage.tsx` | Export buttons wrap |
| `src/pages/HomePage.tsx` | Top padding mobile |
| `src/features/character/components/AttributesSection.tsx` | StatControls wrap |
| `skills/bnw-frontend/SKILL.md` | Seção Responsividade + nota SectionCard |

---

## Versionamento

**Critério aplicado: PATCH** (`0.6.1 → 0.6.2`)

Nenhum módulo novo, nenhuma mecânica nova. Todas as mudanças são ajustes de layout
e CSS para que features já existentes funcionem corretamente em viewports menores.
Conforme `bnw-versioning/SKILL.md`, PATCH se aplica a correções que não alteram
funcionalidade.
