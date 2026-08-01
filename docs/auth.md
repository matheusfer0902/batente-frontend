# Autenticação e autorização

## Fluxo de login

```mermaid
sequenceDiagram
    participant User
    participant LoginForm
    participant useAuth
    participant authApi
    participant mockDb
    participant authSlice
    participant Cookie

    User->>LoginForm: submit credentials
    LoginForm->>useAuth: login(credentials)
    useAuth->>authApi: login mutation
    authApi->>mockDb: POST /auth/login
    mockDb-->>authApi: user + token
    authApi-->>useAuth: AuthResponse
    useAuth->>authSlice: setCredentials
    useAuth->>Cookie: set auth-token + auth-role
    useAuth->>User: redirect por papel (AuthService)
```

Em caso de falha, `login` **não lança**: o erro fica no RTK Query e vira
`loginFailure` (contrato `LoginFailure`) via `AuthService.parseLoginFailure`.

## Papéis e destino pós-login

| Papel | Destino | Rota |
|-------|---------|------|
| `ADMIN` | Início | `/inicio` |
| `RH` | Início | `/inicio` |
| `OPERADOR` | Portaria | `/portaria` |

Mapa único em `AuthService` (`resolveLandingRoute`). `/inicio` e `/portaria`
existem hoje como placeholders — conteúdo chega nos Blocos 2 e 3.

## Estados da tela de entrada (Bloco 1)

| Estado | Código | Origem | Tratamento na UI |
|--------|--------|--------|------------------|
| Padrão | — | — | Formulário habilitado, foco no e-mail |
| Enviando | — | `isSubmitting` | Campos travados, indicador de atividade |
| Credencial inválida | `invalid_credentials` | 401 | Aviso vermelho genérico |
| Conta bloqueada | `account_locked` | 423 | Aviso âmbar + contagem regressiva |
| Servidor sem resposta | `server_unavailable` | 503 / falha de rede | Aviso na cor de contingência + "Tentar novamente" |
| Sem permissão | — | rota `/403` | `ForbiddenView` |

Regras de segurança e conteúdo:

- Senha incorreta e e-mail inexistente produzem **a mesma resposta**, o mesmo
  contador de tentativas e a mesma latência — nada revela se a conta existe.
- O contador de tentativas restantes só aparece a partir da terceira falha
  (`LOGIN_ATTEMPTS_HINT_THRESHOLD`).
- Bloqueio após `MAX_LOGIN_ATTEMPTS` falhas seguidas, por
  `LOGIN_LOCKOUT_MINUTES` minutos (constantes em `types/auth.ts`).
- Falha de infraestrutura usa a cor de contingência (`moon`), **nunca** a cor
  de negação (`cherry`).
- O 403 não informa qual papel seria necessário.

## Camadas de proteção

| Camada | Arquivo | Função |
|--------|---------|--------|
| Edge | `middleware.ts` | Redireciona sem cookie `auth-token`; leva sessão ativa ao destino do papel |
| Layout | `ProtectedRoute.tsx` | Guard client-side no `(dashboard)` |
| Hidratação | `AuthHydrator.tsx` | Restaura Redux a partir do cookie |
| Autorização | `useCanMutate` | Ownership para ações de escrita |

## Cookies

| Cookie | Constante | Uso |
|--------|-----------|-----|
| `auth-token` | `AUTH_TOKEN_COOKIE` | Sessão — base de toda a proteção |
| `auth-role` | `AUTH_ROLE_COOKIE` | Permite ao edge resolver o destino pós-login |

Ambos são setados em `useAuth.login` / `register` e removidos em `logout` e em
falha de hidratação.

## Estado Redux — `authSlice`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
}
```

Actions: `setCredentials`, `setToken`, `logout`.

## Endpoints stub — `authApi`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/auth/login` | POST | Autentica usuário |
| `/auth/register` | POST | Cria usuário |
| `/auth/me` | GET | Retorna usuário atual |
| `/auth/logout` | POST | Revoga sessão mock |

Erros de `/auth/login` seguem `ApiError` com `code` estável e `details`
(`failedAttempts`, `remainingAttempts`, `lockedAt`, `unlockAt`, `occurredAt`).
A UI decide o texto pelo `code` — nunca pela `message`.

## Credenciais demo

| Email | Senha | Papel | Destino | Recursos owned |
|-------|-------|-------|---------|----------------|
| `owner@batente.dev` | `password123` | ADMIN | `/inicio` | resource-1, resource-2 |
| `viewer@batente.dev` | `password123` | OPERADOR | `/portaria` | resource-3 |
| `rh@construtoravale.com.br` | `password123` | RH | `/inicio` | — |

Qualquer e-mail começando com `offline` (ex.: `offline@batente.dev`) simula
servidor fora do ar, sem contar tentativa.

## Autorização por ownership

Regra: **editar/excluir** só quando `resource.ownerId === user.id`.

Centralizado em:

- `canMutate(resource, user)` — função pura testável
- `useCanMutate(resource)` — hook para componentes

**Proibido** espalhar checks de permissão inline nos JSX.

## Migrar para backend real

1. Substituir `mockBaseQuery` por `fetchBaseQuery` em `baseApi.ts`
2. Implementar `prepareHeaders` para JWT
3. Tratar `401` com re-auth (limpar slice + cookie + redirect `/login`)
4. Devolver `code`/`details` nos erros de login — `AuthService.parseLoginFailure`
   já aceita `FETCH_ERROR`/`TIMEOUT_ERROR` como indisponibilidade
5. Manter mesma interface de `authApi` e `useAuth` — componentes intactos
