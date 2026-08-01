import { mockDb } from "@/lib/mock/mockDb";
import {
  notFound,
  requireAuth,
  unavailable,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

const DEGRADED = "degradado";

export function handleTimekeepingRoute({
  path,
  method,
  scenario,
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

  return notFound();
}
