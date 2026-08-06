import type { BadgeListItem } from "@/types/badge";
import { mockDb } from "@/lib/mock/mockDb";
import {
  notFound,
  requireAuth,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

function filterBadges(request: MockRequest): BadgeListItem[] {
  const { searchParams } = request;
  let items = [...mockDb.badges];

  const status = searchParams.get("status");
  if (status && status !== "ALL") {
    items = items.filter((badge) => badge.status === status);
  }

  const q = searchParams.get("q")?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (badge) =>
        badge.code.toLowerCase().includes(q) ||
        badge.employee?.name.toLowerCase().includes(q),
    );
  }

  return items;
}

export function handleBadgeRoute(request: MockRequest): HandlerResult {
  const authResult = requireAuth(request.state);
  if ("error" in authResult) return authResult.error;

  const { path, method } = request;

  if (path === "/badges" && method === "GET") {
    return { data: filterBadges(request) };
  }

  const detailMatch = path.match(/^\/badges\/([^/]+)$/);
  if (detailMatch?.[1] && method === "GET") {
    const badge = mockDb.badges.find((item) => item.id === detailMatch[1]);
    if (!badge) return notFound();
    return { data: badge };
  }

  return notFound();
}
