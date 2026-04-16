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

## Texto para Fórum — exportToForumText

Gera texto ASCII formatado pronto para postar no fórum:

```
╔════════════════════════════════════╗
║  FICHA — NOME DO PERSONAGEM        ║
╚════════════════════════════════════╝

[ INFORMAÇÕES GERAIS ]
Nome: ...
Nível: ...  |  BPN: ...  |  Energia: ...

[ ATRIBUTOS ]
Poder:        XX  (1 base + X racial + X investido)
...

[ AVISOS DE VALIDAÇÃO ]
[ERROR] Título: descrição...   ← aparece só se houver problemas
```

---

## Fontes de Importação

| Método | Função | Notas |
|--------|--------|-------|
| Upload de arquivo | `importFromFile(file: File)` | Aceita apenas `.json` |
| Área de transferência | `importFromClipboard()` | Requer permissão do browser |
| String direta | `parseImportJSON(raw: string)` | Para uso programático |

---

## Exportação Disponível

| Formato | Função | Uso |
|---------|--------|-----|
| Arquivo JSON | `downloadCharacterJSON(char)` | Backup, importação futura |
| String JSON | `exportToJSONString(char)` | Copiar para clipboard |
| Texto para fórum | `exportToForumText(char)` | Copiar e colar no post |

---

[← Validação](./07-validacao.md) | [Componentes →](./09-componentes.md)
