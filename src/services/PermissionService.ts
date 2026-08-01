import type { User, UserRole } from "@/types/auth";

/**
 * Autorização por papel. Fica aqui, e só aqui — componentes nunca comparam
 * `user.role` inline (o `canMutate` cobre o caso de ownership).
 */
export class PermissionService {
  /** Sem lista de papéis, o recurso é aberto a qualquer sessão. */
  static canAccess(
    user: User | null | undefined,
    allowedRoles?: readonly UserRole[],
  ): boolean {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }

  static isAdmin(user: User | null | undefined): boolean {
    return user?.role === "ADMIN";
  }

  /** Iniciais para o avatar da sidebar: "Cláudia Menezes" → "CM". */
  static initials(name: string | null | undefined): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    const first = parts[0]?.charAt(0) ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
    return `${first}${last}`.toUpperCase();
  }
}
