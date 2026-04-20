# Entrega 0.7.0 — Ships Export/Import + Tabelas AM no Fórum

**Data:** 2026-04-20
**Branch:** develop
**Versão anterior:** 0.6.5

---

## Resumo

Novo módulo de exportação e importação de fichas de embarcação (JSON e fórum HTML), com botões integrados na página Ships e nova seção na ImportPage. Também expande o exportador de personagens com tabelas completas de Akuma no Mi (Zoan, Logia, Paramecia) e exibição detalhada de bônus racial e AM por atributo/perícia.

---

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/features/ships/utils/shipExporter.ts` | Novo — exporta navio para JSON e fórum HTML dohtml |
| `src/features/ships/utils/shipImporter.ts` | Novo — importa navio de JSON ou fórum HTML com validação |
| `src/pages/ShipsPage.tsx` | Botões de exportação (JSON, clipboard JSON, Fórum) na aba Overview |
| `src/pages/ImportPage.tsx` | Nova seção de importação/exportação de embarcações |
| `src/features/character/utils/exporter.ts` | Tabelas Zoan/Logia/Paramecia; attrDisplay e bonusWithAM com bônus racial+AM separados; computePericiaExtras para perícias |
| `docs/regras/1.1 - Ficha de Personagem.txt` | Novo — ficha de regras para referência |
| `docs/regras/16.1 - Ficha Embarcação.txt` | Novo — ficha de embarcação para referência |
| `docs/regras/7.1 - Tabela Akuma no Mi - Logia.txt` | Novo — tabela Logia para referência |
| `docs/regras/7.2 - Tabela Akuma no Mi - Paramecia.txt` | Novo — tabela Paramecia para referência |
| `docs/regras/7.3 - Tabela Akuma no Mi - Zoan.txt` | Novo — tabela Zoan para referência |

---

## Detalhes

### Ships Export/Import (novo módulo)
- `shipExporter.ts`: exporta navio para JSON com metadata (`_version`, `_system`) e para fórum HTML dohtml com seções de Informações, Mecanismos Avançados, Cômodos, Tripulação e Observações, incluindo cálculo de valor total com desconto por engenheiro e mecanismos/cômodos
- `shipImporter.ts`: importa de JSON (valida `_system: "bnw-ship-system"`) ou de fórum dohtml (reverse-label maps para tamanho, propriedade, papéis de tripulação), com `ShipImportResult` retornando status, erros e warnings
- `ShipsPage.tsx`: três botões no header da Overview — `⬇ JSON` (download), `📋 JSON` (clipboard) e `📜 Fórum` (download .txt)
- `ImportPage.tsx`: `ShipImportSection` completo com drag-and-drop, importação via clipboard, painel de resultados com errors/warnings e botão de importar

### Exportador de personagens — melhorias no fórum HTML
- Tabelas completas inline para Zoan (Points, Vigor Animal, Habilidades Rank A, Despertar Rank S), Logia (Manipulação Elemental, Invulnerabilidade, Status Aprimorado, Despertar Rank S) e Paramecia (Efeito Aderido, Passivas, Ativas com ranks, Despertar Rank S)
- `attrDisplay`: mostra base + racial `[Racial: Raça]` + AM `[Bônus AM]` separados por atributo
- `bonusWithAM`: exibe bônus AM separado em arma, defensivos e técnicas
- `computePericiaExtras`: agrega bônus de raça/humano, Zoan animalClass e bugigangas (cyborg e equipamentos) em cada perícia
- Perícias na ficha mostram bonus extras inline: `02 +1 [Racial: Mink]`
- Rótulo de qualidade "Lendário" (corrigido de "Extraordinário")
- Label da seção 2 exibe custo de gemas apenas quando há custos de Energia ou Profissão

---

## Verificação

1. `npm run type-check` — zero erros ✓
2. Exportar navio na aba Ships — botões JSON e Fórum disponíveis ✓
3. Importar JSON de navio na ImportPage — seção Ships visível ✓
4. Exportar ficha de personagem com Akuma no Mi Zoan/Logia/Paramecia — tabela completa no arquivo .txt ✓
