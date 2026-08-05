import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AUTH_API_BASE_URL } from "@/redux/reducers/queries/authBaseQuery";
import { setMockSession } from "../mocks/handlers/auth.handlers";

/**
 * Contrato de sessão validado contra o mesmo Zod que a UI espera.
 *
 * O que se protege aqui é a forma: `userId` (não `id`), papel dentro do enum
 * conhecido, e o erro de login carregando `code` estável — a tela decide o texto
 * pelo `code`, nunca pela `message`, então `code` é contrato.
 */
const sessionUserSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "RH", "OPERADOR"]),
  permissions: z.array(z.enum(["user:create", "user:read"])),
});

const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

const CSRF_HEADER = { "x-csrf-token": "csrf-token-de-teste" };

describe("auth.contract", () => {
  it("H2 · GET /auth/csrf devolve o token a ecoar no header", async () => {
    // act
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/csrf`);

    // assert
    expect(response.status).toBe(200);
    const data: unknown = await response.json();
    const parsed = z.object({ csrfToken: z.string().min(1) }).safeParse(data);
    expect(parsed.success).toBe(true);
  });

  it("H2 · POST /auth/login responde 204 sem corpo — identidade não vem daqui", async () => {
    // act
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { ...CSRF_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "owner@batente.dev",
        password: "password123",
      }),
    });

    // assert
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });

  it("H2 · GET /auth/me conforme schema Zod de SessionUser", async () => {
    // arrange
    setMockSession("ADMIN");

    // act
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/me`);

    // assert
    expect(response.status).toBe(200);
    const data: unknown = await response.json();
    const parsed = sessionUserSchema.safeParse(data);
    expect(parsed.success).toBe(true);
  });

  it("H2 · GET /auth/me sem sessão responde 401 no formato de ApiError", async () => {
    // arrange
    setMockSession(null);

    // act
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/me`);

    // assert
    expect(response.status).toBe(401);
    const data: unknown = await response.json();
    expect(apiErrorSchema.safeParse(data).success).toBe(true);
  });

  it("H2 · erro de credencial carrega code estável e detalhes de tentativa", async () => {
    // act
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { ...CSRF_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "owner@batente.dev",
        password: "errada",
      }),
    });

    // assert
    expect(response.status).toBe(401);
    const data: unknown = await response.json();
    const parsed = apiErrorSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.code).toBe("invalid_credentials");

    const detalhes = z
      .object({
        failedAttempts: z.number(),
        remainingAttempts: z.number(),
        occurredAt: z.string(),
      })
      .safeParse(parsed.data?.details);
    expect(detalhes.success).toBe(true);
  });

  it("H2 · rota mutável sem x-csrf-token é recusada com 403", async () => {
    // act
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "owner@batente.dev",
        password: "password123",
      }),
    });

    // assert
    expect(response.status).toBe(403);
  });
});
