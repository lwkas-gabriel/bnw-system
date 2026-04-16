// ItemsPage.tsx
import { PageHeader, EmptyState } from "../shared/components";

export default function ItemsPage() {
  return (
    <div>
      <PageHeader title="Construtor de Itens" subtitle="Equipamentos, armas únicas e bugigangas" />
      <div className="px-6 py-6">
        <EmptyState
          icon="🔧"
          title="Módulo em construção"
          description="O construtor de itens está sendo implementado. Dados de armas únicas, equipamentos e bugigangas já estão catalogados."
        />
      </div>
    </div>
  );
}
