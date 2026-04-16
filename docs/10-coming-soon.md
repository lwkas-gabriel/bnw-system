# 10. Módulos Coming Soon

## Dados Necessários por Módulo

| Módulo | Dados necessários | Impacto em arquivos existentes |
|--------|-------------------|-------------------------------|
| **Profissões** | Lista, mecânicas de teste, fabricação, slots por aventura | `validator.ts`, `gemBudget.ts`, `character.ts` |
| **Perícias** | Lista completa, graduações, DCs, testes | `validator.ts`, `character.ts`, `combatEngine.ts` (Ambição já integrado) |
| **Embarcações** | Tipos, atributos, upgrades, tripulação, capacidade | Novo tipo `Ship` em `shared/types/`, novo store |
| **Itens (UI)** | Dados já catalogados em `data/uniqueWeapons.ts` | Apenas criar os componentes de UI |

---

## Passo a Passo para Implementar um Novo Módulo

Usando Profissões como exemplo:

**1. Criar os dados estáticos**
```
src/data/professions.ts
```
Lista de profissões, mecânicas, custos em gemas, slots de fabricação.

**2. Adicionar tipos**
```ts
// src/shared/types/character.ts
export type ProfessionId = "ferreiro" | "engenheiro" | "medico" | "cozinheiro" | "navegador" /* ... */;

export interface CharacterProfession {
  id: ProfessionId;
  level: number;
}
```
E adicionar no tipo `Character`:
```ts
professions: CharacterProfession[];
```

**3. Criar a feature**
```
src/features/professions/
  components/
    ProfessionsSection.tsx
  store/
    professionsStore.ts    ← ou integrar no characterStore
  utils/
    professionCalc.ts
```

**4. Criar a página**
```
src/pages/ProfessionsPage.tsx
```

**5. Atualizar o router**
```ts
// src/router/index.tsx
// Substituir:
{ path: "professions", element: <ComingSoonPage module="Profissões" /> },
// Por:
const ProfessionsPage = lazy(() => import("../pages/ProfessionsPage"));
{ path: "professions", element: <ProfessionsPage /> },
```

**6. Adicionar validação**
```ts
// src/features/character/utils/validator.ts
function checkProfessions(char: Character): ValidationIssue[] {
  // regras de profissão
}
// Incluir em validateCharacterFull()
```

**7. Adicionar custos de gemas**
```ts
// src/features/character/utils/gemBudget.ts
export const GEM_COSTS = {
  // ...
  profession: 10,  // já existe — verificar se é suficiente
};
```

**8. Remover badge "soon" do nav**
```ts
// src/shared/components/AppLayout.tsx
{ path: "/professions", label: "Profissões", icon: "📜" },
// Remover: soon: true
```

**9. Adicionar ao `migrateCharacter()`**
```ts
// src/features/character/utils/importer.ts
professions: Array.isArray(raw.professions) ? raw.professions : [],
```

---

## Perícias — Integração Parcial Existente

A perícia **Ambição** já está integrada ao sistema:

- `character.ambition: number` no tipo `Character`.
- Usado por `resolveTechniqueBonus()` quando Haki do Rei Avançado está ativo.
- Validado em `checkAttributes()` (`ambition > 5` é erro).
- Exibido e editável na `AttributesSection` via `NumberStepper`.

Ao implementar o módulo completo de Perícias, este campo deve ser **migrado** para o sistema de perícias em vez de ser um campo isolado.

---

## Embarcações — Considerações

Embarcações são estruturalmente independentes de personagens — precisarão de um store separado (`shipStore.ts`) em vez de integrar no `characterStore`.

Sugestão de tipo base:

```ts
interface Ship {
  id: string;
  name: string;
  type: ShipType;
  level: number;
  attributes: ShipAttributes;
  upgrades: ShipUpgrade[];
  crew: number;
  ownerId: string;   // character.id
}
```

---

[← Componentes](./09-componentes.md) | [Princípios →](./11-principios.md)
