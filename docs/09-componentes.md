# 9. Componentes Compartilhados

Todos os componentes ficam em `src/shared/components/index.tsx` e são exportados via barrel.

---

## Catálogo

### Button

```tsx
<Button variant="primary" size="md" onClick={fn} disabled={false}>
  Texto
</Button>
```

| Prop | Tipo | Valores |
|------|------|---------|
| `variant` | string | `primary` · `ghost` · `danger` · `amber` |
| `size` | string | `sm` · `md` |
| `disabled` | boolean | — |

---

### Input

```tsx
<Input
  label="Nome"
  placeholder="Ex: Nagare Shigure"
  error="Campo obrigatório"
  value={val}
  onChange={fn}
/>
```

Aceita todos os atributos de `<input>` HTML. Borda vermelha quando `error` está preenchido.

---

### Select

```tsx
<Select
  label="Raça"
  value={selected}
  onChange={fn}
  options={[{ value: "human", label: "Humano" }]}
/>
```

---

### StatControl

Controle de atributo com botões +/− e exibição de base vs investido.

```tsx
<StatControl
  label="Poder"
  shortLabel="POD"
  value={totalValue}
  base={investedPoints}
  bonuses={baseAndRacial}
  onIncrement={fn}
  onDecrement={fn}
  color="red"           // "amber" | "blue" | "green" | "red"
/>
```

---

### GemBudgetBar

```tsx
<GemBudgetBar spent={310} total={420} />
```

Barra de progresso com valor numérico. Fica vermelha quando `spent > total`.

---

### SectionCard

Container de seção padrão do builder.

```tsx
<SectionCard title="Haki" icon="🌊" action={<Button>...</Button>}>
  {/* conteúdo */}
</SectionCard>
```

---

### Tabs

```tsx
<Tabs
  tabs={[{ id: "haki", label: "Haki", icon: "🌊" }]}
  active={activeTab}
  onChange={setActiveTab}
/>
```

---

### NumberStepper

```tsx
<NumberStepper
  value={5}
  min={0}
  max={5}
  onChange={fn}
  label="Ambição"
/>
```

---

### Badge

```tsx
<Badge variant="amber">Rank A</Badge>
<Badge variant="green">Gratuito</Badge>
<Badge variant="red">Erro</Badge>
```

Variantes: `amber` · `green` · `red` · `blue` · `slate`

---

### EmptyState

```tsx
<EmptyState
  icon="⚔️"
  title="Nenhum personagem ainda"
  description="Crie sua primeira ficha."
  action={<Button>+ Criar</Button>}
/>
```

---

### PageHeader

```tsx
<PageHeader
  title="Personagens"
  subtitle="3 fichas salvas"
  actions={<Button variant="primary">+ Novo</Button>}
/>
```

---

### ValidationPanel

```tsx
<ValidationPanel
  report={validationReport}
  compact={false}
  onAutoFix={(fixer) => updateDraft(fixer)}
/>
```

| Prop | Descrição |
|------|-----------|
| `report` | `ValidationReport` retornado por `validateCharacterFull()` |
| `compact` | Se `true`, exibe apenas erros (e avisos se sem erros) |
| `onAutoFix` | Callback para aplicar `autoFix` de um issue |

---

### ValidationBadge

```tsx
<ValidationBadge
  report={validationReport}
  onClick={() => setShowValidationPanel(true)}
/>
```

Badge compacta para headers. Mostra ✓ verde, ! âmbar ou ✕ vermelho conforme o estado.

---

### Tooltip

```tsx
<Tooltip content="BPN = floor(nível × 3/4)">
  <span>BPN: 22</span>
</Tooltip>
```

Aparece no hover, posicionado acima do elemento.

---

## AppLayout

```tsx
// src/shared/components/AppLayout.tsx
// Sidebar com navegação + main content area
```

Para adicionar um item ao nav, edite o array `NAV` em `AppLayout.tsx`:

```ts
const NAV: NavItem[] = [
  // ...
  { path: "/novo-modulo", label: "Novo Módulo", icon: "🆕" },
  // soon: true  ← adiciona badge "soon" e não bloqueia a rota
];
```

---

[← Import / Export](./08-import-export.md) | [Coming Soon →](./10-coming-soon.md)
