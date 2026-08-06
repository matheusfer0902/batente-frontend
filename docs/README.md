# Documentação — BATENTE Frontend

Índice da documentação técnica do boilerplate.

| Documento | Descrição |
|-----------|-----------|
| [**Guia de agentes**](./agents.md) | Mapa Claude/Cursor/Codex, ordem de leitura e fluxo de trabalho |
| [**Telas e design**](./screens.md) | Fonte de verdade visual (`Telas Batente.zip`), blocos e status |
| [Arquitetura](./architecture.md) | Visão geral, camadas, stack, fluxo de dados e convenções |
| [Princípios SOLID](./solid-principles.md) | Como SOLID se aplica a cada camada deste projeto |
| [Guia de módulos de feature](./feature-module-guide.md) | Passo a passo para criar um novo domínio (molde `resource`) |
| [Autenticação e autorização](./auth.md) | Fluxo de auth, middleware, ownership e guards |
| [O painel (Bloco 2)](./panel.md) | Casca, navegação, início, monitor e detalhe do acesso |
| [**Testes automatizados**](./testing.md) | Vitest, MSW, RTL, Playwright, convenções e roadmap |

## Para agentes de IA

- **Guia central:** [agents.md](./agents.md)
- **Telas e design:** [screens.md](./screens.md) + [`Telas Batente.zip`](./Telas%20Batente.zip)
- **Cursor:** regras em [`.cursor/rules/`](../.cursor/rules/) — inclui [`design-screens.mdc`](../.cursor/rules/design-screens.mdc) e [`testing.mdc`](../.cursor/rules/testing.mdc)
- **Claude Code:** instruções em [`CLAUDE.md`](../CLAUDE.md)
- **Cursor / Codex:** [`AGENTS.md`](../AGENTS.md)

Antes de implementar qualquer **página ou UI**, consulte [screens.md](./screens.md) e o bloco correspondente no zip.

Antes de implementar qualquer feature, leia [architecture.md](./architecture.md) e [solid-principles.md](./solid-principles.md).

Antes de escrever testes, leia [testing.md](./testing.md).

## Verificação local

```bash
npm run typecheck && npm run build    # compilação
npm run test                          # unit + component (gate mínimo de PR)
npm run test:all                      # suíte completa (CI)
```

Guia rápido de testes: [`test/README.md`](../test/README.md).
