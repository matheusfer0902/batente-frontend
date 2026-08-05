"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthService } from "@/services/AuthService";

/**
 * Leva para o painel quem chega a uma tela pública **já tendo sessão**.
 *
 * É a contraparte do `ProtectedRoute`: um cuida de quem não deveria estar numa
 * tela privada, este de quem não deveria estar numa tela pública. Sem ele, quem
 * tem cookie válido e abre `/login` fica olhando o formulário para sempre — o
 * `SessionProvider` confirma a sessão, o Redux passa a `authenticated`, e nada
 * acontece. `src/app/page.tsx` sempre documentou este comportamento; aqui ele
 * passa a existir.
 *
 * Também é a rede de segurança do login: se a navegação do `useAuth.login` não
 * ocorrer por qualquer razão, a hidratação do `SessionProvider` vira
 * `isAuthenticated` e este efeito conclui a viagem.
 *
 * `resolveAuthenticatedRoute` — e não `resolveLandingRoute` — porque ela **nunca**
 * devolve `/login`: sessão aberta com papel ilegível vai para o destino padrão,
 * em vez de redirecionar a tela de entrada para si mesma em laço.
 *
 * Fica num hook, não em `useAuth`, porque precisa ser opt-in: `ProtectedRoute`,
 * `useCanAccess` e `SidebarUserMenu` também consomem `useAuth`, e um efeito de
 * redirecionamento ali dentro navegaria a partir de toda tela do painel.
 */
export function useRedirectAuthenticated(): void {
  const { isAuthenticated, isSessionResolved, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só depois de o servidor responder. Em `unknown` ainda não se sabe nada.
    if (isSessionResolved && isAuthenticated) {
      router.replace(AuthService.resolveAuthenticatedRoute(user?.role));
    }
  }, [isAuthenticated, isSessionResolved, router, user?.role]);
}
