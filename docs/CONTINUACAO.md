# Ponto de retomada — frontend · 06/08/2026

Estado do `batente-frontend` e o que falta. O documento principal, com a
divisão de trabalho e as decisões de banco, está em
`batente-backend/docs/CONTINUACAO.md` — leia aquele primeiro.

---

## ⚠️ Nada commitado

49 modificados, 6 removidos, 22 novos. Revise e faça commit antes de qualquer
outra coisa.

---

## 1. Telas que passaram a escrever

Até aqui **nenhuma tela escrevia** — eram listas somente-leitura sobre o mock
in-memory. Agora:

| Rota | O que faz | Bloco do design |
|---|---|---|
| `/departamentos` | Lista, cria, renomeia, exclui (só vazio) | Tela 15 |
| `/colaboradores` | Lista com KPIs clicáveis e paginação | Tela 6 |
| `/colaboradores/novo` | Cadastro com escala obrigatória | Tela 7 |
| `/colaboradores/[id]/editar` | Edição sem escala nem admissão | Tela 3c |
| `/escalas` | Lista em cartão, com resumo dos dias | Tela 19 |
| `/escalas/nova` · `/escalas/[id]/editar` | Grade dos sete dias, carga recalculada ao digitar | Telas 20 e 5c |
| `/escalas/[id]` | Detalhe | Tela 21 |
| `/dispositivos` | Lista com telemetria | Tela 37 |
| `/dispositivos/novo` | Cadastro + chave exibida uma vez | Tela 38 |
| `/dispositivos/[id]` | Aba Dados, rotação de chave, modo manutenção | Tela 39 |

---

## 2. O que mudou na base

### Cutover ligado

`.env` e `.env.example`:

```env
NEXT_PUBLIC_REAL_API_PREFIXES="/access-events,/devices,/departments,/employees,/schedules,/absences"
```

Seguem no mock: `/badges`, `/audit-logs`, `/gate`, `/settings` e
`/timekeeping`.

**`/timekeeping` está fora de propósito.** O backend serve só
`/timekeeping/mirror`; `/timekeeping/pending` e `/timekeeping/adjustments`, que
o `/inicio` consome, não existem — com o prefixo ligado, os blocos do Início
davam 404. Devolver o prefixo é tarefa de quem entregar `/pendencias` e
`/ajustes`.

### Três enums estavam divergentes do banco

Mesma classe de problema da §8.2 de ARQUITETURA-MODULOS. Corrigidos:

| Onde | Era | É |
|---|---|---|
| `types/employee.ts` | `VACATION`, `INACTIVE` | `ON_LEAVE`, `TERMINATED` |
| `types/schedule.ts` | `ROTATING` | `FLEXIBLE` |
| `types/device.ts` | *(não existia)* | `lifecycle`: `ACTIVE`/`MAINTENANCE`/`DISABLED` |

O rótulo em português vive no i18n; o valor é sempre o do banco.

### Erro de negócio tem código estável

`lib/apiError.ts` → `apiErrorCode(causa)`. **Compare o `code`, nunca a
`message`** — ela é texto para humano e muda de idioma. O mock produz o mesmo
formato, então a tela não distingue mock de backend real. Tabela completa em
[api-integration.md](./api-integration.md).

### `useCanMutate` decide por papel

Decidia por `resource.ownerId === user.id`, herança do template — ninguém é
"dono" de um departamento. O mapa está em `PermissionService.MUTABLE_RESOURCES`
e espelha a coluna "Papel banco" da §2 de ARQUITETURA-MODULOS.

É palpite otimista da interface: a recusa que vale é o `GRANT` do PostgreSQL,
então formulário ainda precisa tratar 403.

### Primitivos novos

`ui/select.tsx` e `ui/checkbox.tsx`, sobre elementos nativos — sem dependência
nova, navegáveis por teclado e, no celular, abrindo o seletor do sistema.

---

## 3. O que falta

### Testes — a maior dívida

As telas novas não têm teste de componente nem integração com MSW dos
formulários. O que existe hoje (88 testes) cobre auth, o painel e a infra.

Mínimo por tela, conforme `docs/testing.md`: os cinco estados de `panel.md` e um
teste de integração do formulário com MSW — mockando **rede**, nunca o hook
orquestrador.

### Telas ainda no mock

`/crachas`, `/usuarios`, `/configuracoes`, `/auditoria`, `/portaria` e
`/ausencias` (esta com backend real parcial, só leitura). Continuam funcionando
em demo; o que falta é o backend de cada uma.

### Fora de escopo por decisão

- **Ficha do colaborador, telas 8–10** — cabeçalho fixo com 6 abas; quatro
  reaproveitam telas que ainda não existem. A lista aponta direto para
  `/colaboradores/[id]/editar`
- **Telas 40–42 do totem** — telemetria, diff da lista de crachás e
  sincronizações. Dependem da fila offline do firmware

### Detalhe conhecido

`ui/input.tsx` e `redux/storeProvider.tsx` têm 3 erros de lint pré-existentes
(interface vazia, `refs` durante render). Não foram tocados nesta rodada.

---

## 4. Verificação ao retomar

```bash
npm run typecheck        # deve dar 0
npm run test             # 69 unit + component
npm run test:all         # arch, i18n, contract, integration, e2e
npm run build
npm run dev -- -p 3001   # backend em :3030
```

Se o `typecheck` acusar erro em `.next/dev/types/`, é cache do Next apontando
para rota removida: `rm -rf .next`.
