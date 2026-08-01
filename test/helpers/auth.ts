import type { User } from "@/types/auth";
import type { RootState } from "@/redux/store";
import { createSession, testDb } from "../mocks/db";

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

export function authState(role: keyof typeof users): Partial<RootState> {
  const record = USER_BY_ROLE[role]();
  const token = createSession(record.id);
  return {
    auth: {
      user: toSafeUser(record),
      token,
    },
  };
}

export function loginAs(role: keyof typeof users): Partial<RootState> {
  return authState(role);
}
