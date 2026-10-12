# 8. Import / Export

## Formato JSON de Exportação

```json
{
  "_version": "1.0",
  "_exportedAt": "2025-01-01T00:00:00.000Z",
  "_system": "bnw-character-system",
  "character": { /* objeto Character completo */ }
}
```

| Campo | Propósito |
|-------|-----------|
| `_version` | Versionamento do schema para migrações futuras |
| `_exportedAt` | Timestamp ISO-8601 para rastreio |
| `_system` | Identificador do sistema — importador rejeita arquivos de outros sistemas |
| `character` | Objeto `Character` completo e tipado |

---

## Pipeline de Importação

```
1. Leitura do arquivo .json ou clipboard
2. Parse JSON — erros de sintaxe capturados e reportados
3. Detecção de envelope de sistema vs objeto direto
4. migrateCharacter() — preenche campos ausentes com defaults
5. validateCharacterFull() — valida todas as regras
6. Retorna ImportResult com status, parseErrors e ValidationReport
```

O usuário pode optar por **"Importar mesmo assim"** mesmo com erros de validação — útil para fichas parcialmente configuradas que serão completadas no editor.

---

## ImportResult

```ts
interface ImportResult {
  status: "success" | "success_with_warnings" | "error";
  character: Character | null;
  parseErrors: string[];          // erros de leitura/schema
  validation: ValidationReport | null;
}
```

---

## migrateCharacter — Compatibilidade com Versões Anteriores

```ts
function migrateCharacter(raw: Record<string, unknown>): Character {
  return {
    id:          raw.id ?? crypto.randomUUID(),
    name:        raw.name ?? "Personagem Importado",
    level:       Number(raw.level) || 1,
    // ... todos os campos com defaults seguros
  };
}
```

Esta função garante que fichas exportadas em versões anteriores (com campos ausentes) continuem funcionando após atualizações do schema. Ao adicionar um novo campo ao tipo `Character`, adicione o default correspondente aqui.

---

## Ficha para Fórum — exportToForumHTML

`exportToForumHTML(char)` gera a ficha no formato `[dohtml]` usado pelo fórum (seções 1–8:
informações gerais, atributos, perícias, técnicas, caminhos, equipamentos, social e histórico).
Cada seção é montada por um `render*()` próprio no `exporter.ts`.

O formato é um **contrato**: `parseImportForumHTML(text)` lê essa mesma ficha de volta (os mapas
de rótulo → id do importer são derivados dos mesmos labels do export). Os snapshots em
`features/character/utils/__tests__/__snapshots__` fixam o texto gerado; mudar uma string exige
atualizar o importer e o snapshot de forma intencional.

Campos narrativos (aparência, história…) saem como `[PREENCHER]` e não são importados.

---

## Fontes de Importação

| Método | Função | Notas |
|--------|--------|-------|
| Upload de arquivo | `importFromFile(file: File)` | `.json` ou `.txt` (ficha do fórum), até 512 KB |
| Área de transferência | `importFromClipboard()` | Requer permissão do browser |
| String direta | `parseImportJSON(raw)` / `parseImportForumHTML(text)` | Para uso programático |

---

## Exportação Disponível

| Formato | Função | Uso |
|---------|--------|-----|
| Arquivo JSON | `downloadCharacterJSON(char)` | Backup, importação futura |
| String JSON | `exportToJSONString(char)` | Copiar para clipboard |
| Ficha do fórum (arquivo) | `downloadCharacterForumHTML(char)` | Postar no fórum |
| Ficha do fórum (texto) | `exportToForumHTML(char)` | Copiar e colar no post |

---

[← Validação](./07-validacao.md) | [Componentes →](./09-componentes.md)
