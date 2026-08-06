import { mockDb } from "@/lib/mock/mockDb";
import {
  notFound,
  requireAdmin,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

export function handleAuditRoute({
  path,
  method,
  state,
}: MockRequest): HandlerResult {
  const authResult = requireAdmin(state);
  if ("error" in authResult) return authResult.error;

  if (path === "/audit-logs" && method === "GET") {
    return { data: mockDb.auditLogs };
  }

  const detailMatch = path.match(/^\/audit-logs\/([^/]+)$/);
  if (detailMatch?.[1] && method === "GET") {
    const log = mockDb.auditLogs.find((item) => item.id === detailMatch[1]);
    if (!log) return notFound();
    return { data: log };
  }

  return notFound();
}
