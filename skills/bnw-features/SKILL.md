---
name: bnw-features
description: >
  Leia quando for adicionar um módulo novo ao BNW System (Profissões, Perícias,
  Embarcações, ou qualquer feature ainda não implementada).
  Também útil para expandir módulos existentes com novas sub-seções.
---

# BNW Features — Guia de Implementação

## Checklist para Novo Módulo

Execute nesta ordem exata:

```
[ ] 1. Tipos em shared/types/character.ts (ou novo arquivo se estrutura independente)
[ ] 2. Dados em src/data/novoModulo.ts (se tem constantes do sistema)
[ ] 3. Exportar em src/data/index.ts
[ ] 4. Default em importer.ts → migrateCharacter()
[ ] 5. Custo em gemBudget.ts → GEM_COSTS + computeGemBudget()
[ ] 6. Validação em validator.ts → nova função check + incluir em validateCharacterFull()
[ ] 7. Engine em combatEngine.ts (se afeta combate)
[ ] 8. Store em features/novoModulo/store/ (Zustand) ou integrar no characterStore
[ ] 9. Utils em features/novoModulo/utils/
[ ] 10. Componentes em features/novoModulo/components/
[ ] 11. Página em pages/NovoModuloPagina.tsx
[ ] 12. Rota em router/index.tsx (substituir ComingSoonPage)
[ ] 13. Nav em AppLayout.tsx (remover soon: true)
```

---

## Template: Dados do Sistema

```ts
// src/data/novoModulo.ts
import type { NovoTipo } from "../shared/types/character";

export interface NovoModuloData {
  id: NovoTipo;
  name: string;
  description: string;
  gemCost: number;
  // ... campos específicos
}

export const NOVO_MODULO: Record<NovoTipo, NovoModuloData> = {
  opcao_a: { id: "opcao_a", name: "...", description: "...", gemCost: 10 },
};
```

---

## Template: Store Zustand

```ts
// src/features/novoModulo/store/novoModuloStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface NovoModuloState {
  // estado
}
interface NovoModuloActions {
  // ações
}

export const useNovoModuloStore = create<NovoModuloState & NovoModuloActions>()(
  immer((set, get) => ({
    // implementação
  }))
);
```

Se o módulo está fortemente acoplado à ficha (ex: Profissões), integre no `characterStore` em vez de criar um store separado.

Se o módulo tem entidade própria independente (ex: Embarcações), crie store separado.

---

## Template: Section do Character Builder

```ts
// src/features/novoModulo/components/NovoModuloSection.tsx
import { useCharacterStore } from "../../character/store/characterStore";
import { SectionCard, Button } from "../../../shared/components";

export function NovoModuloSection() {
  const { draft, updateDraft } = useCharacterStore();
  if (!draft) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <SectionCard title="Novo Módulo" icon="🆕">
        {!draft.novoModulo ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm mb-4">Descrição do módulo.</p>
            <Button variant="primary" onClick={() => updateDraft(c => { c.novoModulo = valorInicial; })}>
              + Adicionar
            </Button>
          </div>
        ) : (
          <div>
            {/* configuração do módulo */}
            <Button variant="danger" size="sm" onClick={() => updateDraft(c => { c.novoModulo = null; })}>
              Remover
            </Button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
```

---

## Incluir Section no Character Builder

```tsx
// src/pages/CharacterBuilderPage.tsx

// 1. Importar:
import { NovoModuloSection } from "../features/novoModulo/components/NovoModuloSection";

// 2. Adicionar na lista de tabs:
const TABS = [
  // ...tabs existentes...
  { id: "novo_modulo", label: "Novo Módulo", icon: "🆕" },
];

// 3. Adicionar no render condicional:
{activeTab === "novo_modulo" && <NovoModuloSection />}
```

---

## Módulos Pendentes — O que Cada Um Precisa

### Profissões
- **Arquivo de regras necessário:** lista de profissões, mecânicas de teste, fabricação, slots
- **Tipo a adicionar:** `ProfessionId`, `CharacterProfession[]` em `Character`
- **Integração:** no `characterStore` (fica na ficha)
- **Validação:** checar se número de profissões não excede o máximo permitido por orçamento
- **Nota:** `GEM_COSTS.profession = 10` já existe

### Perícias
- **Arquivo de regras necessário:** lista completa, graduações, DCs, testes fora de combate
- **Tipo a adicionar:** `PericiaId`, `CharacterPericias` em `Character`
- **Cuidado:** `ambition` já existe como campo isolado em `Character` — ao implementar perícias, **migrar** esse campo para o sistema de perícias em vez de duplicar
- **Integração:** `combatEngine.ts` já lê `char.ambition` — ao migrar, atualizar a referência

### Embarcações
- **Arquivo de regras necessário:** tipos, atributos, upgrades, tripulação
- **Store:** separado (`shipStore.ts`) — embarcações não são parte da ficha do personagem
- **Tipo:** novo arquivo `src/shared/types/ship.ts`
- **Nota:** não impacta `combatEngine.ts` diretamente

### Construtor de Itens (UI)
- **Dados:** já existem em `src/data/uniqueWeapons.ts` (25 armas com todas as mecânicas)
- **O que falta:** apenas os componentes de UI e a página
- **Rota:** `/items` já existe, página `ItemsPage.tsx` existe como placeholder
- **Prioridade:** mais fácil de implementar — dados prontos, só criar a UI

---

## Expandir um Módulo Existente (ex: nova seção no Builder)

1. Criar o componente em `features/character/components/NovaSec.tsx`
2. Adicionar tab em `TABS` no `CharacterBuilderPage.tsx`
3. Adicionar `{activeTab === "nova_sec" && <NovaSec />}` no render
4. Se a nova seção introduz novo campo no `Character`, seguir o checklist completo acima

---

## Comunicação Entre Features

```ts
// ✅ CORRETO: via store compartilhado
const draft = useCharacterStore(s => s.draft);

// ✅ CORRETO: via shared/types
import type { Character } from "../../../shared/types/character";

// ❌ ERRADO: import direto entre features
import { something } from "../../combat/engine/combatEngine";  // do feature character
```

Exceção: `combatEngine.ts` pode ser importado de qualquer lugar — é utilitário puro, não é "feature de combat" no sentido de UI.
