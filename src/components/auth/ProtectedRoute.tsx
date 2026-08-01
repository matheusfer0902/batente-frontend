"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AUTH_TOKEN_COOKIE } from "@/types/api";

function hasAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(`${AUTH_TOKEN_COOKIE}=`);
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("common");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const cookiePresent = hasAuthCookie();

    if (!isLoading && !isAuthenticated && !token && !cookiePresent) {
      router.replace("/login");
    }

    if (!isLoading && (isAuthenticated || (!token && !cookiePresent))) {
      setChecking(false);
    }
  }, [isAuthenticated, isLoading, router, token]);

  if (checking || isLoading || (hasAuthCookie() && !isAuthenticated)) {
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
