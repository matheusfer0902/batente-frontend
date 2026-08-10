# Telas e design — BATENTE Frontend

> **Regra inviolável:** antes de implementar ou alterar qualquer tela, o agente **deve** verificar se ela existe em [`docs/Telas Batente.zip`](./Telas%20Batente.zip). O que está no zip é a especificação visual e de UX; o código deve convergir para ela, nunca o contrário.

## Fonte de verdade

O design completo do frontend está em **`docs/Telas Batente.zip`** — 12 blocos HTML (Design Canvas) exportados do Design Canvas, mais a identidade visual.

Cada bloco documenta:
- Título e descrição do módulo
- IDs de estado (`1a`, `2b`, `3c`…)
- Rotas (`/login`, `/colaboradores/novo`, etc.)
- Variantes de UI (padrão, carregando, erro, vazio, degradado)

## Como consultar o zip

```bash
# Extrair temporariamente para leitura
unzip -o "docs/Telas Batente.zip" -d /tmp/telas-batente

# Listar arquivos
unzip -l "docs/Telas Batente.zip"

# Ler um bloco específico (sem extrair)
unzip -p "docs/Telas Batente.zip" "Bloco 3 - Pessoas.dc.html" | head -200
```

Para visualização completa, abra o `.dc.html` extraído no navegador.

Cada mockup anota a rota ao lado do ID de tela — busque por padrões como `/colaboradores` ou `tela 6` dentro do HTML.

## Mapa bloco → rotas → status

| Bloco | Arquivo no zip | Rotas principais | Status no código |
|---|---|---|---|
| 1 — Entrada | `Bloco 1 - Entrada.dc.html` | `/login`, `/403` | **Implementado** |
| 2 — Painel | `Bloco 2 - Painel.dc.html` | `/inicio`, `/monitor`, `/acessos/[id]` | **Implementado** — ver [panel.md](./panel.md) |
| 3 — Pessoas | `Bloco 3 - Pessoas.dc.html` | `/colaboradores`, `/departamentos` | **Implementado** — telas 6, 7, 3c e 15. Ficha com 6 abas (8–10) pendente |
| 4 — Crachás | `Bloco 4 - Crachas.dc.html` | `/crachas` | Lista somente-leitura sobre mock |
| 5 — Escalas | `Bloco 5 - Escalas.dc.html` | `/escalas` | **Implementado** — telas 19, 20 e 21 |
| 6 — Ponto | `Bloco 6 - Ponto.dc.html` | `/pendencias`, `/espelho`, `/ajustes` | Placeholder |
| 7 — Fechamento | `Bloco 7 - Fechamento e saldo.dc.html` | `/fechamento`, `/banco-de-horas` | Placeholder |
| 8 — Ausências | `Bloco 8 - Ausencias.dc.html` | `/ausencias` | Lista somente-leitura, backend real parcial |
| 9 — Totem | `Bloco 9 - Totem.dc.html` | `/dispositivos` | **Implementado** — telas 37, 38 e 39 (aba Dados). Telemetria, lista de crachás e sincronizações (40–42) dependem da fila offline do firmware |
| 10 — Histórico | `Bloco 10 - Consulta e historico.dc.html` | `/historico`, `/auditoria` | `/historico` no backend real; `/auditoria` no mock |
| 11 — Sistema | `Bloco 11 - Sistema.dc.html` | `/relatorios`, `/usuarios`, `/configuracoes` | Placeholder |
| 12 — Portaria | `Bloco 12 - Portaria.dc.html` | `/portaria` | Placeholder |
| — | `uploads/batente-identidade-visual.html` | tokens, tipografia, cores | Referência de identidade |

Rotas protegidas adicionais (não na sidebar): `/acessos/[id]` (Bloco 2), `/portaria` (Bloco 12).

Navegação canônica: [`src/lib/navigation.ts`](../src/lib/navigation.ts).

## Fluxo antes de implementar uma página

```text
1. Identificar a rota alvo (ex.: /colaboradores)
2. Localizar o bloco na tabela acima (Bloco 3 — Pessoas)
3. Abrir o HTML correspondente no zip
4. Encontrar o ID de tela e os estados (ex.: 3a = listagem, tela 6)
5. Verificar src/app/(dashboard)/colaboradores/page.tsx e components/ relacionados
6. Decidir: evoluir implementação existente ou substituir ModulePlaceholder
7. Implementar seguindo molde `department` + design do zip
```

## Regras de implementação

| Situação | Ação |
|---|---|
| Tela **no zip** + código **existente** | Reutilizar componentes/hooks atuais; ajustar para bater com o design |
| Tela **no zip** + **placeholder** | Substituir `ModulePlaceholder`, seguindo molde `department` + design |
| Tela **no zip** + rota **inexistente** | Criar rota em `app/` alinhada ao que o HTML especifica |
| Tela **ausente no zip** | Construir derivando de blocos vizinhos, [`globals.css`](../src/app/globals.css) e componentes shared |

### Estados de tela

Cada mockup inclui variantes (carregando, erro, vazio, degradado). Implementar na ordem:

**carregando → erro → vazio → conteúdo**

Componentes de referência: `DataBoundary`, `SkeletonText`, `EmptyState`, `ErrorState`, `ForbiddenState` em `components/shared/`.

Detalhes do Bloco 2 (painel): [panel.md](./panel.md).

### O que nunca fazer

- Inventar layout, fluxo ou copy que contradiga o design quando a tela existe no zip
- Criar página do zero sem verificar se já há implementação parcial no código
- Ignorar estados de tela documentados no mockup (só implementar o "happy path")

## Identidade visual

- Tokens BATENTE: [`src/app/globals.css`](../src/app/globals.css) (`@theme inline`)
- Referência completa: `uploads/batente-identidade-visual.html` dentro do zip
- Fontes: IBM Plex Sans, Archivo (variável, eixo `wdth`), IBM Plex Mono
- Tema: escuro fixo (`forcedTheme="dark"` em `Providers`)

## Referências cruzadas

- [Guia de agentes](./agents.md) — fluxo geral e mapa de ferramentas
- [Guia de módulos de feature](./feature-module-guide.md) — passo 0: consultar este documento
- [Arquitetura — Tema e identidade visual](./architecture.md#tema-e-identidade-visual)
