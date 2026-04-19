---
name: bnw-frontend
description: >
  Leia quando for criar ou editar componentes React, sections do Character Builder,
  páginas, ou qualquer parte visual do BNW System.
---

# BNW Frontend — Padrões de UI

## Stack Visual

- **Tailwind CSS** — utility-first, tema dark slate + amber accent
- **Fontes:** `Inter` (body) via Google Fonts, `Cinzel` (headers h1/h2/h3)
- **Tema:** dark (bg-slate-950/900/800), accent amber-600, texto slate-200/400/500/600

---

## Paleta Principal

```
Backgrounds:  bg-slate-950 (app) / bg-slate-900 (cards) / bg-slate-800 (inputs/hover)
Texto:        text-slate-200 (principal) / text-slate-400 (secundário) / text-slate-500/600 (muted)
Accent:       amber-600 (primary actions) / amber-400 (textos de destaque) / amber-500/700/900 (variações)
Danger:       red-800 (botão) / red-400 (texto) / red-950/30 (bg) / red-800/50 (border)
Success:      green-400 (texto) / green-950/30 (bg) / green-800/40 (border)
Info:         blue-400 (texto) / blue-950/30 (bg) / blue-800/40 (border)
Borders:      border-slate-800 (cards) / border-slate-700 (inputs) / border-amber-600 (focus/selected)
```

---

## Componentes Disponíveis

Todos em `src/shared/components/index.tsx`. **Sempre usar antes de criar um novo.**

```tsx
<Button variant="primary|ghost|danger|amber" size="sm|md">...</Button>
<Input label="..." error="..." value={v} onChange={fn} />
<Select label="..." value={v} onChange={fn} options={[{value, label}]} />
<StatControl label shortLabel value base bonuses onIncrement onDecrement color="amber|blue|green|red" />
<GemBudgetBar spent={n} total={n} />
<SectionCard title="..." icon="..." action={<Button/>}>...</SectionCard>
// SectionCard: o header usa flex-wrap — título e action ficam na mesma linha
// enquanto couber e quebram automaticamente quando o espaço apertar.
<Tabs tabs={[{id, label, icon}]} active={id} onChange={fn} />
<NumberStepper value min max onChange label />
<Badge variant="amber|green|red|blue|slate">...</Badge>
<EmptyState icon title description action />
<PageHeader title subtitle actions />
<Tooltip content="..."><span/></Tooltip>
<ValidationPanel report={ValidationReport} compact onAutoFix={fn} />
<ValidationBadge report onClick />
```

---

## Classes CSS Customizadas (em index.css)

```css
.card          → bg-slate-900 border border-slate-800 rounded-xl p-4
.card-dark     → bg-slate-950 border border-slate-800 rounded-xl p-4
.section-title → text-xs font-semibold tracking-widest uppercase text-amber-500/80 mb-3
.btn-primary   → px-4 py-2 bg-amber-600 hover:bg-amber-500 ...
.input         → bg-slate-800 border border-slate-700 rounded-lg ...
.stat-bubble   → flex flex-col items-center w-16 h-16 rounded-xl border-2
.badge-ready   → bg-green-900/60 text-green-400 border-green-800
.badge-soon    → bg-slate-800 text-slate-400 border-slate-700
.badge-partial → bg-amber-900/60 text-amber-400 border-amber-800
```

---

## Estrutura de uma Nova Section do Builder

```tsx
// src/features/character/components/MinhaSection.tsx
import { useCharacterStore } from "../store/characterStore";
import { SectionCard, Button, Badge } from "../../../shared/components";

export function MinhaSection() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <SectionCard title="Título" icon="emoji" action={<Badge variant="amber">Info</Badge>}>
        {/* conteúdo */}
      </SectionCard>
    </div>
  );
}
```

**Sempre:**
- `max-w-2xl` no wrapper para legibilidade.
- `space-y-4` entre cards.
- `if (!draft) return null` no topo.
- Toda mutação via `updateDraft(c => { c.campo = valor; })`.
- Nunca calcular regras diretamente no componente — importar de `utils/`.

---

## Estrutura de uma Nova Página

```tsx
// src/pages/MinhaPagina.tsx
import { PageHeader, Button } from "../shared/components";

export default function MinhaPagina() {
  return (
    <div>
      <PageHeader
        title="Título da Página"
        subtitle="Descrição opcional"
        actions={<Button variant="primary">Ação</Button>}
      />
      <div className="px-6 py-6">
        {/* conteúdo */}
      </div>
    </div>
  );
}
```

