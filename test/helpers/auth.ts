import type { User } from "@/types/auth";
import type { RootState } from "@/redux/store";
import { testDb } from "../mocks/db";
import { setMockSession } from "../mocks/handlers/auth.handlers";

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
  // Abre a sessão também no servidor simulado. Sem isto, o cliente diria
  // "autenticado" e a rede responderia 401: desde que o token saiu do estado, a
  // única prova de sessão que os handlers têm é a deles próprios. Reiniciado no
  // `afterEach` junto com o resto do estado de módulo.
  setMockSession(role);

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
