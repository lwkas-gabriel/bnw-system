# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# BNW System — Instruções para o Claude

## Comandos

```bash
npm run dev          # servidor de desenvolvimento (Vite)
npm run build        # tsc + vite build
npm run type-check   # tsc --noEmit (sem gerar arquivos)
npm run lint         # eslint com max-warnings 0
npm run test         # vitest (watch mode)
npm run test:ui      # vitest com UI interativa
```

## Skill Files

Antes de qualquer tarefa, leia:
- `skills/bnw-overview/SKILL.md` — sempre, é o mapa do projeto

Em seguida, baseado na tarefa:
- Regra/mecânica/combate → `skills/bnw-rules/SKILL.md`
- Componente/UI/página → `skills/bnw-frontend/SKILL.md`
- Módulo novo → `skills/bnw-features/SKILL.md`
