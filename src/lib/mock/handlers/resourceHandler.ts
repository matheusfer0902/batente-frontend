import type {
  CreateResourcePayload,
  Resource,
  UpdateResourcePayload,
} from "@/types/resource";
import { generateId, mockDb } from "@/lib/mock/mockDb";
import {
  error,
  notFound,
  requireAuth,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

export function handleResourceRoute({
  path,
  method,
  body,
  state,
}: MockRequest): HandlerResult {
  const authResult = requireAuth(state);
  if ("error" in authResult) {
    return authResult.error;
  }

  const resourceMatch = path.match(/^\/resources(?:\/([^/]+))?$/);
  if (!resourceMatch) {
    return notFound();
  }

  const resourceId = resourceMatch[1];

  if (method === "GET" && !resourceId) {
    return { data: mockDb.resources };
  }

  if (method === "GET" && resourceId) {
    const resource = mockDb.resources.find((item) => item.id === resourceId);
    if (!resource) return error(404, "Resource not found");
    return { data: resource };
  }

  if (method === "POST" && !resourceId) {
    const payload = body as CreateResourcePayload;
    const timestamp = new Date().toISOString();
    const resource: Resource = {
      id: generateId("resource"),
      title: payload.title,
      description: payload.description,
      ownerId: authResult.user.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    mockDb.resources.unshift(resource);
    return { data: resource };
  }

  if (method === "PUT" && resourceId) {
    const payload = body as UpdateResourcePayload;
    const index = mockDb.resources.findIndex((item) => item.id === resourceId);
    if (index === -1) return error(404, "Resource not found");
    const existing = mockDb.resources[index]!;
    if (existing.ownerId !== authResult.user.id) {
      return error(403, "Forbidden");
    }
    const updated: Resource = {
      ...existing,
      title: payload.title ?? existing.title,
      description: payload.description ?? existing.description,
      updatedAt: new Date().toISOString(),
    };
    mockDb.resources[index] = updated;
    return { data: updated };
  }

  if (method === "DELETE" && resourceId) {
    const index = mockDb.resources.findIndex((item) => item.id === resourceId);
    if (index === -1) return error(404, "Resource not found");
    const existing = mockDb.resources[index]!;
    if (existing.ownerId !== authResult.user.id) {
      return error(403, "Forbidden");
    }
    mockDb.resources.splice(index, 1);
    return { data: { id: resourceId } };
  }

  return notFound();
}
