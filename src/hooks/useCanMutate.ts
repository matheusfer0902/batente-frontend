"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  PermissionService,
  type MutableResource,
} from "@/services/PermissionService";
import type { User } from "@/types/auth";

/**
 * Pode escrever neste domínio?
 *
 * Antes decidia por posse (`resource.ownerId === user.id`), herança do
 * template: no BATENTE ninguém é "dono" de um departamento ou de um totem.
 * Quem decide é o papel, e o mapa vive em `PermissionService` — versão pura,
 * testável sem React.
 *
 * A resposta é sempre um palpite otimista da interface. A recusa que vale é a
 * do `GRANT` no PostgreSQL, e por isso o formulário ainda precisa tratar 403.
 */
export function canMutate(
  resource: MutableResource | undefined,
  user: User | null,
) {
  const permitido = PermissionService.canMutate(user, resource);

  return { canCreate: permitido, canEdit: permitido, canDelete: permitido };
}

export function useCanMutate(resource: MutableResource | undefined) {
  const { user } = useAuth();

  return canMutate(resource, user);
}
