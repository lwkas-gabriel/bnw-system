# Exportação e Importação — Formato Ficha de Fórum (dohtml)

## O que é o formato dohtml

O fórum BNW usa um sistema de postagem com tags customizadas (`[dohtml]...[/dohtml]`) que mistura HTML e BBCode. Esse é o mesmo formato do template oficial em `docs/regras/1.1 - Ficha de Personagem.txt`.

O BNW System consegue **exportar** fichas nesse formato e **importar** fichas coladas a partir dele.

---

## Exportar uma ficha para o fórum

1. Acesse **Importar / Exportar** no menu lateral.
2. Na lista de fichas salvas, clique em **📜 Ficha Fórum (dohtml)** ao lado do personagem desejado.
3. O conteúdo é copiado para a área de transferência. Cole diretamente no editor do fórum.

### Campos preenchidos automaticamente

| Campo | Fonte |
|-------|-------|
| Nome | `char.name` |
| Raça | `char.race` (traduzido para PT-BR) |
| Localização | `char.location` |
| Facção / Rank | `char.faction` |
| Prestígio | `char.faction.prestige` |
| Nível | `char.level` |
| Gemas Totais / Gastas / Atuais | calculado por `computeGemBudget()` |
| PDR / PRE / DEF / CON | base + investido + racial |
| Energia (EN) | `level × 3 + energyInvested` |
| Bônus por Nível (BPN) | `floor(level × 3 / 4)` |
| Ganhos raciais | `char.racialBonus` |
| Profissões | `char.professions[]` (10g cada) |
| Todas as 11 Perícias | `char.pericias` |
| Técnicas (por rank) | `char.techniques` agrupadas por rank |
| Akuma no Mi | nome, tipo, rank |
| Ciborgue | cada shift com localização e bônus |
| Haki | primário (com custo em gemas) + secundário (gratuito) + Rei |
| Artes Marciais | faixa atual + custo |
| Equipamentos ofensivos / defensivos | arma equipada + defesas |

### Campos com `[PREENCHER]`

Estes campos não têm fonte mecânica no sistema e precisam ser preenchidos manualmente no editor do fórum:

- Alcunha, Idade, URL da imagem
- XP (experiência)
- Berries
- Tabela de progressão da Akuma no Mi
- Bônus interpretativo das Artes Marciais
- Aparência, Personalidade, História
- Histórico de aventuras / narrações / eventos

### Seções condicionais

As seções **Técnicas** e **Caminhos** só aparecem no output se o personagem tiver esses itens. Se não tiver nenhum caminho (Akuma, Haki, Artes Marciais, Ciborgue), a seção 5 é omitida.

---

## Importar uma ficha do fórum

O parser é **best-effort via regex** — campos narrativos (aparência, personalidade, etc.) são ignorados.

### Como importar

1. Copie o conteúdo completo da ficha (incluindo `[dohtml]` no início).
2. Na página **Importar / Exportar**:
   - **Colar na área de transferência**: clique em "📋 Importar da área de transferência" — o sistema detecta automaticamente o formato dohtml.
   - **Upload de arquivo**: arraste um `.txt` contendo a ficha para o dropzone. Arquivos `.json` e `.txt` são aceitos.
3. Clique em **✓ Importar ficha** para salvar.

### Campos extraídos no import

| Campo | Extraído de |
|-------|-------------|
| Nome | `<div class="toptitle">` |
| Raça | `<e>Raça: </e>` |
| Localização | `<e>Localização: </e>` |
| Nível | `<e>Nível: </e>` |
| Gemas Totais / Gastas | `<e>Gemas Totais: </e>` / `<e>Gemais Gastas: </e>` |
| PDR / PRE / DEF / CON | totais declarados; base (1/1/1/3) é subtraída |
| Energia investida | total de EN menos `level × 3` |
| 11 Perícias | tags `<e>` de cada perícia |
| Técnicas | blocos `<e>Rank X</e>` com `[b]Nome:[/b]` e `[b]Energia:[/b]` |
| Akuma no Mi | bloco `<d>Akuma no Mi</d>` (nome, tipo, rank) |
| Haki | blocos de Armamento e Observação; primário = aquele com custo > 0 |
| Ciborgue | blocos `<d>Ciborgue</d>` (local, nome, descrição) |
| Artes Marciais | bloco `<d>Artes Marciais</d>` (faixa) |

### Limitações do import

- **Bônus raciais** não são recuperados (zerados); os atributos totais são preservados como investidos.
- **Técnicas** importadas têm tipo `offensive`, `targetAttr: power` e sem aderências — edite na aba Técnicas após importar.
- **Detalhes da Akuma no Mi** (classes, habilidades, pontos Zoan) não são recuperados — apenas nome, tipo e rank.
- **Detalhes do Ciborgue** (bugigangaId, gear, shift3Bonus) não são recuperados.
- **Campos narrativos** (alcunha, idade, aparência, personalidade, história, XP, berries) são ignorados.
- O resultado sempre tem status `success_with_warnings` para alertar sobre esses campos ausentes.

---

## Detecção automática de formato

O sistema detecta o formato pelo conteúdo:

- Começa com `[dohtml]` → parser de fórum (`parseImportForumHTML`)
- Caso contrário → parser JSON (`parseImportJSON`)

Isso funciona tanto no upload de arquivo quanto no import via clipboard.
