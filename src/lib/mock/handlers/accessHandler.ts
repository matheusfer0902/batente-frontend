import { findAccessEventById, mockDb } from "@/lib/mock/mockDb";
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
    if (scenario && SILENT_SCENARIOS.has(scenario)) {
      return { data: [] };
    }
    const limitParam = Number(searchParams.get("limit"));
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? limitParam
        : mockDb.accessEvents.length;
    return { data: mockDb.accessEvents.slice(0, limit) };
  }

  const detailMatch = path.match(/^\/access-events\/([^/]+)$/);
  if (detailMatch?.[1]) {
    const event = findAccessEventById(detailMatch[1]);
    if (!event) return error(404, "Access event not found");
    return { data: event };
  }

  return notFound();
}
