# 1. Visão Geral do Projeto

## Objetivos

- **Eliminar erros manuais de cálculo** — BPN, energia, custos de gemas e bônus de caminhos são calculados automaticamente.
- **Validar regras no momento da criação** — feedback em tempo real antes de postar a ficha no fórum.
- **Simular combates com fidelidade** — fórmulas 3d6 corretas, JxJ, protagonismo, CON temporária, Retém 1 CON.
- **Portabilidade de fichas** — exportar JSON para backup, importar com validação, gerar texto formatado para o fórum.
- **Arquitetura extensível** — módulos de Profissões, Perícias e Embarcações são *coming soon* sem quebrar o que existe.

---

## Escopo Atual (v1.0)

| Módulo | Status | Descrição |
|--------|--------|-----------|
| Character Builder | ✅ | Criação completa de fichas com todos os caminhos |
| Calculadora de Combate | ✅ | Simulação com 3d6 real ou média, log narrável |
| Importar / Exportar | ✅ | JSON tipado + texto para fórum + validação |
| Validação de Fichas | ✅ | 9 categorias de regras, sugestões de correção |
| Construtor de Itens | ⚙️ | Dados catalogados, UI pendente |
| Embarcações | 🔜 | Aguardando arquivo de regras |
| Profissões | 🔜 | Aguardando arquivo de regras |
| Perícias | 🔜 | Aguardando arquivo de regras |

---

## Estrutura de Arquivos Raiz

```
bnw-system/
├── docs/               ← Esta documentação
├── src/
│   ├── data/           ← Constantes do sistema (imutáveis)
│   ├── features/       ← Módulos por domínio
│   ├── pages/          ← Orquestradores de página
│   ├── router/         ← Rotas com lazy loading
│   └── shared/         ← Componentes e tipos reutilizáveis
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

[← Índice](./README.md) | [Stack Técnica →](./02-stack.md)
