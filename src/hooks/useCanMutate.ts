"use client";

import { useAuth } from "@/hooks/useAuth";
import type { Resource } from "@/types/resource";
import type { User } from "@/types/auth";

export function canMutate(resource: Resource | undefined, user: User | null) {
  return {
    canEdit: Boolean(user && resource && resource.ownerId === user.id),
    canDelete: Boolean(user && resource && resource.ownerId === user.id),
  };
}

export function useCanMutate(resource: Resource | undefined) {
  const { user } = useAuth();
  return canMutate(resource, user);
}
