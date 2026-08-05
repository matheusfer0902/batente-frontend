import { expect, test } from "@playwright/test";

/**
 * Login de ponta a ponta contra o **backend real**.
 *
 * Marcado `@real` porque exige infraestrutura: Postgres no Docker e a API no ar.
 * O projeto `e2e-real` do `playwright.config.ts` é o único que roda esta tag, para
 * não misturar com o E2E mockado da Fase 7.
 *
 * Por que esta camada existe, e não só a de integração: o Vitest roda em jsdom
 * sobre módulos já transformados, então ele passa mesmo quando o bundle não
 * hidrata no navegador. Foi exatamente esse o modo de falha observado — o app
 * chegava como HTML morto e o formulário fazia **submit nativo**, jogando a senha
 * na query string. O primeiro teste aqui é essa asserção.
 *
 * Pré-requisitos:
 *   cd batente-backend && npm run docker:up && npm run start:dev   # :3030
 *   npx playwright install                                          # navegadores
 *   npm run test:e2e:real
 *
 * A conta vem da seed idempotente do backend (`npm run db:seed`), configurável
 * por ADMIN_EMAIL/ADMIN_PASSWORD no `.env` do backend.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";
const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@batente.com";
const SENHA = process.env.E2E_ADMIN_PASSWORD ?? "altere-esta-senha@123";

/** Não falha a suíte por infraestrutura ausente — informa e pula. */
test.beforeAll(async () => {
  let disponivel = false;
  try {
    const resposta = await fetch(`${API_URL}/auth/csrf`);
    disponivel = resposta.ok;
  } catch {
    disponivel = false;
  }

  test.skip(
    !disponivel,
    `API não respondeu em ${API_URL}. Suba o backend (npm run start:dev) e o Postgres (npm run docker:up).`,
  );
});

async function preencherEEntrar(page: import("@playwright/test").Page) {
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(SENHA);
  await page.getByRole("button").last().click();
}

test.describe("login @real", () => {
  test("hidrata a tela — o submit não vira navegação nativa com a senha na URL", async ({
    page,
  }) => {
    // arrange
    await page.goto("/login");

    // act
    await preencherEEntrar(page);
    await page.waitForURL((url) => url.pathname !== "/login", {
      timeout: 30_000,
    });

    // assert — o modo de falha era terminar em /login?email=...&password=...
    expect(page.url()).not.toContain("password=");
    expect(page.url()).not.toContain("email=");
  });

  test("entra com a conta semeada e chega ao painel", async ({ page }) => {
    // arrange
    await page.goto("/login");

    // act
    await preencherEEntrar(page);

    // assert
    await expect(page).toHaveURL(/\/inicio$/, { timeout: 30_000 });
  });

  test("grava os cookies de sessão como HttpOnly, invisíveis ao JavaScript", async ({
    page,
    context,
  }) => {
    // arrange
    await page.goto("/login");

    // act
    await preencherEEntrar(page);
    await expect(page).toHaveURL(/\/inicio$/, { timeout: 30_000 });

    // assert
    const cookies = await context.cookies();
    const access = cookies.find((c) => c.name === "access_token");
    const refresh = cookies.find((c) => c.name === "refresh_token");

    expect(access?.httpOnly).toBe(true);
    expect(refresh?.httpOnly).toBe(true);
    // O refresh só é enviado à rota que o rotaciona.
    expect(refresh?.path).toBe("/auth/refresh");

    // Nenhum token alcançável por JS — nem em cookie legível, nem em storage.
    const vazamento = await page.evaluate(() => ({
      cookie: document.cookie,
      local: JSON.stringify(window.localStorage),
      sessao: JSON.stringify(window.sessionStorage),
    }));
    expect(vazamento.cookie).not.toContain("access_token");
    expect(vazamento.local).not.toContain("token");
    expect(vazamento.sessao).not.toContain("token");
  });

  test("mantém a sessão ao recarregar o painel", async ({ page }) => {
    // arrange
    await page.goto("/login");
    await preencherEEntrar(page);
    await expect(page).toHaveURL(/\/inicio$/, { timeout: 30_000 });

    // act
    await page.reload();

    // assert
    await expect(page).toHaveURL(/\/inicio$/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("quem já tem sessão e abre /login é levado ao painel", async ({
    page,
  }) => {
    // arrange
    await page.goto("/login");
    await preencherEEntrar(page);
    await expect(page).toHaveURL(/\/inicio$/, { timeout: 30_000 });

    // act
    await page.goto("/login");

    // assert
    await expect(page).toHaveURL(/\/inicio$/, { timeout: 30_000 });
  });

  test("RN-1.5 · credencial inválida mantém o usuário na entrada com aviso", async ({
    page,
  }) => {
    // arrange
    await page.goto("/login");

    // act
    await page.locator('input[type="email"]').fill(EMAIL);
    await page.locator('input[type="password"]').fill("senha-de-todo-errada");
    await page.getByRole("button").last().click();

    // assert
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/login$/);
  });

  test("visitante sem sessão é mandado da rota protegida para a entrada", async ({
    page,
  }) => {
    // act
    await page.goto("/inicio");

    // assert
    await expect(page).toHaveURL(/\/login$/, { timeout: 30_000 });
  });
});
