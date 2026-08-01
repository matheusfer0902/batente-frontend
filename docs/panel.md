# O painel (Bloco 2)

Casca do sistema e as três primeiras telas com dados: Início, Monitor de
acessos e Detalhe do acesso.

## Casca

```
(dashboard)/layout.tsx
├── Sidebar          246px, a partir de `md`
│   ├── BatenteWordmark
│   ├── SidebarNav        grupos vindos de lib/navigation.ts
│   └── SidebarUserMenu   iniciais, nome, papel · idioma e sair
├── MobileNav        abaixo de `md`, gaveta com a mesma SidebarNav
└── main
    ├── PageHeader   título + subtítulo + ações (pílula do totem, botões)
    └── conteúdo
```

O painel é **sempre escuro**: `forcedTheme="dark"` em `Providers`. Só existe
design escuro para entrada e painel; o `ThemeProvider` fica no lugar para
quando houver um claro.

## Navegação

`src/lib/navigation.ts` é a fonte única: grupos, rotas, papéis e contadores.
Dela saem a sidebar, o `PROTECTED_PATHS` do middleware e os placeholders.

| Grupo | Itens |
|---|---|
| — | Início, Monitor de acessos |
| Pessoas | Colaboradores, Departamentos, Crachás, Escalas |
| Ponto | Pendências, Espelho, Ajustes, Fechamento, Banco de horas, Ausências |
| Sistema `ADMIN` | Dispositivos*, Histórico, Auditoria*, Relatórios, Usuários*, Configurações* |

`*` visível apenas para ADMIN. Esconder o item não basta: as telas marcadas
ficam atrás de `RoleGuard`, porque a URL continua digitável.

Só Início, Monitor e Detalhe do acesso têm tela. As demais rotas existem com
`ModulePlaceholder` — a casca do design mostra o sistema inteiro, e nenhum
item leva a lugar nenhum.

## Blocos independentes

O Início tem **um endpoint por bloco** (`/devices/primary`,
`/timekeeping/pending`, `/timekeeping/adjustments`, `/access-events`). É o que
permite o estado 2b: o bloco de ajustes cai e os outros seguem atualizados.
Cada bloco é embrulhado em `DataBoundary`.

## Estados padrão de tela com dados

Ordem: carregando → erro → vazio → conteúdo.

| Estado | Componente | Regra |
|---|---|---|
| Carregando | `SkeletonText` | Esqueleto com a forma do conteúdo — nunca um giro no vazio |
| Vazio de verdade | `EmptyState` | Marca, frase e a ação que preenche a tela |
| Vazio por filtro | `EmptyState` sem marca | Diz quantos registros existem fora do filtro |
| Erro | `ErrorState` | "Nada foi perdido" + tentar de novo |
| Sem permissão | `ForbiddenState` | Não revela qual papel seria necessário |

## Cenários do mock

Sem backend, os estados de falha seriam inalcançáveis. A query `?cenario=`
da página viaja até o mock e muda a resposta. Um backend real ignora.

| `?cenario=` | Efeito | Tela |
|---|---|---|
| (ausente) | Tudo em ordem | 2a, 2c |
| `degradado` | Totem OFFLINE, pendências zeradas, `/timekeeping/adjustments` responde 503 | 2b |
| `offline` | Totem OFFLINE e feed vazio | 2d esquerda |
| `sem-movimento` | Totem ONLINE e feed vazio | 2d direita |

Exemplos: `/inicio?cenario=degradado`, `/monitor?cenario=offline`.

Lido por `useScenario`, aplicado pelos handlers em `lib/mock/handlers/`.

## Monitor

Polling de 10s (`pollingInterval`) nas três queries. O "última leitura há Xs"
do subtítulo vem do `fulfilledTimeStamp` da query, não dos dados — é a idade
da leitura do painel.

Os **dois silêncios** não podem ser confundidos:

- totem OFFLINE + feed vazio → `FeedSuspendedState` ("o painel não recebe")
- totem ONLINE + feed vazio → `NoMovementState` ("ninguém passou")

## Detalhe do acesso

Somente leitura. Não há mutation de edição nem de exclusão no módulo — um
acesso é registro imutável, e a correção de horário é um ajuste no espelho de
ponto, ligado ao evento.

A linha do tempo é derivada pelo `AccessService.toTimeline`, que devolve
chaves de i18n e valores; a tradução acontece no componente.

## Relógios de UI

`useClock` é o tique compartilhado (`useSyncExternalStore`, `null` no servidor
e durante a hidratação). Sobre ele: `useCountdown` (bloqueio de login) e
`useElapsed` ("há 4s", "há 12min").

Formatação em `TimeService` — puro, devolve chave + valores para o i18n.
