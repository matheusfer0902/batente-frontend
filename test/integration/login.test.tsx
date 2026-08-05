import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http } from "msw";
import { AUTH_API_BASE_URL } from "@/redux/reducers/queries/authBaseQuery";
import { LoginForm } from "@/components/auth/LoginForm";
import { renderWithProviders } from "../helpers/render";
import { server } from "../setup/msw.server";
import { setMockSession } from "../mocks/handlers/auth.handlers";
import { jsonError } from "../mocks/utils";

/**
 * Integração da tela de entrada **com o `SessionProvider` montado** — é ele que
 * dispara o `GET /auth/me` de boot, e sem essa consulta a corrida que motivou
 * esta suíte não existe. Nada de hook mockado: só a rede, via MSW.
 */
const { router } = vi.hoisted(() => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}));

const EMAIL_ADMIN = "owner@batente.dev";
const SENHA = "password123";

async function submeter(
  user: ReturnType<typeof renderWithProviders>["user"],
  email = EMAIL_ADMIN,
  senha = SENHA,
) {
  await user.type(screen.getByLabelText(/mail/i), email);
  await user.type(screen.getByLabelText(/senha/i), senha);
  await user.click(screen.getByRole("button"));
}

describe("tela de entrada", () => {
  it("I2 · anônimo entra com credenciais válidas e é levado ao painel", async () => {
    // arrange
    const { user } = renderWithProviders(<LoginForm />, { withSession: true });

    // act
    await submeter(user);

    // assert
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/inicio");
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("I2 · confirma a sessão mesmo com o /auth/me de boot respondendo 401 depois do login", async () => {
    // arrange — ordem imposta pelo servidor, não por tempo: a consulta de boot
    // só responde depois que o login foi aceito, e responde o 401 obsoleto que
    // ela teria devolvido de todo modo (foi emitida antes do login).
    let liberarBoot: () => void = () => undefined;
    const bootPreso = new Promise<void>((resolve) => {
      liberarBoot = resolve;
    });

    server.use(
      http.get(
        `${AUTH_API_BASE_URL}/auth/me`,
        async () => {
          await bootPreso;
          return jsonError(401, "sessao_ausente");
        },
        { once: true },
      ),
      // No boot real não há refresh token válido: o 401 se mantém.
      http.post(
        `${AUTH_API_BASE_URL}/auth/refresh`,
        () => jsonError(401, "refresh_invalido"),
        { once: true },
      ),
      http.post(`${AUTH_API_BASE_URL}/auth/login`, () => {
        // O servidor passa a reconhecer a sessão e só então solta o boot.
        setMockSession("ADMIN");
        liberarBoot();
        return new Response(null, { status: 204 });
      }),
    );

    const { user } = renderWithProviders(<LoginForm />, { withSession: true });

    // act
    await submeter(user);

    // assert — apesar do 401 obsoleto, a sessão se confirma e a viagem termina
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/inicio");
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("I2 · quem já tem sessão não fica preso no formulário", async () => {
    // arrange — o servidor reconhece a sessão desde o primeiro /auth/me
    setMockSession("RH");

    // act
    renderWithProviders(<LoginForm />, { withSession: true });

    // assert
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/inicio");
    });
  });

  it("I2 · operador com sessão vai para a portaria", async () => {
    // arrange
    setMockSession("OPERADOR");

    // act
    renderWithProviders(<LoginForm />, { withSession: true });

    // assert
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/portaria");
    });
  });

  it("I2 · RN-1.5 · credencial inválida mantém o usuário na tela com alerta", async () => {
    // arrange
    const { user } = renderWithProviders(<LoginForm />, { withSession: true });

    // act
    await submeter(user, EMAIL_ADMIN, "senha-errada");

    // assert
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("I2 · login aceito com identidade não confirmada mostra alerta em vez de silêncio", async () => {
    // arrange
    server.use(
      http.get(`${AUTH_API_BASE_URL}/auth/me`, () =>
        jsonError(500, "erro_interno"),
      ),
      http.post(`${AUTH_API_BASE_URL}/auth/refresh`, () =>
        jsonError(401, "refresh_invalido"),
      ),
    );
    const { user } = renderWithProviders(<LoginForm />, { withSession: true });

    // act
    await submeter(user);

    // assert
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
