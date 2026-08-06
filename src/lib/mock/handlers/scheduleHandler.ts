import { mockDb } from "@/lib/mock/mockDb";
import {
  notFound,
  requireAuth,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

export function handleScheduleRoute({
  path,
  method,
  state,
}: MockRequest): HandlerResult {
  const authResult = requireAuth(state);
  if ("error" in authResult) return authResult.error;

  if (path === "/schedules" && method === "GET") {
    return { data: mockDb.schedules };
  }

  const detailMatch = path.match(/^\/schedules\/([^/]+)$/);
  if (detailMatch?.[1] && method === "GET") {
    const schedule = mockDb.schedules.find((item) => item.id === detailMatch[1]);
    if (!schedule) return notFound();
    return { data: schedule };
  }

  return notFound();
}
