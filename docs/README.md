# Documentação — BATENTE Frontend

Índice da documentação técnica do boilerplate.

| Documento | Descrição |
|-----------|-----------|
| [Arquitetura](./architecture.md) | Visão geral, camadas, stack, fluxo de dados e convenções |
| [Princípios SOLID](./solid-principles.md) | Como SOLID se aplica a cada camada deste projeto |
| [Guia de módulos de feature](./feature-module-guide.md) | Passo a passo para criar um novo domínio (molde `resource`) |
| [Autenticação e autorização](./auth.md) | Fluxo de auth, middleware, ownership e guards |
| [**Testes automatizados**](./testing.md) | Vitest, MSW, RTL, Playwright, convenções e roadmap |

## Para agentes de IA

- **Cursor:** regras em [`.cursor/rules/`](../.cursor/rules/) — inclui [`testing.mdc`](../.cursor/rules/testing.mdc)
- **Claude Code:** instruções em [`CLAUDE.md`](../CLAUDE.md)
- **Cursor / Codex:** [`AGENTS.md`](../AGENTS.md)

Antes de implementar qualquer feature, leia [architecture.md](./architecture.md) e [solid-principles.md](./solid-principles.md).

Antes de escrever testes, leia [testing.md](./testing.md).

## Verificação local

```bash
npm run typecheck && npm run build    # compilação
npm run test                          # unit + component (gate mínimo de PR)
npm run test:all                      # suíte completa (CI)
```

Guia rápido de testes: [`test/README.md`](../test/README.md).
