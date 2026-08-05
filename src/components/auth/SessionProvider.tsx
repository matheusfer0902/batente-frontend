"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import {
  sessionCleared,
  sessionEstablished,
} from "@/redux/reducers/slices/authSlice";
import { useGetMeQuery } from "@/redux/reducers/queries/authApi";
import { toUser } from "@/types/auth";

/**
 * Descobre o estado da sessão perguntando ao servidor.
 *
 * Substitui o `AuthHydrator`, que lia o cookie `auth-token` por
 * `document.cookie` e restaurava o Redux a partir dele. Isso não é mais
 * possível — e é justamente o objetivo: com `HttpOnly`, JavaScript não vê o
 * token. A única forma de saber se há sessão é `GET /auth/me`, que o navegador
 * atende enviando o cookie sozinho.
 *
 * Nenhum `useEffect` busca dados aqui: quem faz a requisição é o RTK Query. O
 * efeito apenas reflete o resultado no slice, para que os guards de rota leiam
 * um estado estável.
 */
export function SessionProvider() {
  const dispatch = useAppDispatch();
  const { data, isSuccess, isError, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (isLoading) return;

    if (isSuccess && data) {
      dispatch(sessionEstablished(toUser(data)));
      return;
    }

    // 401 é o caso normal de quem não está logado, não uma falha a reportar.
    if (isError) {
      dispatch(sessionCleared());
    }
  }, [data, dispatch, isError, isLoading, isSuccess]);

  return null;
}
