import { mockDb } from "@/lib/mock/mockDb";
import {
  notFound,
  requireAdmin,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

export function handleUserRoute({
  path,
  method,
  state,
}: MockRequest): HandlerResult {
  if (path === "/users" && method === "GET") {
    const authResult = requireAdmin(state);
    if ("error" in authResult) return authResult.error;
    return { data: mockDb.panelUsers };
  }

  const detailMatch = path.match(/^\/users\/([^/]+)$/);
  if (detailMatch?.[1] && method === "GET") {
    const authResult = requireAdmin(state);
    if ("error" in authResult) return authResult.error;
    const user = mockDb.panelUsers.find((item) => item.id === detailMatch[1]);
    if (!user) return notFound();
    return { data: user };
  }

  return notFound();
}
