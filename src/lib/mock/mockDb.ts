import type { Resource } from "@/types/resource";
import type { User } from "@/types/auth";

interface MockUserRecord extends User {
  password: string;
}

interface MockDatabase {
  users: MockUserRecord[];
  resources: Resource[];
  sessions: Record<string, string>;
}

const now = new Date().toISOString();

export const mockDb: MockDatabase = {
  users: [
    {
      id: "user-1",
      email: "owner@batente.dev",
      name: "Owner User",
      password: "password123",
    },
    {
      id: "user-2",
      email: "viewer@batente.dev",
      name: "Viewer User",
      password: "password123",
    },
  ],
  resources: [
    {
      id: "resource-1",
      title: "Primeiro recurso",
      description: "Recurso de exemplo pertencente ao owner.",
      ownerId: "user-1",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "resource-2",
      title: "Segundo recurso",
      description: "Outro recurso para demonstrar listagem e filtros.",
      ownerId: "user-1",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "resource-3",
      title: "Recurso do viewer",
      description: "Recurso de outro usuário para demo de ownership.",
      ownerId: "user-2",
      createdAt: now,
      updatedAt: now,
    },
  ],
  sessions: {},
};

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function findUserByEmail(email: string): MockUserRecord | undefined {
  return mockDb.users.find((user) => user.email === email);
}

export function findUserByToken(token: string | null): User | undefined {
  if (!token) return undefined;
  const userId = mockDb.sessions[token];
  if (!userId) return undefined;
  const user = mockDb.users.find((entry) => entry.id === userId);
  if (!user) return undefined;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export function createSession(userId: string): string {
  const token = generateId("token");
  mockDb.sessions[token] = userId;
  return token;
}

export function revokeSession(token: string): void {
  delete mockDb.sessions[token];
}
