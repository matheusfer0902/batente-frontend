# Instruções do projeto BATENTE Frontend

Este diretório complementa o [`CLAUDE.md`](../CLAUDE.md) na raiz.

## Leitura obrigatória

1. [docs/agents.md](../docs/agents.md) — guia central de agentes
2. [docs/screens.md](../docs/screens.md) — telas e design (**obrigatório para tarefas de UI**)
3. [docs/architecture.md](../docs/architecture.md)
4. [docs/solid-principles.md](../docs/solid-principles.md)
5. [docs/feature-module-guide.md](../docs/feature-module-guide.md)
6. [docs/testing.md](../docs/testing.md) — arquitetura de testes

## Ao implementar

- Consultar [docs/screens.md](../docs/screens.md) e o bloco correspondente em [docs/Telas Batente.zip](../docs/Telas%20Batente.zip) antes de qualquer UI
- Respeitar camadas e SOLID documentados
- Replicar molde `resource` para novas features (inclui testes — passo 11)
- Atualizar `docs/` ao alterar arquitetura ou convenções de teste
- Rodar verificação antes de concluir:

```bash
npm run typecheck && npm run build && npm run test
```

## Testes

- **Vitest** + **MSW** + **Playwright** (Plano B: mock em dev, HTTP em teste)
- Mockar rede, nunca hooks orquestradores
- Referência canônica: módulo `resource`
- Guia rápido: [test/README.md](../test/README.md)

## Regras espelhadas

As mesmas regras do Cursor estão em [`.cursor/rules/`](../.cursor/rules/), incluindo [design-screens.mdc](../.cursor/rules/design-screens.mdc) e [testing.mdc](../.cursor/rules/testing.mdc).
