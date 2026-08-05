"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Guard de rota — **apenas UX**.
 *
 * Não protege dado algum: quem autoriza é o servidor, a cada requisição. Isto
 * existe para não desenhar uma tela vazia e piscar erros de 401 na cara de quem
 * simplesmente não está logado.
 *
 * Antes, este componente decidia pela presença do cookie `auth-token` lido com
 * `document.cookie`. Com `HttpOnly` isso é impossível — e era ilusório de todo
 * modo, já que qualquer um pode escrever um cookie com esse nome. Agora a
 * decisão vem do `status` que o `SessionProvider` obteve de `GET /auth/me`.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isSessionResolved } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("common");

  useEffect(() => {
    // Só redireciona depois que o servidor respondeu. Redirecionar em
    // `unknown` mandaria para o login todo mundo que recarrega a página.
    if (isSessionResolved && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isSessionResolved, router]);

  if (!isSessionResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
