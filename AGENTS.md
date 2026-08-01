<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# BATENTE Frontend — Agent Rules

## Documentação obrigatória

Leia antes de codar:

- [`docs/architecture.md`](./docs/architecture.md)
- [`docs/solid-principles.md`](./docs/solid-principles.md)
- [`docs/feature-module-guide.md`](./docs/feature-module-guide.md)

Regras Cursor detalhadas: [`.cursor/rules/`](./.cursor/rules/)

## Arquitetura (resumo)

| Camada | Responsabilidade |
|--------|------------------|
| `app/` | Rotas, layouts, composição — **sem API, sem negócio** |
| `components/ui/` | Átomos Radix + cva, sem domínio |
| `components/<feature>/` | UI de domínio via hooks |
| `hooks/` | Orquestração (RTK + services + slices) |
| `redux/queries/` | **Única** fonte de server state |
| `services/` | Lógica pura testável |
| `types/` + `lib/schemas/` | Contratos e validação Zod |

## SOLID — sempre aplicar

- **S:** separar UI, hooks, services, API
- **O:** estender via injectEndpoints e services, não modificar estáveis
- **L:** contratos substituíveis (mock → HTTP)
- **I:** interfaces/hooks mínimos
- **D:** depender de abstrações — componentes nunca acessam mock/DB direto

## Proibições

- `fetch` / `useEffect` para server state fora de RTK Query
- Strings hardcoded (usar i18n)
- `any`
- Permissões inline (`useCanMutate` sempre)
- Lógica de negócio em `app/` ou `components/ui/`

## Novo feature

Seguir molde `resource` — ver `docs/feature-module-guide.md`.

## Scripts de verificação

```bash
npm run typecheck && npm run build
```
