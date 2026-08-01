# Princípios SOLID — BATENTE Frontend

Como os princípios SOLID se materializam neste boilerplate. **Todo código novo deve respeitar estas regras.**

## S — Single Responsibility (Responsabilidade Única)

Cada artefato tem **uma razão para mudar**.

| Artefato | Responsabilidade única |
|----------|------------------------|
| `app/*/page.tsx` | Compor a página (roteamento) |
| `components/ui/Button` | Renderizar botão acessível com variantes |
| `components/resource/ResourceList` | UI da listagem |
| `hooks/useResource` | Orquestrar dados e ações de resource |
| `services/ResourceService` | Transformações puras de resource |
| `resourceApi.ts` | Contrato HTTP/cache de resource |
| `authSlice.ts` | Estado de sessão em memória |

**Violação comum:** componente que busca API, valida form e formata data — dividir em hook + service + componente.

```tsx
// ❌ Múltiplas responsabilidades
function ResourceList() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch(…).then(setData); }, []);
  const sorted = data.sort(…);
  return <ul>{sorted.map(…)}</ul>;
}

// ✅ Responsabilidades separadas
function ResourceList() {
  const { sortedResources } = useResource();
  return (…);
}
```

## O — Open/Closed (Aberto/Fechado)

Aberto para **extensão**, fechado para **modificação** desnecessária.

### RTK Query — injeção de endpoints

Novas features **estendem** `baseApi` sem alterar APIs existentes:

```typescript
// Nova feature — não modifica resourceApi
export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({ … }),
});
```

### Componentes UI — variantes via `cva`

Estender aparência via `variant`/`size`, não forkando componentes:

```typescript
<Button variant="destructive" size="sm" />
```

### Services — métodos estáticos adicionáveis

Adicionar `toSelectOptions()` em `ResourceService` sem mudar `sortByUpdatedAt`.

## L — Liskov Substitution (Substituição de Liskov)

Contratos devem ser **substituíveis** sem quebrar consumidores.

### Mock → API real (Plano B)

`mockBaseQuery` e `createFetchBaseQuery()` implementam o mesmo contrato `BaseQueryFn<MockRequestArgs, unknown, ApiError>` via [`createBaseApi`](../src/redux/reducers/queries/createBaseApi.ts):

- **Dev:** `mockBaseQuery` — handlers in-memory, sem HTTP
- **Vitest:** `fetchBaseQuery` + MSW — caminho HTTP real, JWT via `prepareHeaders`
- **Prova LSP:** `test/contracts/basequery.substitution.test.ts` (H1)

Trocar implementação não exige mudar hooks/componentes — apenas a origem dos dados muda.

### Tipos compartilhados

`Resource` em `types/resource.ts` é o contrato para API, service, hooks e componentes. ViewModels (`ResourceCardViewModel`) estendem/adaptam sem quebrar o tipo base.

## I — Interface Segregation (Segregação de Interface)

Preferir **interfaces pequenas e focadas** — consumidores não dependem do que não usam.

```typescript
// ✅ Hook expõe só o necessário por contexto
function useResource(options?: { id?: string }) {
  return {
    sortedResources,  // listagem
    resource,         // detalhe (quando id presente)
    create, update, remove,
  };
}

// ✅ useCanMutate — interface mínima para permissões
return { canEdit, canDelete };
```

Evitar `RootState` ou objetos gigantes passados a componentes folha — passar props/view models específicos.

## D — Dependency Inversion (Inversão de Dependência)

Módulos de alto nível **não dependem** de detalhes de baixo nível — ambos dependem de **abstrações**.

### Hierarquia de dependência (permitida)

```
app → components → hooks → redux/services/types
components/ui → lib/utils apenas
services → types apenas (sem redux, sem react)
redux/queries → baseApi, types, mock
```

### Proibido (dependência invertida errada)

```
services → components   ❌
services → redux        ❌
types → hooks           ❌
ui/Button → resourceApi ❌
```

### Injeção na prática

- **Hooks** invertem dependência: componentes dependem de `useResource()`, não de `mockDb` ou `fetch`
- **RTK Query** abstrai origem dos dados (mock vs HTTP)
- **Services** abstraem transformação; hooks chamam service, não lógica inline

```typescript
// Componente depende de abstração (hook)
const { create } = useResource();

// Hook depende de abstrações (RTK + Service)
const [createResource] = useCreateResourceMutation();
await createResource(payload);
ResourceService.sortByUpdatedAt(data);
```

## DRY vs duplicação aceitável

- **DRY:** `cn()`, helpers de formatação em services, tags RTK Query centralizadas
- **Duplicação aceitável:** props específicas por componente quando abstrair cria acoplamento prematuro

## Testabilidade (consequência de SOLID)

Documentação completa: [testing.md](./testing.md).

| Camada | Como testar | Onde |
|--------|-------------|------|
| `services/` | Vitest puro — sem render | `src/**/*.test.ts` |
| `lib/schemas/` | Vitest + `expectTypeOf` | `src/**/*.test.ts` |
| `hooks/` | `renderHook` + store real + MSW | `src/hooks/**/*.test.tsx` |
| `components/ui/` | RTL + axe | `src/**/*.test.tsx` |
| `components/<feature>/` | `renderWithProviders` + MSW — **sem mock de hook** | `src/**/*.test.tsx` |
| Integração | Página completa, MSW | `test/integration/` |
| Contrato | MSW × Zod; LSP baseQuery | `test/contracts/` |
| E2E | Playwright, build de produção | `test/e2e/*.spec.ts` |

**Regra central:** mockar a **rede** (MSW), nunca hooks orquestradores. Priorize testes em `services/` e regras de negócio pura — maior ROI.

Referência canônica: módulo `resource` (Fase 0 ✅).
