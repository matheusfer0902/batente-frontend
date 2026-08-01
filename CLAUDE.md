# CLAUDE.md — BATENTE Frontend

Instruções obrigatórias para Claude Code neste repositório.

## Documentação

Antes de implementar qualquer código, leia:

1. [`docs/architecture.md`](./docs/architecture.md) — arquitetura e camadas
2. [`docs/solid-principles.md`](./docs/solid-principles.md) — SOLID aplicado
3. [`docs/feature-module-guide.md`](./docs/feature-module-guide.md) — molde para novas features
4. [`docs/testing.md`](./docs/testing.md) — arquitetura de testes (Vitest, MSW, Playwright)

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · Radix/Shadcn · Redux Toolkit + RTK Query · i18next · next-themes · RHF + Zod · **Vitest · MSW · Playwright · axe-core**

## Regras invioláveis

### Arquitetura

- `app/` = roteamento e composição apenas — **sem fetch, sem useEffect para API**
- Server state = **RTK Query exclusivamente** (`redux/reducers/queries/`)
- Lógica pura = `services/` (sem React, sem Redux)
- Orquestração = `hooks/` (componentes consomem hooks, não RTK direto)
- Permissões = `useCanMutate` / `canMutate()` — não espalhar checks inline
- Textos = i18n (`t()`) — nada hardcoded na UI
- UI atômica = `components/ui/` sem domínio; classes via `cn()`

### Testes

- **Plano B:** `mockBaseQuery` em dev; testes usam `fetchBaseQuery` + MSW
- Mockar **rede** (MSW), nunca hooks orquestradores (`useResource`, `useAuth`)
- Colocation: `src/**/*.test.ts(x)` para unit/component/hook; `test/` para infra
- `renderWithProviders` + store novo por teste
- Referência canônica: módulo `resource` — ver [`docs/testing.md`](./docs/testing.md)

### SOLID (obrigatório)

| Princípio | Regra |
|-----------|-------|
| **S** Single Responsibility | Um artefato, uma razão para mudar |
| **O** Open/Closed | Estender via injectEndpoints, cva, novos services |
| **L** Liskov | Contratos substituíveis (mock ↔ fetch+MSW) — provado em H1 |
| **I** Interface Segregation | Hooks/props mínimos e focados |
| **D** Dependency Inversion | Componentes → hooks → abstrações; nunca inverter |

### Dependências permitidas

```
app → components → hooks → redux / services / types
components/ui → lib/utils
services → types
```

### Proibido

- `any` no TypeScript
- Duplicar server state em Redux slices
- `services/` importando React ou Redux
- `components/ui/` importando domínio
- Modificar arquitetura ou testes sem atualizar `docs/`
- Mockar hooks orquestradores em testes de integração
- Assertar `dispatch` ou estado interno RTK em testes

## Novo módulo de feature

Replicar molde `resource`: types → schema → *Api → *Service → use* → components → pages → locales → **testes** (passo 11).

## Verificação antes de concluir

```bash
npm run typecheck
npm run build
npm run test              # unit + component (mínimo)
# npm run test:all        # suíte completa (CI)
```

## Next.js 16

<!-- BEGIN:nextjs-agent-rules -->
Este projeto usa Next.js 16 com breaking changes. Consulte `node_modules/next/dist/docs/` antes de usar APIs deprecadas.
<!-- END:nextjs-agent-rules -->

@AGENTS.md
