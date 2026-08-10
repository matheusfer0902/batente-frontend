import { findAccessEventById, mockDb } from "@/lib/mock/mockDb";
import type { AccessEvent } from "@/types/access";
import {
  error,
  notFound,
  requireAuth,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

/**
 * Cenários sem leituras recentes. São silêncios diferentes — `offline` é o
 * painel que não recebe, `sem-movimento` é ninguém passando — mas os dois
 * devolvem lista vazia. Quem distingue é o estado do totem.
 */
const SILENT_SCENARIOS = new Set(["offline", "sem-movimento"]);

function filterAccessEvents(request: MockRequest) {
  const { searchParams, scenario } = request;
  if (scenario && SILENT_SCENARIOS.has(scenario)) {
    return [];
  }

  let items = [...mockDb.accessEvents];

  const decision = searchParams.get("decision");
  if (decision && decision !== "ALL") {
    items = items.filter((event) => event.decision === decision);
  }

  const mode = searchParams.get("mode");
  if (mode && mode !== "ALL") {
    items = items.filter((event) => event.mode === mode);
  }

  const from = searchParams.get("from");
  if (from) {
    const fromTime = new Date(from).getTime();
    if (!Number.isNaN(fromTime)) {
      items = items.filter(
        (event) => new Date(event.occurredAt).getTime() >= fromTime,
      );
    }
  }

  const to = searchParams.get("to");
  if (to) {
    const toTime = new Date(to).getTime();
    if (!Number.isNaN(toTime)) {
      items = items.filter(
        (event) => new Date(event.occurredAt).getTime() <= toTime,
      );
    }
  }

  const badgeCode = searchParams.get("badgeCode")?.trim().toLowerCase();
  if (badgeCode) {
    items = items.filter((event) =>
      event.badgeCode.toLowerCase().includes(badgeCode),
    );
  }

  const q = searchParams.get("q")?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (event) =>
        event.employee?.name.toLowerCase().includes(q) ||
        event.employee?.registration.includes(q) ||
        event.badgeCode.toLowerCase().includes(q),
    );
  }

  return items;
}

function toAccessEventPage(
  request: MockRequest,
  filtered: AccessEvent[],
): {
  items: AccessEvent[];
  total: number;
  page: number;
  limit: number;
} {
  const { searchParams } = request;
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limitParam = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? limitParam
      : filtered.length || 1;
  const start = (page - 1) * limit;

  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  };
}

export function handleAccessRoute({
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
    // Acesso é registro imutável: não se cria, edita nem apaga pelo painel.
    return error(405, "Access events are immutable");
  }

  if (path === "/access-events/stats") {
    return { data: mockDb.accessStats };
  }

  if (path === "/access-events") {
    const request: MockRequest = {
      path,
      method,
      body: undefined,
      searchParams,
      scenario,
      state,
    };
    return {
      data: toAccessEventPage(request, filterAccessEvents(request)),
    };
  }

  const detailMatch = path.match(/^\/access-events\/([^/]+)$/);
  if (detailMatch?.[1]) {
    const event = findAccessEventById(detailMatch[1]);
    if (!event) return error(404, "Access event not found");
    return { data: event };
  }

  return notFound();
}
