# BNW System — Documentação Técnica

> Character Builder · Calculadora de Combate · Import/Export · Validação  
> **v1.0** — RPG de Fórum One Piece (BNW)

---

## Sumário

1. [Visão Geral](./01-visao-geral.md)
2. [Stack Técnica](./02-stack.md)
3. [Arquitetura](./03-arquitetura.md)
4. [Sistema de Regras Implementado](./04-regras.md)
5. [Character Builder](./05-character-builder.md)
6. [Calculadora de Combate](./06-calculadora-combate.md)
7. [Sistema de Validação](./07-validacao.md)
8. [Import / Export](./08-import-export.md)
9. [Componentes Compartilhados](./09-componentes.md)
10. [Módulos Coming Soon](./10-coming-soon.md)
11. [Princípios de Desenvolvimento](./11-principios.md)
12. [Glossário](./12-glossario.md)

---

## Setup Rápido

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run test      # testes da engine de combate
npm run type-check # verificação de tipos sem build
```

---

## Problema Central

Fichas criadas manualmente em fórum têm alta incidência de erros de cálculo, distribuição incorreta de gemas e violação de pré-requisitos de localização. O BNW System resolve isso com **validação em tempo real** e **cálculo automático** de todos os derived stats.

---

## Status dos Módulos

| Módulo | Status | Descrição |
|--------|--------|-----------|
| Character Builder | ✅ Disponível | Criação completa de fichas com todos os caminhos |
| Calculadora de Combate | ✅ Disponível | Simulação com 3d6 real ou média, log narrável |
| Importar / Exportar | ✅ Disponível | JSON tipado + texto para fórum + validação |
| Validação de Fichas | ✅ Disponível | 9 categorias de regras, sugestões de correção |
| Construtor de Itens | ⚙️ Parcial | Dados catalogados, UI pendente |
| Embarcações | 🔜 Coming soon | Aguardando arquivo de regras |
| Profissões | 🔜 Coming soon | Aguardando arquivo de regras |
| Perícias | 🔜 Coming soon | Aguardando arquivo de regras |
