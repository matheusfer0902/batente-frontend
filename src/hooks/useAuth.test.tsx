import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http } from "msw";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import { AUTH_API_BASE_URL } from "@/redux/reducers/queries/authBaseQuery";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { useAuth } from "@/hooks/useAuth";
import { server } from "../../test/setup/msw.server";
import { makeTestStore } from "../../test/helpers/store";
import { getTestI18n } from "../../test/helpers/i18n";
import { authState } from "../../test/helpers/auth";
import { scenarios } from "../../test/mocks/scenarios";
import { setMockSession } from "../../test/mocks/handlers/auth.handlers";
import { jsonError } from "../../test/mocks/utils";

/**
 * O mock global de `next/navigation` em `test/setup/vitest.setup.ts` devolve um
 * **objeto novo a cada chamada** de `useRouter()`, então o spy que ele cria não
 * é o mesmo que o hook usou. Para asserir navegação é preciso um router estável,
 * içado para antes do `vi.mock`.
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

const ADMIN = { email: "owner@batente.dev", password: "password123" };
const OPERADOR = { email: "viewer@batente.dev", password: "password123" };

/**
 * Compõe como a aplicação compõe: o `SessionProvider` acompanha o hook.
 *
 * Não é conveniência — é quem traduz a resposta de `GET /auth/me` em
 * `sessionEstablished`/`sessionCleared`. Sem ele o `status` do slice fica em
 * `unknown` para sempre, e `isSessionResolved` nunca vira `true`.
 */
function createWrapper(preloadedState?: ReturnType<typeof authState>) {
  const store = makeTestStore(preloadedState);

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <I18nextProvider i18n={getTestI18n()}>
          <SessionProvider />
          {children}
        </I18nextProvider>
      </Provider>
    );
  };
}

/** Espera a descoberta de sessão do boot terminar, para partir de estado estável. */
async function aguardarSessaoResolvida(result: {
  current: ReturnType<typeof useAuth>;
}) {
  await waitFor(() => {
    expect(result.current.isSessionResolved).toBe(true);
  });
}

