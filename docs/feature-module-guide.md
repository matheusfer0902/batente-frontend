# Guia de módulos de feature

Passo a passo para adicionar um domínio (ex.: `order`, `project`) replicando o molde `resource`.

## Visão geral

Ordem recomendada de implementação:

```mermaid
flowchart LR
    A[types] --> B[schema Zod]
    B --> C[RTK Query API]
    C --> D[Service]
    D --> E[Hook]
    E --> F[Componentes]
    F --> G[Páginas app/]
    G --> H[locales i18n]
```

## 1. Tipos — `src/types/<feature>.ts`

```typescript
export interface Order {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  title: string;
}

export interface UpdateOrderPayload {
  id: string;
  title?: string;
}
```

## 2. Schema Zod — `src/lib/schemas/<feature>Schema.ts`

```typescript
import { z } from "zod";

export const orderFormSchema = z.object({
  title: z.string().min(3).max(100),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
```

## 3. RTK Query — `src/redux/reducers/queries/<feature>Api.ts`

```typescript
import { baseApi } from "@/redux/reducers/queries/baseApi";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrderList: builder.query<Order[], void>({ … }),
    getOrderById: builder.query<Order, string>({ … }),
    createOrder: builder.mutation<Order, CreateOrderPayload>({ … }),
    updateOrder: builder.mutation<Order, UpdateOrderPayload>({ … }),
    deleteOrder: builder.mutation<{ id: string }, string>({ … }),
  }),
});

export const {
  useGetOrderListQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = orderApi;
```

Registrar side-effect import em `src/redux/store.ts`:

```typescript
import "@/redux/reducers/queries/orderApi";
```

Adicionar tag em `baseApi.ts`:

```typescript
tagTypes: ["Auth", "Resource", "Order"],
```

Estender `mockBaseQuery` com rotas `/orders` (ou preparar `fetchBaseQuery` real).

## 4. Service — `src/services/OrderService.ts`

```typescript
export class OrderService {
  static sortByUpdatedAt(orders: Order[]): Order[] { … }
  static toCardViewModel(order: Order): OrderCardViewModel { … }
}
```

Sem imports de React ou Redux.

## 5. Hook — `src/hooks/useOrder.ts`

Orquestra queries, mutations e `OrderService`. Expõe API estável aos componentes.

## 6. Componentes — `src/components/<feature>/`

Mínimo para CRUD:

| Componente | Responsabilidade |
|------------|------------------|
| `<Feature>List` | Listagem + busca |
| `<Feature>Card` | Card com ações condicionais (`useCanMutate`) |
| `<Feature>Form` | Create/update com RHF + Zod |
| `<Feature>DeleteDialog` | Confirmação + mutation delete |

## 7. Páginas — `src/app/(dashboard)/<feature>/`

```
<feature>/
├── page.tsx           # listagem
├── new/page.tsx       # create
└── [id]/
    ├── page.tsx       # detail
    └── edit/page.tsx  # update
```

Páginas apenas compõem componentes — sem lógica.

## 8. i18n — `src/locales/{pt,en}/<feature>.json`

Registrar namespace em `src/lib/i18n/settings.ts`:

```typescript
export const namespaces = ["common", "auth", "resource", "order"] as const;
```

## 9. Navegação

Adicionar item em `src/components/shared/Sidebar.tsx`.

## 10. Proteção de rotas

Estender `middleware.ts`:

```typescript
const protectedPaths = ["/resources", "/orders"];
```

## Ownership (autorização)

Reutilizar padrão de `useCanMutate` — criar helper genérico se necessário:

```typescript
export function canMutate<T extends { ownerId: string }>(
  entity: T | undefined,
  user: User | null,
) {
  return {
    canEdit: Boolean(user && entity && entity.ownerId === user.id),
    canDelete: Boolean(user && entity && entity.ownerId === user.id),
  };
}
```

## Referência completa

Use o módulo `resource` como implementação canônica:

- `src/types/resource.ts`
- `src/lib/schemas/resourceSchema.ts`
- `src/redux/reducers/queries/resourceApi.ts`
- `src/services/ResourceService.ts`
- `src/hooks/useResource.ts`
- `src/components/resource/*`
- `src/app/(dashboard)/resources/*`
