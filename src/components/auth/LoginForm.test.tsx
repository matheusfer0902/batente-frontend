import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http } from "msw";
import { AUTH_API_BASE_URL } from "@/redux/reducers/queries/authBaseQuery";
import { LoginForm } from "@/components/auth/LoginForm";
import { server } from "../../../test/setup/msw.server";
import { renderWithProviders } from "../../../test/helpers/render";
import { authState } from "../../../test/helpers/auth";
import { expectNoA11yViolations } from "../../../test/helpers/a11y";
import { scenarios } from "../../../test/mocks/scenarios";
import { jsonError } from "../../../test/mocks/utils";

/**
 * O mock global de `next/navigation` devolve objeto novo por chamada, então o
 * spy que ele cria não é o que o componente usou. Router estável, içado.
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

const SENHA = "password123";
const EMAIL_ADMIN = "owner@batente.dev";

/** Preenche e submete. O botão é buscado por papel, não por texto traduzido. */
async function submeter(
  user: ReturnType<typeof renderWithProviders>["user"],
  email: string,
  senha: string,
) {
  await user.type(screen.getByLabelText(/mail/i), email);
  await user.type(screen.getByLabelText(/senha/i), senha);
  await user.click(screen.getByRole("button"));
}

describe("LoginForm", () => {
  describe("estado inicial", () => {
    it("apresenta os campos e a ação de entrada habilitados", () => {
      // arrange / act
      renderWithProviders(<LoginForm />);

      // assert
      expect(screen.getByLabelText(/mail/i)).toBeEnabled();
      expect(screen.getByLabelText(/senha/i)).toBeEnabled();
      expect(screen.getByRole("button")).toBeEnabled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("não anuncia trabalho em andamento antes do submit", () => {
      // arrange / act
      const { container } = renderWithProviders(<LoginForm />);

      // assert
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(container.querySelector("form")).toHaveAttribute(
        "aria-busy",
        "false",
      );
    });

    it("não tem violação de acessibilidade", async () => {
      // arrange / act
      const { container } = renderWithProviders(<LoginForm />);

      // assert
      await expectNoA11yViolations(container);
    });
  });

  describe("validação do formulário", () => {
    it("cobra o e-mail quando o campo fica vazio", async () => {
      // arrange
      const { user } = renderWithProviders(<LoginForm />);

      // act
      await user.click(screen.getByRole("button"));

      // assert — a mensagem vem do i18n; o que se afirma é que o campo foi barrado
      await waitFor(() => {
        expect(screen.getByLabelText(/mail/i)).toHaveAttribute(
          "aria-invalid",
          "true",
        );
      });
      expect(router.replace).not.toHaveBeenCalled();
    });

    it("cobra a senha quando só o e-mail é informado", async () => {
      // arrange
      const { user } = renderWithProviders(<LoginForm />);

      // act
      await user.type(screen.getByLabelText(/mail/i), EMAIL_ADMIN);
      await user.click(screen.getByRole("button"));

      // assert
      await waitFor(() => {
        expect(screen.getByLabelText(/senha/i)).toHaveAttribute(
          "aria-invalid",
          "true",
        );
      });
    });
  });

  describe("enquanto verifica as credenciais", () => {
    it("anuncia trabalho em andamento e desabilita os campos", async () => {
      // arrange — o login fica preso até o teste liberar
      let liberar: () => void = () => undefined;
      const preso = new Promise<void>((resolve) => {
        liberar = resolve;
      });
      server.use(
        http.post(`${AUTH_API_BASE_URL}/auth/login`, async () => {
          await preso;
          return new Response(null, { status: 204 });
        }),
      );

      const { user } = renderWithProviders(<LoginForm />);

      // act
      await submeter(user, EMAIL_ADMIN, SENHA);

      // assert
      const aviso = await screen.findByRole("status");
      expect(aviso).toBeInTheDocument();
      expect(screen.getByLabelText(/mail/i)).toBeDisabled();
      expect(screen.getByLabelText(/senha/i)).toBeDisabled();

      liberar();
    });
  });

  describe("quando a credencial é inválida", () => {
    it("RN-1.5 · exibe alerta e marca os campos, sem navegar", async () => {
      // arrange
      const { user } = renderWithProviders(<LoginForm />);

      // act
      await submeter(user, EMAIL_ADMIN, "senha-errada");

      // assert
      const alerta = await screen.findByRole("alert");
      expect(alerta).toBeInTheDocument();
      expect(router.replace).not.toHaveBeenCalled();
      expect(screen.getByRole("button")).toBeEnabled();
    });

    it("RN-1.5 · mostra o mesmo alerta para e-mail inexistente", async () => {
      // arrange
      const { user } = renderWithProviders(<LoginForm />);

      // act
      await submeter(user, "ninguem@batente.dev", SENHA);

      // assert
      expect(await screen.findByRole("alert")).toBeInTheDocument();
    });

    it("dispensa o alerta assim que o usuário corrige os dados", async () => {
      // arrange
      const { user } = renderWithProviders(<LoginForm />);
      await submeter(user, EMAIL_ADMIN, "senha-errada");
      await screen.findByRole("alert");

      // act
      await user.type(screen.getByLabelText(/senha/i), "x");

      // assert
      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    it("não tem violação de acessibilidade com o alerta visível", async () => {
      // arrange
      const { user, container } = renderWithProviders(<LoginForm />);

      // act
      await submeter(user, EMAIL_ADMIN, "senha-errada");
      await screen.findByRole("alert");

      // assert
      await expectNoA11yViolations(container);
    });
  });

  describe("quando a conta está bloqueada", () => {
    it("exibe contagem regressiva e impede novo envio", async () => {
      // arrange
      const unlockAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      scenarios.contaBloqueada({ email: EMAIL_ADMIN, unlockAt });
      const { user } = renderWithProviders(<LoginForm />);

      // act
      await submeter(user, EMAIL_ADMIN, SENHA);

      // assert
      const alerta = await screen.findByRole("alert");
      expect(alerta).toHaveTextContent(/\d{2}:\d{2}/);
      await waitFor(() => {
        expect(screen.getByRole("button")).toBeDisabled();
      });
      expect(screen.getByLabelText(/mail/i)).toBeDisabled();
    });
  });

  describe("quando o servidor não responde", () => {
    it("usa o tom de contingência e oferece nova tentativa", async () => {
      // arrange
      scenarios.servidorIndisponivel();
      const { user } = renderWithProviders(<LoginForm />);

      // act
      await submeter(user, EMAIL_ADMIN, SENHA);

      // assert
      const alerta = await screen.findByRole("alert");
      expect(alerta).toBeInTheDocument();
      // A ação existe e continua acionável — o botão de nova tentativa.
      await waitFor(() => {
        expect(screen.getByRole("button")).toBeEnabled();
      });
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  describe("quando o login é aceito mas a identidade não se confirma", () => {
    it("não fica muda — exibe alerta em vez de nada acontecer", async () => {
      // arrange — POST passa, /auth/me falha
      server.use(
        http.get(`${AUTH_API_BASE_URL}/auth/me`, () =>
          jsonError(500, "erro_interno"),
        ),
        http.post(`${AUTH_API_BASE_URL}/auth/refresh`, () =>
          jsonError(401, "refresh_invalido"),
        ),
      );
      const { user } = renderWithProviders(<LoginForm />);

      // act
      await submeter(user, EMAIL_ADMIN, SENHA);

      // assert
      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  describe("quando já existe sessão", () => {
    it("leva ao destino do papel em vez de deixar o formulário na tela", async () => {
      // arrange / act
      renderWithProviders(<LoginForm />, {
        preloadedState: authState("ADMIN"),
      });

      // assert
      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith("/inicio");
      });
    });

    it("leva o OPERADOR para a portaria", async () => {
      // arrange / act
      renderWithProviders(<LoginForm />, {
        preloadedState: authState("OPERADOR"),
      });

      // assert
      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith("/portaria");
      });
    });
  });
});
