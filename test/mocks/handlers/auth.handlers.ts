import { http } from "msw";
import type { AuthCredentials, SessionUser, UserRole } from "@/types/auth";
import { MAX_LOGIN_ATTEMPTS } from "@/types/auth";
import { AUTH_API_BASE_URL } from "@/redux/reducers/queries/authBaseQuery";
import {
  clearLoginAttempts,
  findUserByEmail,
  getLoginAttempt,
  isLockActive,
  registerFailedLogin,
  simulatesOutage,
  testDb,
} from "../db";
import { jsonError, unavailableResponse } from "../utils";

/**
 * Handlers MSW da autenticação, no contrato do backend real.
 *
 * Diferenças em relação à versão anterior, que espelhava o stub:
 *
 * - a base é `AUTH_API_BASE_URL` (outro domínio), não a origem do frontend;
 * - **não há `Authorization: Bearer`.** A sessão é um cookie, então o mock
 *   guarda o estado em memória — o `fetch` do jsdom não gerencia cookies
 *   cross-site de forma confiável, e o que importa testar é o comportamento do
 *   cliente, não o navegador;
 * - `POST /auth/login` responde **204 sem corpo**: quem revela identidade é
 *   `GET /auth/me`;
 * - existe `GET /auth/csrf`, e as rotas mutáveis exigem `x-csrf-token`;
 * - `POST /auth/register` **não existe** — foi substituída por `POST /users`,
 *   restrita a ADMIN.
 */
const base = AUTH_API_BASE_URL;

const CSRF_TOKEN = "csrf-token-de-teste";

/** Sessão corrente do mock. `null` = ninguém logado. */
let sessaoAtual: SessionUser | null = null;

const PERMISSOES_POR_PAPEL: Record<UserRole, readonly ("user:create" | "user:read")[]> =
  {
    ADMIN: ["user:create", "user:read"],
    RH: [],
    OPERADOR: [],
  };

function toSessionUser(user: (typeof testDb.users)[number]): SessionUser {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: PERMISSOES_POR_PAPEL[user.role],
  };
}

/**
 * Sessão corrente do mock, para os handlers dos outros domínios.
 *
 * Eles não podem mais autenticar por `Authorization: Bearer`: com cookie
 * `HttpOnly` não existe token que o cliente possa enviar. Quem sabe se há sessão
 * é o servidor — aqui, este módulo.
 */
export function getMockSession(): SessionUser | null {
  return sessaoAtual;
}

/** Permite ao teste abrir ou encerrar sessão sem passar pelo login. */
export function setMockSession(role: UserRole | null): void {
  if (role === null) {
    sessaoAtual = null;
    return;
  }

  const user = testDb.users.find((candidate) => candidate.role === role);
  sessaoAtual = user ? toSessionUser(user) : null;
}

function exigeCsrf(request: Request): Response | null {
  if (request.headers.get("x-csrf-token") !== CSRF_TOKEN) {
    return jsonError(403, "csrf_ausente", "csrf_ausente");
  }
  return null;
}

function lockedError(record: ReturnType<typeof getLoginAttempt>) {
  return jsonError(423, "Account temporarily locked", "account_locked", {
    failedAttempts: record.failedAttempts,
    remainingAttempts: 0,
    lockedAt: record.lockedAt,
    unlockAt: record.unlockAt,
    occurredAt: new Date().toISOString(),
  });
}

export const authHandlers = [
  http.get(`${base}/auth/csrf`, () => Response.json({ csrfToken: CSRF_TOKEN })),

  http.get(`${base}/auth/me`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    if (!sessaoAtual) return jsonError(401, "sessao_ausente");
    return Response.json(sessaoAtual);
  }),

  http.post(`${base}/auth/login`, async ({ request }) => {
    const semCsrf = exigeCsrf(request);
    if (semCsrf) return semCsrf;

    if (testDb.serverUnavailable) return unavailableResponse();

    const credentials = (await request.json()) as AuthCredentials;

    if (simulatesOutage(credentials.email)) return unavailableResponse();

    const registro = getLoginAttempt(credentials.email);
    if (isLockActive(registro)) return lockedError(registro);

    const user = findUserByEmail(credentials.email);

    // Senha errada e e-mail inexistente devolvem exatamente o mesmo erro.
    if (!user || user.password !== credentials.password) {
      const atualizado = registerFailedLogin(credentials.email);

      if (isLockActive(atualizado)) return lockedError(atualizado);

      return jsonError(401, "Credenciais inválidas", "invalid_credentials", {
        failedAttempts: atualizado.failedAttempts,
        remainingAttempts: Math.max(
          MAX_LOGIN_ATTEMPTS - atualizado.failedAttempts,
          0,
        ),
        lockedAt: null,
        unlockAt: null,
        occurredAt: new Date().toISOString(),
      });
    }

    clearLoginAttempts(credentials.email);
    sessaoAtual = toSessionUser(user);

    // 204 sem corpo: nenhum token trafega no JSON.
    return new Response(null, { status: 204 });
  }),

  http.post(`${base}/auth/refresh`, ({ request }) => {
    const semCsrf = exigeCsrf(request);
    if (semCsrf) return semCsrf;

    if (!sessaoAtual) return jsonError(401, "refresh_invalido");

    return new Response(null, { status: 204 });
  }),

  http.post(`${base}/auth/logout`, ({ request }) => {
    const semCsrf = exigeCsrf(request);
    if (semCsrf) return semCsrf;

    sessaoAtual = null;

    return new Response(null, { status: 204 });
  }),

  http.post(`${base}/users`, async ({ request }) => {
    const semCsrf = exigeCsrf(request);
    if (semCsrf) return semCsrf;

    if (!sessaoAtual) return jsonError(401, "sessao_ausente");

    // Autorização é do servidor: papel insuficiente é 403, e a sessão continua
    // válida (o cliente não deve deslogar).
    if (!sessaoAtual.permissions.includes("user:create")) {
      return jsonError(403, "sem_permissao", "sem_permissao");
    }

    const payload = (await request.json()) as {
      email: string;
      name: string;
      role: UserRole;
    };

    if (findUserByEmail(payload.email)) {
      return jsonError(409, "email_em_uso", "email_em_uso");
    }

    return Response.json(
      {
        userId: `user-${payload.email}`,
        email: payload.email.toLowerCase(),
        name: payload.name.trim(),
        role: payload.role,
        permissions: PERMISSOES_POR_PAPEL[payload.role],
      },
      { status: 201 },
    );
  }),
];
