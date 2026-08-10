import type { User, UserRole } from "@/types/auth";

/**
 * Domínios que a interface escreve, e quem pode escrevê-los.
 *
 * Espelha a coluna "Papel banco" da §2 de `ARQUITETURA-MODULOS.md`. Não é a
 * barreira de segurança — essa é o `GRANT` do PostgreSQL, que recusa a escrita
 * venha de onde vier. Aqui é só o que a tela mostra: botão que o banco
 * recusaria não deveria estar clicável.
 *
 * `badges` inclui OPERADOR de propósito: a portaria bloqueia e reporta perda
 * (`GRANT UPDATE (status, revoked_at, revoked_reason)`), mas não cria nem
 * revoga. Essa distinção é do formulário, não desta tabela.
 */
export const MUTABLE_RESOURCES = {
  departments: ["ADMIN", "RH"],
  employees: ["ADMIN", "RH"],
  schedules: ["ADMIN", "RH"],
  absences: ["ADMIN", "RH"],
  badges: ["ADMIN", "RH", "OPERADOR"],
  devices: ["ADMIN"],
  users: ["ADMIN"],
  settings: ["ADMIN"],
} as const satisfies Record<string, readonly UserRole[]>;

export type MutableResource = keyof typeof MUTABLE_RESOURCES;

/**
 * Autorização por papel. Fica aqui, e só aqui — componentes nunca comparam
 * `user.role` inline.
 */
export class PermissionService {
  /** Se este papel pode criar, editar ou remover neste domínio. */
  static canMutate(
    user: User | null | undefined,
    resource: MutableResource | undefined,
  ): boolean {
    if (!resource) return false;
    return PermissionService.canAccess(user, MUTABLE_RESOURCES[resource]);
  }

  /**
   * Emitir crachá e revogar são só de ADMIN e RH, embora OPERADOR escreva em
   * `badges`.
   *
   * `MUTABLE_RESOURCES` não dá conta desta distinção, e não é falha dela: o
   * GRANT do operador é `UPDATE (status, revoked_at, revoked_reason)` **sem**
   * `INSERT`, e privilégio de coluna não sabe dizer *qual valor* de status ele
   * pode escrever. A separação existe no banco como ausência de `INSERT`, e nas
   * rotas de `/badges` como `@RequireRole`. Aqui é só a tela não oferecer o que
   * as duas recusariam.
   */
  static canIssueBadge(user: User | null | undefined): boolean {
    return PermissionService.canAccess(user, ["ADMIN", "RH"]);
  }

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
