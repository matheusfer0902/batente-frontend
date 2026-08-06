import { mockDb } from "@/lib/mock/mockDb";
import {
  notFound,
  requireAdmin,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

export function handleSettingsRoute({
  path,
  method,
  state,
}: MockRequest): HandlerResult {
  const authResult = requireAdmin(state);
  if ("error" in authResult) return authResult.error;

  if (path === "/settings" && method === "GET") {
    return { data: mockDb.settings };
  }

  return notFound();
}