---

## Adicionar Rota

```ts
// src/router/index.tsx
const NovaPagina = lazy(() => import("../pages/NovaPagina"));

// Na lista de routes:
{ path: "nova-rota", element: <NovaPagina /> },
```

---

## Adicionar Item no Nav Sidebar

```ts
// src/shared/components/AppLayout.tsx — array NAV
{ path: "/nova-rota", label: "Nome", icon: "emoji" },
// Se ainda for coming soon:
{ path: "/nova-rota", label: "Nome", icon: "emoji", soon: true },
```

---

## Padrões de Interação Recorrentes

### Toggle on/off (ex: Haki do Rei)
```tsx
<button
  onClick={() => updateDraft(c => { c.campo = !c.campo; })}
  className={`relative w-12 h-6 rounded-full transition-colors ${ativo ? "bg-amber-600" : "bg-slate-700"}`}
>
  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${ativo ? "translate-x-6" : "translate-x-0.5"}`} />
</button>
```

### Card selecionável (ex: seleção de raça/tipo)
```tsx
<button
  onClick={() => updateDraft(c => { c.campo = valor; })}
  className={`p-3 rounded-xl border text-left transition-all ${
    selecionado
      ? "border-amber-600 bg-amber-900/20"
      : "border-slate-700 bg-slate-800 hover:border-slate-600"
  }`}
>
```

### Accordion / expandível
```tsx
const [aberto, setAberto] = useState(false);
<button onClick={() => setAberto(!aberto)}>
  <span style={{ transform: aberto ? "rotate(90deg)" : "none" }}>›</span>
</button>
{aberto && <div>conteúdo</div>}
```

### Empty state
```tsx
{lista.length === 0 && (
  <EmptyState icon="📋" title="Nenhum item" description="..." action={<Button>+ Adicionar</Button>} />
)}
```

---

## Responsividade

Tamanho alvo mínimo: **375px** (iPhone SE/mini). Mobile-first com Tailwind breakpoints:
- `sm: 640px` — tablet pequeno
- `md: 768px` — tablet
- `lg: 1024px` — desktop

### Padrões obrigatórios

**Sidebar / AppLayout**  
A sidebar usa drawer pattern no mobile (slide-in com overlay). Botão hamburger aparece em `lg:hidden` fixo no canto superior esquerdo. Sempre fechar o drawer ao navegar (`onClick={close}` nos NavLinks).

**PageHeader**  
Já inclui `pt-14 lg:pt-6` para não colidir com o hamburger no mobile. Não override manualmente.

**Grids responsivos**  
```tsx
// Padrão: coluna única no mobile, expandindo em telas maiores
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
// Stats compactos (4 colunas): sempre 2 no mobile
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
```

**Tabs**  
O componente `<Tabs>` já tem `overflow-x-auto scrollbar-none` e `flex-shrink-0` nos botões. Não é preciso adicionar manualmente.

**Tabelas**  
Sempre envolver em `<div className="overflow-x-auto">`.

**Layouts master-detail** (ex: ShipsPage)  
Usar estado `mobileView: "list" | "detail"` + `hidden lg:block` para mostrar apenas uma view por vez no mobile. Adicionar botão "← Voltar" com `lg:hidden`.

**Touch targets**  
Botões primários: mínimo `min-h-[44px]` quando possível. Evitar botões menores que 32px em elementos interativos críticos.

**Páginas sem PageHeader** (ex: HomePage)  
Adicionar `pt-16 lg:pt-8` no container principal para compensar o hamburger no mobile.

---

## Erros Comuns a Evitar

- ❌ Criar estilo CSS inline quando existe classe Tailwind equivalente
- ❌ Usar `useState` para valores derivados do `draft` — calcular direto do store
- ❌ Importar de outro feature diretamente (`features/combat` importando de `features/character`)
- ❌ Usar `<form>` HTML — usar handlers `onClick`/`onChange` diretamente
- ❌ Re-implementar um componente que já existe em `shared/components/index.tsx`
- ❌ Grids fixos sem breakpoints (`grid-cols-4`) — sempre adicionar versão mobile (`grid-cols-2 sm:grid-cols-4`)
- ❌ Largura fixa em modais (`w-[480px]`) — usar `w-full max-w-[480px] mx-4`
