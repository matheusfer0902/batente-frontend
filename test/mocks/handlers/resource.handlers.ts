import { http } from "msw";
import type { Resource } from "@/types/resource";
import type {
  CreateResourcePayload,
  UpdateResourcePayload,
} from "@/types/resource";
import { API_BASE_URL } from "@/redux/reducers/queries/fetchBaseQuery";
import { generateId, testDb } from "../db";
import { extractBearerToken, jsonError, unavailableResponse } from "../utils";
import { findUserByToken } from "../db";
import { getMockSession } from "./auth.handlers";

const base = API_BASE_URL;

/**
 * Resolve quem está pedindo.
 *
 * A ordem importa e reflete a migração: o `Bearer` continua aceito para os
 * testes de contrato que o enviam de propósito, mas **não é mais o caminho
 * normal** — desde que a sessão passou a ser cookie `HttpOnly`,
 * `createFetchBaseQuery` não injeta `Authorization`, porque não há token
 * alcançável pelo JavaScript para injetar. Sem sessão, 401: o negativo continua
 * exercitável.
 */
function requireAuth(request: Request) {
  const porToken = findUserByToken(extractBearerToken(request));
  if (porToken) {
    return { user: porToken } as const;
  }

  const sessao = getMockSession();
  const porSessao = sessao
    ? testDb.users.find((candidate) => candidate.id === sessao.userId)
    : undefined;
  if (porSessao) {
    return { user: porSessao } as const;
  }

  return { error: jsonError(401, "Unauthorized") } as const;
}

export const resourceHandlers = [
  http.get(`${base}/resources`, ({ request }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const auth = requireAuth(request);
    if ("error" in auth) return auth.error;
    return Response.json(testDb.resources);
  }),

  http.get(`${base}/resources/:id`, ({ request, params }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const auth = requireAuth(request);
    if ("error" in auth) return auth.error;
    const resource = testDb.resources.find((item) => item.id === params.id);
    if (!resource) return jsonError(404, "Resource not found");
    return Response.json(resource);
  }),

  http.post(`${base}/resources`, async ({ request }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const auth = requireAuth(request);
    if ("error" in auth) return auth.error;
    const payload = (await request.json()) as CreateResourcePayload;
    const timestamp = new Date().toISOString();
    const resource: Resource = {
      id: generateId("resource"),
      title: payload.title,
      description: payload.description,
      ownerId: auth.user.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    testDb.resources.unshift(resource);
    return Response.json(resource);
  }),

  http.put(`${base}/resources/:id`, async ({ request, params }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const auth = requireAuth(request);
    if ("error" in auth) return auth.error;
    const payload = (await request.json()) as UpdateResourcePayload;
    const index = testDb.resources.findIndex((item) => item.id === params.id);
    if (index === -1) return jsonError(404, "Resource not found");
    const existing = testDb.resources[index]!;
    if (existing.ownerId !== auth.user.id) {
      return jsonError(403, "Forbidden");
    }
    const updated: Resource = {
      ...existing,
      title: payload.title ?? existing.title,
      description: payload.description ?? existing.description,
      updatedAt: new Date().toISOString(),
    };
    testDb.resources[index] = updated;
    return Response.json(updated);
  }),

  http.delete(`${base}/resources/:id`, ({ request, params }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const auth = requireAuth(request);
    if ("error" in auth) return auth.error;
    const index = testDb.resources.findIndex((item) => item.id === params.id);
    if (index === -1) return jsonError(404, "Resource not found");
    const existing = testDb.resources[index]!;
    if (existing.ownerId !== auth.user.id) {
      return jsonError(403, "Forbidden");
    }
    testDb.resources.splice(index, 1);
    return Response.json({ id: params.id });
  }),
];
