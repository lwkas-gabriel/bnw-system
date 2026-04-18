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

## Módulos — Status Atual

### Profissões ✅ Documentado + UI Parcial
- **Regras em:** `docs/24-profissoes.md`
- **7 profissões:** Adestrador, Arqueólogo, Cozinheiro, Engenheiro, Ferreiro, Médico, Navegador
- **Dados em:** `src/data/professions.ts`
- **UI em:** `src/features/character/components/ProfissoesSection.tsx`
- **GEM_COSTS.profession = 10** (cada profissão)

### Perícias ✅ Documentado + Implementado
- **Regras em:** `docs/14-pericias.md`
- **11 perícias:** ambicao, atletismo, destreza, erudicao, expressao, furtividade, investigacao, logica, percepcao, persuasao, sobrevivencia
- **Dados em:** `src/data/pericias.ts`
- **UI em:** `src/features/character/components/PericiasSection.tsx`
- **Cuidado:** `ambition` existe como campo isolado em `Character` — ao usar, preferir `char.pericias.ambicao`

### Embarcações ✅ Documentado + UI Parcial
- **Regras em:** `docs/27-embarcacoes.md`
- **Dados em:** `src/data/ships.ts` (SHIP_SIZES, SHIP_MECHANISMS, SHIP_COMODOS)
- **Tipos em:** `src/shared/types/ship.ts`
- **Store:** `src/features/ships/store/shipStore.ts`
- **Página:** `src/pages/ShipsPage.tsx`
- Tamanhos: individual/pequeno/medio/grande/gigante/colossal
- Max 2 mecanismos por navio; cômodos limitados por slots do tamanho

### Companheiros 📋 Documentado, não implementado
- **Regras em:** `docs/25-companheiros.md`
- Ranks C(10g)/B(20g)/A(30g), Mascotes, Autômatos

### Itens e Equipamentos ⚙️ Parcial
- **Regras em:** `docs/28-itens.md`
- **Dados bugigangas:** `src/data/bugigangas.ts` (16 bugigangas, type BugigangaEffect = "pericia_bonus" | "interpretive")
- **Dados armas únicas:** `src/data/uniqueWeapons.ts` (26 armas)
- **UI:** `src/pages/ItemsPage.tsx` (catálogo de referência, sem ligação com personagem)
- **UI Builder:** `src/features/character/components/EquipmentSection.tsx`

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
