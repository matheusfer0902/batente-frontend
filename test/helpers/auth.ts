import type { User } from "@/types/auth";
import type { RootState } from "@/redux/store";
import { testDb } from "../mocks/db";

const USER_BY_ROLE = {
  ADMIN: () => testDb.users[0]!,
  RH: () => testDb.users[2]!,
  OPERADOR: () => testDb.users[1]!,
} as const;

function toSafeUser(record: (typeof testDb.users)[number]): User {
  const { password: _, ...user } = record;
  return user;
}

export const users: Record<"ADMIN" | "RH" | "OPERADOR", User> = {
  ADMIN: toSafeUser(testDb.users[0]!),
  RH: toSafeUser(testDb.users[2]!),
  OPERADOR: toSafeUser(testDb.users[1]!),
};

/**
 * Pré-carrega uma sessão aberta no slice.
 *
 * **Não há mais `token`.** O par de tokens vive em cookie `HttpOnly` e não é
 * representável no estado do cliente — é essa a garantia que o desenho oferece.
 * O `status` precisa vir como `authenticated`: sem ele o `ProtectedRoute`
 * ficaria em "resolvendo" para sempre e nenhuma tela renderizaria no teste.
 */
export function authState(role: keyof typeof users): Partial<RootState> {
  return {
    auth: {
      user: toSafeUser(USER_BY_ROLE[role]()),
      status: "authenticated",
    },
  };
}

export function loginAs(role: keyof typeof users): Partial<RootState> {
  return authState(role);
}
