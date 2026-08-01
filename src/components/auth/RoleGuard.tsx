"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ForbiddenState } from "@/components/shared/ForbiddenState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCanAccess } from "@/hooks/useCanAccess";
import type { UserRole } from "@/types/auth";

interface RoleGuardProps {
  roles: readonly UserRole[];
  children: ReactNode;
}

/**
 * Barreira de papel para uma tela inteira. Esconder o item no menu não basta:
 * a URL continua digitável. Não revela qual papel seria necessário.
 */
export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { t } = useTranslation("common");
  const { canAccess } = useCanAccess();

  if (canAccess(roles)) {
    return <>{children}</>;
  }

  return (
    <>
      <PageHeader title={t("states.forbidden.pageTitle")} />
      <ForbiddenState className="py-16" />
    </>
  );
}
