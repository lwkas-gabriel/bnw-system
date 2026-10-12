# BNW System — Documentação Técnica

> Character Builder · Calculadora de Combate · Import/Export · Validação  
> **v0.7.x (Alpha)** — RPG de Fórum One Piece (BNW)

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
13. [Progressão de Nível e Gemas](./13-progressao.md)
14. [Sistema de Perícias](./14-pericias.md)
15. [Raças](./15-racas.md)
16. [Haki](./16-haki.md)
17. [Akuma no Mi](./17-akuma.md)
18. [Artes Marciais](./18-artes-marciais.md)
19. [Técnicas e Efeitos Aderidos](./19-tecnicas.md)
20. [Armas Únicas](./20-armas-unicas.md)
21. [Ciborgue](./21-ciborgue.md)
22. [Facções e Prisão](./22-faccoes.md)
23. [Gemas](./23-gemas.md)
24. [Profissões](./24-profissoes.md)
25. [Companheiros](./25-companheiros.md)
26. [Navegação](./26-navegacao.md)
27. [Embarcações](./27-embarcacoes.md)
28. [Itens, Equipamentos e Mercado](./28-itens.md)

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
| Importar / Exportar | ✅ Disponível | JSON tipado + ficha dohtml do fórum (ida e volta) + validação |
| Validação de Fichas | ✅ Disponível | 12 categorias de regras, sugestões de correção |
| Construtor de Itens | ✅ Disponível | Catálogo de bugigangas + equipamentos no builder |
| Embarcações | ✅ Disponível | Rota /ships — mecanismos, cômodos, Klabautermann |
| Profissões | ✅ Disponível | Rota /professions — 7 profissões, craft, perícias vinculadas |
| Perícias | ✅ Disponível | Rota /pericias — 11 perícias, DCs, pontos por nível |
| Companheiros | ✅ Disponível | Aba Companheiros no builder (Ranks C/B/A, mascotes, autômatos) |
| Navegação | 📋 Regras documentadas | Implementação pendente — ver docs/26 |
