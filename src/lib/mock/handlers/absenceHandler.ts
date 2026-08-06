import type { AbsenceListItem } from "@/types/absence";
import { mockDb } from "@/lib/mock/mockDb";
import {
  notFound,
  requireAuth,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

function filterAbsences(request: MockRequest): AbsenceListItem[] {
  const { searchParams } = request;
  let items = [...mockDb.absences];

  const status = searchParams.get("status");
  if (status && status !== "ALL") {
    items = items.filter((absence) => absence.status === status);
  }

  const q = searchParams.get("q")?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (absence) =>
        absence.employee.name.toLowerCase().includes(q) ||
        absence.employee.registration.includes(q) ||
        absence.type.name.toLowerCase().includes(q),
    );
  }

  return items;
}

export function handleAbsenceRoute(request: MockRequest): HandlerResult {
  const authResult = requireAuth(request.state);
  if ("error" in authResult) return authResult.error;

  const { path, method } = request;

  if (path === "/absences" && method === "GET") {
    return { data: filterAbsences(request) };
  }

  const detailMatch = path.match(/^\/absences\/([^/]+)$/);
  if (detailMatch?.[1] && method === "GET") {
    const absence = mockDb.absences.find((item) => item.id === detailMatch[1]);
    if (!absence) return notFound();
    return { data: absence };
  }

  return notFound();
}
