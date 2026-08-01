# Instruções do projeto BATENTE Frontend

Este diretório complementa o [`CLAUDE.md`](../CLAUDE.md) na raiz.

## Leitura obrigatória

1. [docs/architecture.md](../docs/architecture.md)
2. [docs/solid-principles.md](../docs/solid-principles.md)
3. [docs/feature-module-guide.md](../docs/feature-module-guide.md)
4. [docs/testing.md](../docs/testing.md) — arquitetura de testes

## Ao implementar

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

As mesmas regras do Cursor estão em [`.cursor/rules/`](../.cursor/rules/), incluindo [testing.mdc](../.cursor/rules/testing.mdc).
