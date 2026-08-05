"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  sessionCleared,
  sessionEstablished,
} from "@/redux/reducers/slices/authSlice";
import {
  authApi,
  useGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
} from "@/redux/reducers/queries/authApi";
import { resetAuthClientState } from "@/redux/reducers/queries/authBaseQuery";
import { AuthService } from "@/services/AuthService";
import { toUser, type AuthCredentials, type LoginFailure } from "@/types/auth";

/**
 * Orquestração da sessão.
 *
 * Diferenças em relação à versão anterior, todas exigidas pelo desenho de
 * segurança:
 *
 * - **não escreve cookie algum.** Quem grava `access_token` e `refresh_token` é
 *   o servidor, com `HttpOnly`; JavaScript não os alcança nem para ler;
 * - **não lê papel da resposta do login.** `POST /auth/login` responde 204 sem
 *   corpo; identidade e papel vêm de `GET /auth/me`, sempre do servidor;
 * - **não guarda token.** Nem em Redux, nem em memória local.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, status } = useAppSelector((state) => state.auth);

  const [loginMutation, loginState] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  // `refetch` é o que faz papel novo aparecer sem recarregar a página.
  const { refetch: refetchMe, isFetching: isMeFetching } = useGetMeQuery();

  /**
   * Falha de confirmação de sessão. Fica fora do RTK de propósito: o
   * `POST /auth/login` respondeu `204`, então não existe erro em
   * `loginState.error` para a tela derivar.
   */
  const [confirmationFailure, setConfirmationFailure] =
    useState<LoginFailure | null>(null);

  const landingRoute = AuthService.resolveLandingRoute(user?.role);

  /**
   * Pergunta ao servidor quem entrou, com **uma** retentativa.
   *
   * A retentativa não é paranoia, é exigência do RTK Query. O `condition` do
   * `queryThunk` rejeita um refetch forçado enquanto existe consulta pendente
   * para a mesma chave (`status === "pending"` é avaliado antes de
   * `isForcedQuery`), e nesse caso o `unwrap` passa a esperar **aquela**
   * resposta. Se a consulta em voo for a de boot — emitida antes do login —, ela
   * volta `401` e a confirmação falha logo depois de um login bem-sucedido.
   *
   * Uma retentativa basta e não custa ida extra no caminho normal: `getMe` tem
   * chave de cache única e deduplicada, então depois que a primeira liquida não
   * pode restar nenhuma consulta anterior ao login pendente.
   */
  const consultarMe = useCallback(async () => {
    // `try` em volta da chamada, não só `.catch` na promessa: `refetch()` lança
    // **sincronamente** ("Cannot refetch a query that has not been started yet")
    // quando a assinatura já não existe — caso de quem desmonta a tela no meio do
    // login. Sem isto, `login()` rejeitaria e o erro escaparia do formulário.
    try {
      return await refetchMe().unwrap();
    } catch {
      return null;
    }
  }, [refetchMe]);

  const confirmarSessao = useCallback(async () => {
    const primeira = await consultarMe();
    if (primeira) return primeira;

    return await consultarMe();
  }, [consultarMe]);

  /**
   * Não lança em falha: a tela de entrada trata os estados a partir de
   * `loginFailure`, derivado do erro que o RTK Query retém ou — quando o login
   * passou e a confirmação não — de `confirmationFailure`.
   */
  const login = useCallback(
    async (credentials: AuthCredentials): Promise<boolean> => {
      setConfirmationFailure(null);

      const result = await loginMutation(credentials);

      if ("error" in result) {
        return false;
      }

      // A sessão só é considerada aberta depois que o servidor confirma quem é.
      const sessao = await confirmarSessao();

      if (!sessao) {
        setConfirmationFailure(AuthService.sessionConfirmationFailure());
        return false;
      }

      const perfil = toUser(sessao);
      dispatch(sessionEstablished(perfil));
      // `replace`, não `push`: entrar não deve deixar a tela de login no
      // histórico, para o Back não devolver o usuário ao formulário.
      router.replace(AuthService.resolveLandingRoute(perfil.role));

      return true;
    },
    [confirmarSessao, dispatch, loginMutation, router],
  );

  const logout = useCallback(async () => {
    // Erro de rede não impede a saída local: o cookie de refresh tem Path
    // restrito e expira, e a interface não pode ficar presa numa sessão que o
    // usuário já pediu para encerrar.
    await logoutMutation()
      .unwrap()
      .catch(() => undefined);

    resetAuthClientState();
    setConfirmationFailure(null);

    // Descarta o cache de servidor por dois motivos, e o segundo é o que
    // realmente exige isto:
    //
    // 1. **Higiene.** Nada do usuário que saiu deve sobrar para o próximo que
    //    entrar nesta aba — listagens, nomes, qualquer resposta já buscada.
    // 2. **Uma consulta em voo ressuscitaria a sessão.** Se o `/auth/me` do boot
    //    ainda não voltou, sua resposta (bem-sucedida, emitida antes do logout)
    //    chega depois do `sessionCleared` e o `SessionProvider` hidrata de novo,
    //    deixando a interface autenticada logo após o usuário pedir para sair.
    //    Zerar a fatia da API descarta essa resposta e força uma pergunta nova.
    dispatch(authApi.util.resetApiState());
    dispatch(sessionCleared());
    router.replace("/login");
  }, [dispatch, logoutMutation, router]);

  const loginFailure = useMemo<LoginFailure | null>(
    () =>
      loginState.error
        ? AuthService.parseLoginFailure(loginState.error)
        : confirmationFailure,
    [confirmationFailure, loginState.error],
  );

  const clearLoginFailure = useCallback(() => {
    if (loginState.error) {
      loginState.reset();
    }
    setConfirmationFailure(null);
  }, [loginState]);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    /** `unknown` = ainda perguntando ao servidor; o guard deve esperar. */
    isSessionResolved: status !== "unknown",
    isLoading: loginState.isLoading || isMeFetching,
    isSubmitting: loginState.isLoading,
    loginFailure,
    clearLoginFailure,
    landingRoute,
    login,
    logout,
  };
}
