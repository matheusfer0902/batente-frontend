import { defineConfig, devices } from "@playwright/test";

/**
 * `webServer` usa build de produção (nunca `next dev`).
 *
 * Dois grupos de projetos, separados por tag:
 *
 * - **mockado** (`chromium`, `webkit`, `mobile-chrome`) — especificações da Fase 7,
 *   sem dependência de backend; ignora `@real`.
 * - **`e2e-real`** — só o que carrega a tag `@real`, exigindo Postgres e a API no
 *   ar. Fica isolado para que a suíte de PR não fique vermelha em quem não subiu
 *   a infraestrutura, e roda apenas em Chromium: o alvo é o comportamento do
 *   fluxo com o servidor real, não compatibilidade entre motores.
 *
 * A porta é **3000** por imposição do backend: `CORS_ALLOWED_ORIGINS` libera essa
 * origem, e cookie de sessão cross-origin não sobrevive a outra.
 */
export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      grepInvert: /@real/,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      grepInvert: /@real/,
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      grepInvert: /@real/,
    },
    {
      name: "e2e-real",
      use: { ...devices["Desktop Chrome"] },
      grep: /@real/,
      // Serial de propósito: o backend limita taxa em `/auth/login`, e uma
      // rajada de entradas paralelas transformaria limite em teste vermelho.
      fullyParallel: false,
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