describe("useAuth", () => {
  describe("quando as credenciais são válidas", () => {
    it("estabelece a sessão a partir de /auth/me e navega ao destino do papel ADMIN", async () => {
      // arrange
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });
      await aguardarSessaoResolvida(result);

      // act
      let entrou: boolean | undefined;
      await act(async () => {
        entrou = await result.current.login(ADMIN);
      });

      // assert
      expect(entrou).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe(ADMIN.email);
      expect(router.replace).toHaveBeenCalledWith("/inicio");
    });

    it("leva o OPERADOR para a portaria, não para o painel", async () => {
      // arrange
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });
      await aguardarSessaoResolvida(result);

      // act
      await act(async () => {
        await result.current.login(OPERADOR);
      });

      // assert
      expect(router.replace).toHaveBeenCalledWith("/portaria");
    });

    it("não deixa /login no histórico — navega com replace, não push", async () => {
      // arrange
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });
      await aguardarSessaoResolvida(result);

      // act
      await act(async () => {
        await result.current.login(ADMIN);
      });

      // assert
      expect(router.replace).toHaveBeenCalledWith("/inicio");
      expect(router.push).not.toHaveBeenCalled();
    });
  });

  describe("quando o /auth/me do boot ainda está em voo no momento do submit", () => {
    /**
     * Regressão do defeito que motivou esta suíte.
     *
     * O `condition` do `queryThunk` do RTK rejeita um refetch forçado enquanto
     * há uma consulta pendente para a mesma chave — e o `unwrap` passa a esperar
     * **aquela** resposta, emitida antes do login e portanto `401`. O resultado
     * era `login()` devolvendo `false` sem navegar e sem erro: cookie gravado,
     * tela parada.
     */
    it("confirma a sessão mesmo com a resposta obsoleta 401 chegando depois do login", async () => {
      // arrange — a consulta de boot fica presa até o teste liberar
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
        // No boot real não existe refresh token válido, então o 401 se mantém.
        http.post(
          `${AUTH_API_BASE_URL}/auth/refresh`,
          () => jsonError(401, "refresh_invalido"),
          { once: true },
        ),
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // act — submete com o boot ainda pendente
      let entrou: boolean | undefined;
      let promessa!: Promise<boolean>;
      act(() => {
        promessa = result.current.login(ADMIN);
      });
      expect(result.current.isSubmitting).toBe(true);

      // O POST liquidou, mas a consulta de boot continua presa: é exatamente
      // aqui que a confirmação de sessão pegava carona na resposta obsoleta.
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });

      liberarBoot();
      await act(async () => {
        entrou = await promessa;
      });

      // assert
      expect(entrou).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(router.replace).toHaveBeenCalledWith("/inicio");
    });
  });

  describe("quando o login é aceito mas a identidade não se confirma", () => {
    it("expõe falha de confirmação em vez de falhar em silêncio", async () => {
      // arrange — o POST passa, todo /auth/me falha
      server.use(
        http.get(`${AUTH_API_BASE_URL}/auth/me`, () =>
          jsonError(500, "erro_interno"),
        ),
        http.post(`${AUTH_API_BASE_URL}/auth/refresh`, () =>
          jsonError(401, "refresh_invalido"),
        ),
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // act
      let entrou: boolean | undefined;
      await act(async () => {
        entrou = await result.current.login(ADMIN);
      });

      // assert — a falha tem voz, e ninguém é levado ao painel
      expect(entrou).toBe(false);
      expect(result.current.loginFailure).not.toBeNull();
      expect(result.current.loginFailure?.code).toBe("unknown");
      expect(router.replace).not.toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("limpa a falha de confirmação quando o usuário corrige os dados", async () => {
      // arrange
      server.use(
        http.get(`${AUTH_API_BASE_URL}/auth/me`, () =>
          jsonError(500, "erro_interno"),
        ),
        http.post(`${AUTH_API_BASE_URL}/auth/refresh`, () =>
          jsonError(401, "refresh_invalido"),
        ),
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.login(ADMIN);
      });
      expect(result.current.loginFailure).not.toBeNull();

      // act
      act(() => {
        result.current.clearLoginFailure();
      });

      // assert
      expect(result.current.loginFailure).toBeNull();
    });
  });

  describe("quando a credencial é inválida", () => {
    it("RN-1.5 · reporta invalid_credentials sem navegar", async () => {
      // arrange
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });
      await aguardarSessaoResolvida(result);

      // act
      let entrou: boolean | undefined;
      await act(async () => {
        entrou = await result.current.login({
          email: ADMIN.email,
          password: "senha-errada",
        });
      });

      // assert
      expect(entrou).toBe(false);
      expect(result.current.loginFailure?.code).toBe("invalid_credentials");
      expect(router.replace).not.toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("RN-1.5 · reporta o mesmo código para e-mail inexistente", async () => {
      // arrange
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });
      await aguardarSessaoResolvida(result);

      // act
      await act(async () => {
        await result.current.login({
          email: "ninguem@batente.dev",
          password: "password123",
        });
      });

      // assert
      expect(result.current.loginFailure?.code).toBe("invalid_credentials");
    });
  });

  describe("quando a conta está bloqueada", () => {
    it("reporta account_locked com o momento de liberação", async () => {
      // arrange
      const unlockAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      scenarios.contaBloqueada({ email: ADMIN.email, unlockAt });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });
      await aguardarSessaoResolvida(result);

      // act
      await act(async () => {
        await result.current.login(ADMIN);
      });

      // assert
      expect(result.current.loginFailure?.code).toBe("account_locked");
      expect(result.current.loginFailure?.unlockAt).toBe(unlockAt);
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  describe("quando o servidor não responde", () => {
    it("reporta server_unavailable", async () => {
      // arrange
      scenarios.servidorIndisponivel();

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // act
      await act(async () => {
        await result.current.login(ADMIN);
      });

      // assert
      expect(result.current.loginFailure?.code).toBe("server_unavailable");
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("encerra a sessão e volta para a tela de entrada", async () => {
      // arrange
      setMockSession("ADMIN");
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(authState("ADMIN")),
      });
      await aguardarSessaoResolvida(result);
      expect(result.current.isAuthenticated).toBe(true);

      // act
      await act(async () => {
        await result.current.logout();
      });

      // assert
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(router.replace).toHaveBeenCalledWith("/login");
    });
  });
});
