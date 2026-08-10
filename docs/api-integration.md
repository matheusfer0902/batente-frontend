# Integração API — BATENTE Frontend

Contrato esperado entre frontend e backend. Em **dev**, rotas não listadas em
`NEXT_PUBLIC_REAL_API_PREFIXES` passam pelo mock in-memory (`mockBaseQuery`).

## Cutover gradual

| Variável | Efeito |
|---|---|
| `NEXT_PUBLIC_API_URL` | Origem do backend (default `http://localhost:3000`) |
| `NEXT_PUBLIC_REAL_API_PREFIXES` | Prefixos extras no backend real, separados por vírgula |

Configuração atual — painel, totem e cadastro no backend real:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.10:3030
NEXT_PUBLIC_REAL_API_PREFIXES=/access-events,/devices,/departments,/employees,/schedules,/absences
```

`/auth` e `/users` **sempre** vão ao backend real. Ver [`auth.md`](./auth.md).

> **`/timekeeping` saiu da lista.** O backend serve só `/timekeeping/mirror`;
> `/timekeeping/pending` e `/timekeeping/adjustments`, que o `/inicio` consome,
> não existem. Com o prefixo ligado — como estava — os blocos do Início
> respondiam 404. O prefixo volta junto de `/pendencias` e `/ajustes`.

Ainda no mock: `/badges`, `/audit-logs`, `/gate`, `/settings`, `/timekeeping`.

## Enums compartilhados

Alinhar nomes exatos com o backend. Definidos em `src/types/`.

| Domínio | Arquivo | Valores |
|---|---|---|
| Acesso | `access.ts` | `GRANTED`, `DENIED` · `UNKNOWN_UID`, `CREDENTIAL_BLOCKED`, `CREDENTIAL_EXPIRED`, `EMPLOYEE_INACTIVE`, `OUTSIDE_WINDOW`, `DUPLICATE_READ`, `DEVICE_UNAUTHORIZED` · `ONLINE`, `OFFLINE`, `REMOTE` |
| Totem — rede | `device.ts` | `ONLINE`, `OFFLINE` *(derivado do heartbeat, não é coluna)* |
| Totem — cadastro | `device.ts` | `ACTIVE`, `MAINTENANCE`, `DISABLED` (`status_dispositivo`) |
| Colaborador | `employee.ts` | `ACTIVE`, `ON_LEAVE`, `TERMINATED` (`status_colaborador`) |
| Escala | `schedule.ts` | `FIXED`, `FLEXIBLE` (`tipo_escala`) |
| Crachá | `badge.ts` | `ACTIVE`, `BLOCKED`, `UNASSIGNED` |
| Ponto | `timekeeping.ts` | `ENTRY`, `EXIT` |

Três destes estavam divergentes e foram alinhados ao banco: colaborador
(`VACATION`/`INACTIVE` → `ON_LEAVE`/`TERMINATED`), escala (`ROTATING` →
`FLEXIBLE`) e a situação cadastral do totem, que não existia no frontend.

## Erros de negócio

O backend responde `{ statusCode, message, code }`. **O contrato é o `code`** —
a `message` é texto para humano e pode mudar de idioma. Use
`apiErrorCode()` de `src/lib/apiError.ts`; o mock produz o mesmo formato.

| `code` | HTTP | Origem no banco |
|---|---|---|
| `department_name_taken` · `registration_taken` · `cpf_taken` · `schedule_name_taken` · `device_name_taken` · `device_serial_taken` | 409 | `UNIQUE` |
| `in_use` | 409 | FK `ON DELETE RESTRICT` — departamento com pessoas |
| `schedule_required` | 409 | RN-5.3 · `trg_employees_escala_vigente` |
| `schedule_overlap` · `schedule_already_open` | 409 | RN-5.2 `EXCLUDE` · RN-5.1 índice parcial |
| `credential_not_reactivatable` | 409 | RN-2.5 |
| `last_admin` | 409 | RN-1.3 |
| `forbidden_by_role` | 403 | `42501` — o `GRANT` do papel não alcança |

## Autenticação

Ver [`auth.md`](./auth.md). Todas as rotas abaixo exigem sessão válida
(`401` sem cookie).

---

## Painel (Bloco 2) — implementado

### `GET /devices/primary`

Totem principal do monitor/início.

**Resposta 200:**

```json
{
  "id": "device-1",
  "name": "Totem 01",
  "location": "Portaria principal",
  "status": "ONLINE",
  "lastContactAt": "2026-08-06T13:04:02.118Z",
  "clockDriftMs": 18,
  "pendingUploads": 0
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `status` | `ONLINE` \| `OFFLINE` | OFFLINE = painel não recebe batimentos |
| `pendingUploads` | number | Fila offline ESP32 — registros ainda não enviados |
| `clockDriftMs` | number \| null | null quando offline |

### `GET /access-events?limit=N`

Feed de acessos (monitor, início, histórico).

**Resposta 200:** `AccessEvent[]` — ver tipo em `src/types/access.ts`.

Campos críticos para hardware:

- `occurredAt` — relógio do totem (com ms)
- `receivedAt` — chegada no servidor
- `mode` — `ONLINE` \| `OFFLINE`
- `syncedAt` — preenchido quando leitura offline subiu depois
- `decision` — `GRANTED` \| `DENIED`
- `denialReason` — null se concedido
- `doorOpenMs` — tempo da trava; null se negado

### `GET /access-events/stats`

**Resposta 200:**

```json
{ "total": 42, "granted": 38, "denied": 3, "offline": 1 }
```

### `GET /access-events/:id`

Detalhe imutável. **404** se não existir. Sem POST/PUT/DELETE.

### `GET /timekeeping/mirror?month=&q=`

Espelho de ponto (lista por colaborador/mês). **Implementado no backend.**

**Resposta 200:** `TimesheetMirrorListItem[]` — ver `src/types/timekeeping.ts`.

### `GET /absences?status=&q=`

Lista ausências aprovadas. **Implementado no backend.**

**Resposta 200:** `AbsenceListItem[]` — ver `src/types/absence.ts`.

### `GET /absences/:id`

Detalhe de uma ausência.

---

## Ponto (legado mock — pending/adjustments)

### `GET /timekeeping/pending`

Resumo pendências (início). **503** em cenário degradado.

### `GET /timekeeping/adjustments`

Resumo ajustes (início). **503** em cenário degradado.

Query `?scenario=` (dev/mock): `degradado`, `offline`, `sem-movimento` — backend real ignora.

---

## Totem / Dispositivos (Bloco 9)

### `GET /devices`

Lista de totems (ADMIN).

**Resposta 200:** `DeviceListItem[]`

```json
[{
  "id": "device-1",
  "name": "Totem 01",
  "location": "Portaria principal",
  "status": "ONLINE",
  "lastContactAt": "...",
  "clockDriftMs": 18,
  "pendingUploads": 0,
  "firmwareVersion": "v2.4.1",
  "serialNumber": "BT-0001-0042"
}]
```

### `GET /devices/:id`

Detalhe + telemetria + últimos eventos do dispositivo.

### `POST /devices`

Cadastro. **Resposta 201** inclui `secretKey` **uma única vez**:

```json
{
  "device": { "id": "...", "name": "Totem 02", ... },
  "secretKey": "bt_sk_..."
}
```

### `POST /devices/:id/rotate-key`

Rotaciona chave. Mesmo contrato de `secretKey` único.

### ESP32 — fila offline

O totem decide localmente quando offline e enfileira eventos. O painel lê
`pendingUploads` no device e `mode`/`syncedAt` nos access-events.

Fluxo esperado no backend:

1. Totem offline → grava localmente, incrementa fila
2. Reconexão → POST batch de eventos (endpoint firmware, fora deste frontend)
3. `pendingUploads` → 0 após sync
4. Eventos aparecem com `mode: OFFLINE` e `syncedAt` preenchido

---

## Pessoas (Bloco 3)

### `GET /departments`

**Resposta 200:**

```json
[{ "id": "dept-1", "name": "Operações", "employeeCount": 62 }]
```

### `POST /departments` · `PUT /departments/:id` · `DELETE /departments/:id`

- DELETE retorna **409** com `{ "code": "department_has_employees", "details": { "count": 62 } }` se houver pessoas

### `GET /employees?status=&departmentId=&q=`

Lista colaboradores.

**Resposta 200:**

```json
[{
  "id": "employee-1",
  "name": "Ana Carolina Souza",
  "registration": "20220023770",
  "department": { "id": "dept-1", "name": "Operações" },
  "badgeCode": "04A2B3C4",
  "scheduleName": "Administrativo 44h",
  "status": "ACTIVE",
  "flags": { "missingBadge": false, "missingSchedule": false }
}]
```

### `GET /employees/summary`

Contadores para alertas da listagem:

```json
{
  "total": 184,
  "active": 176,
  "missingBadge": 4,
  "missingSchedule": 2
}
```

### `GET /employees/:id` · POST · PUT

Ficha com abas (detalhe futuro).

---

## Crachás (Bloco 4)

### `GET /badges` · `GET /badges/:id` · POST · PUT

```json
{
  "id": "badge-1",
  "code": "04A2B3C4",
  "status": "ACTIVE",
  "employee": { "id": "...", "name": "..." } 
}
```

---

## Escalas (Bloco 5)

### `GET /schedules` · CRUD em `/schedules/:id`

---

## Sistema (Bloco 11)

### `GET /users` · `GET /users/:id`

Lista usuários do painel (ADMIN). `POST /users` já existe — ver `auth.md`.

### `GET /settings` · `PUT /settings`

Configurações globais (ADMIN).

---

## Histórico e auditoria (Bloco 10)

### `GET /access-events` (com filtros)

Histórico: `?from=&to=&decision=&q=&page=`

### `GET /audit-logs` · `GET /audit-logs/:id`

Somente ADMIN.

---

## Portaria (Bloco 12)

### `GET /gate/queue`

Fila atual para OPERADOR.

### `POST /gate/release`

Liberação manual com motivo obrigatório:

```json
{ "employeeId": "...", "reason": "Visitante autorizado pela gerência" }
```

### `GET /gate/credentials`

Credenciais que o porteiro pode bloquear.

---

## Códigos de erro

Padrão `ApiError` (`src/types/api.ts`):

```json
{
  "message": "Human readable",
  "code": "stable_code",
  "details": {}
}
```

| HTTP | Quando |
|---|---|
| 401 | Sem sessão |
| 403 | Papel insuficiente |
| 404 | Recurso inexistente |
| 409 | Conflito de negócio |
| 503 | Degradado / indisponível |

---

## Referências

- Molde de módulo: [`feature-module-guide.md`](./feature-module-guide.md)
- Painel mock: [`panel.md`](./panel.md)
- Testes MSW: `test/mocks/handlers/`
