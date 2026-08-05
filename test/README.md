# Testes — guia rápido

Documentação completa: [`docs/testing.md`](../docs/testing.md)

## Rodar

```bash
npm run test              # unit + component (gate de PR)
npm run test:watch        # watch mode
npm run test:hook         # hooks + MSW
npm run test:int          # integração de página
npm run test:contract     # contrato + LSP baseQuery
npm run test:e2e:real     # login contra a API real (:3030 + Postgres no ar)
npm run test:all          # suíte completa
```

## Estrutura

```
src/**/*.test.ts(x)     # colado ao código
test/
├── setup/              # vitest.setup, MSW, matchers
├── mocks/              # handlers, db, scenarios
├── helpers/            # renderWithProviders, authState, clock
├── integration/
├── contracts/
└── e2e/                # Playwright (.spec.ts)
```

## Escrever teste

```typescript
// Component / integration
import { renderWithProviders } from '../helpers/render';
import { authState } from '../helpers/auth';

renderWithProviders(<MyComponent />, {
  preloadedState: authState('RH'),
});

// Sobrescrever MSW num teste
import { http, HttpResponse } from 'msw';
import { server } from '../setup/msw.server';
import { API_BASE_URL } from '@/redux/reducers/queries/fetchBaseQuery';

server.use(
  http.get(`${API_BASE_URL}/resources`, () => HttpResponse.json([])),
);
```

## Cenários MSW

```typescript
import { scenarios } from '../mocks/scenarios';

scenarios.contaBloqueada({ email: 'x@y.com', unlockAt: '…' });
scenarios.servidorIndisponivel();
// reset automático no afterEach
```

## Matchers

| Matcher | Uso |
|---|---|
| `toHaveNoA11yViolations` | axe |
| `toContainNoLaborData` | RN-1.6 |
| `toContainNoPersonalData` | LGPD |

## Sessão nos testes

```typescript
// A consulta /auth/me de boot só existe se o SessionProvider estiver montado
renderWithProviders(<LoginForm />, { withSession: true });

// Abrir sessão no mock sem passar pelo login
import { setMockSession } from '../mocks/handlers/auth.handlers';
setMockSession('ADMIN');   // reset automático no afterEach
```

Para asserir navegação, sobrescreva `next/navigation` no próprio spec: o mock
global devolve um router **novo por chamada**, então o spy dele não é o que o
componente usou. Ver `src/hooks/useAuth.test.tsx`.

## Referência — módulo `resource`

| Camada | Arquivo |
|---|---|
| Unit | `ResourceService.test.ts`, `resourceSchema.test.ts` |
| Component | `Button.test.tsx`, `ResourceCard.test.tsx` |
| Hook | `useResource.test.tsx` |
| Integration | `integration/resource-list.test.tsx` |
| Contract | `contracts/api.contract.test.ts`, `basequery.substitution.test.ts` |

## Regras

- Mockar **rede** (MSW), não hooks orquestradores
- Store novo por teste
- `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- Proibido: `setTimeout` arbitrário, assertar `dispatch`, snapshot de DOM
