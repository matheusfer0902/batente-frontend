# BATENTE Frontend

Boilerplate frontend com Next.js 16, Clean Architecture, Redux Toolkit + RTK Query, i18n e tokens visuais BATENTE.

## Stack

- Next.js 16 (App Router) + TypeScript strict
- Tailwind CSS v4 + Shadcn/UI pattern (Radix + cva)
- Redux Toolkit + RTK Query (mock in-memory)
- i18next (pt/en) + next-themes
- React Hook Form + Zod

## Começar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

**Credenciais demo** (senha `password123` para todas):

| Email | Papel | Destino após login |
|-------|-------|--------------------|
| `owner@batente.dev` | ADMIN | `/inicio` |
| `rh@construtoravale.com.br` | RH | `/inicio` |
| `viewer@batente.dev` | OPERADOR | `/portaria` |

Para ver os estados de erro da tela de entrada: senha errada repetida bloqueia
a conta após 5 falhas; qualquer e-mail começando com `offline` simula servidor
fora do ar. Detalhes em [`docs/auth.md`](./docs/auth.md).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run typecheck` | Verificação TypeScript |
| `npm run lint` | ESLint |

## Documentação

Documentação completa em [`docs/`](./docs/):

- [Arquitetura](./docs/architecture.md)
- [SOLID](./docs/solid-principles.md)
- [Guia de features](./docs/feature-module-guide.md)
- [Auth](./docs/auth.md)

Regras para agentes de IA: [`.cursor/rules/`](./.cursor/rules/), [`CLAUDE.md`](./CLAUDE.md), [`AGENTS.md`](./AGENTS.md).

## Estrutura

```
src/
├── app/           # Rotas (auth + dashboard)
├── components/    # UI, auth, resource, shared
├── redux/         # Store, slices, RTK Query APIs
├── services/      # Lógica pura (AuthService, ResourceService)
├── hooks/         # useAuth, useResource, useCanMutate, useCountdown
├── contexts/      # SearchContext
├── types/         # Contratos TypeScript
├── lib/           # utils, i18n, schemas, mock
└── locales/       # Traduções pt/en
```

## Novo módulo de feature

Replique o padrão do módulo `resource`:

1. Tipos em `src/types/<feature>.ts`
2. Schema Zod em `src/lib/schemas/<feature>Schema.ts`
3. API RTK Query em `src/redux/reducers/queries/<feature>Api.ts`
4. Service em `src/services/<Feature>Service.ts`
5. Hook orquestrador em `src/hooks/use<Feature>.ts`
6. Componentes em `src/components/<feature>/`
7. Páginas em `src/app/(dashboard)/<feature>/`
