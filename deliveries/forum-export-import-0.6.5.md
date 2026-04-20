# Entrega 0.6.5 — Export/Import formato Ficha de Fórum (dohtml)

## Data
2026-04-19

## Resumo
Substituição do antigo `exportToForumText` pelo `exportToForumHTML`, que gera o formato dohtml
exato do template oficial de ficha de fórum BNW. Adição de parser best-effort para importar
fichas a partir desse mesmo formato.

## Mudanças

### exporter.ts
- Removido `exportToForumText` (formato ASCII antigo)
- Adicionado `exportToForumHTML(char)` — gera o template dohtml completo com seções condicionais

### importer.ts
- Adicionado `parseImportForumHTML(text)` — parser regex best-effort para o formato dohtml
- Adicionado `parseImportAuto(text)` — detecta automaticamente JSON ou dohtml
- `importFromFile`: aceita `.txt` além de `.json`
- `importFromClipboard`: usa auto-detect

### ImportPage.tsx
- Dropzone: `accept=".json,.txt"` e texto atualizado
- Botão renomeado: "📜 Ficha Fórum (dohtml)"
- onClick chama `exportToForumHTML` (antes `exportToForumText`)

### docs/ficha-forum-export.md (NOVO)
- Documentação completa: campos auto-preenchidos, campos [PREENCHER], como exportar, como importar, limitações do parser

## Campos auto-preenchidos na exportação
PDR/PRE/DEF/CON, Energia, BPN, Ganhos Raciais, Profissões, 11 Perícias,
Técnicas por Rank, Akuma no Mi (nome/tipo/rank), Ciborgue (shifts),
Haki (primário+secundário+Rei), Artes Marciais (faixa), Equipamentos.

## Campos [PREENCHER] no export
Alcunha, Idade, URL da imagem, XP, Berries, tabela Akuma, bônus AM,
Aparência, Personalidade, História, Histórico de aventuras.

## Limitações do import
- Bônus raciais zerados (atributos totais preservados como investidos)
- Técnicas importadas com defaults (tipo: offensive, targetAttr: power)
- Detalhes de Akuma/Ciborgue não recuperados além de nome/tipo/rank
- Sempre retorna status success_with_warnings
