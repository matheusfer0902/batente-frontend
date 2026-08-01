"use client";

import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PermissionService } from "@/services/PermissionService";
import type { UserRole } from "@/types/auth";

/**
 * Autorização por papel para a UI. Componentes perguntam ao hook — nunca
 * comparam `user.role` diretamente.
 */
export function useCanAccess() {
  const { user } = useAuth();

  const canAccess = useCallback(
    (allowedRoles?: readonly UserRole[]) =>
      PermissionService.canAccess(user, allowedRoles),
    [user],
  );

  return {
    canAccess,
    isAdmin: PermissionService.isAdmin(user),
    user,
  };
}
