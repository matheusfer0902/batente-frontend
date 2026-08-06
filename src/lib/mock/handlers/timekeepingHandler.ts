import type { TimesheetMirrorListItem } from "@/types/timekeeping";
import { mockDb } from "@/lib/mock/mockDb";
import {
  notFound,
  requireAuth,
  unavailable,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

const DEGRADED = "degradado";

function filterTimesheetMirrors(searchParams: URLSearchParams): TimesheetMirrorListItem[] {
  let items = [...mockDb.timesheetMirrors];

  const month = searchParams.get("month");
  if (month) {
    items = items.filter((mirror) => mirror.month === month);
  }

  const q = searchParams.get("q")?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (mirror) =>
        mirror.employee.name.toLowerCase().includes(q) ||
        mirror.employee.registration.includes(q),
    );
  }

  return items;
}

export function handleTimekeepingRoute({
  path,
  method,
  scenario,
  searchParams,
  state,
}: MockRequest): HandlerResult {
  const authResult = requireAuth(state);
  if ("error" in authResult) {
    return authResult.error;
  }

  if (method !== "GET") {
    return notFound();
  }

  if (path === "/timekeeping/pending") {
    // 2b — o período fica sem nada a resolver enquanto o totem está fora.
    if (scenario === DEGRADED) {
      return {
        data: { ...mockDb.pendingSummary, days: 0, blockingClosure: 0 },
      };
    }
    return { data: mockDb.pendingSummary };
  }

  if (path === "/timekeeping/adjustments") {
    // 2b — este bloco cai sozinho; os demais da tela seguem atualizados.
    if (scenario === DEGRADED) {
      return unavailable();
    }
    return { data: mockDb.adjustmentSummary };
  }

  if (path === "/timekeeping/mirror" && method === "GET") {
    return { data: filterTimesheetMirrors(searchParams) };
  }

  return notFound();
}
