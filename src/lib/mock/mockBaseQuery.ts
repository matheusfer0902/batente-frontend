import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { ApiError, MockRequestArgs } from "@/types/api";
import type { RootState } from "@/redux/store";
import { handleAccessRoute } from "@/lib/mock/handlers/accessHandler";
import { handleAbsenceRoute } from "@/lib/mock/handlers/absenceHandler";
import { handleAuditRoute } from "@/lib/mock/handlers/auditHandler";
import { handleBadgeRoute } from "@/lib/mock/handlers/badgeHandler";
import { handleDeviceRoute } from "@/lib/mock/handlers/deviceHandler";
import { handleGateRoute } from "@/lib/mock/handlers/gateHandler";
import {
  handleDepartmentRoute,
  handleEmployeeRoute,
} from "@/lib/mock/handlers/peopleHandler";
import { handleScheduleRoute } from "@/lib/mock/handlers/scheduleHandler";
import { handleSettingsRoute } from "@/lib/mock/handlers/settingsHandler";
import { handleTimekeepingRoute } from "@/lib/mock/handlers/timekeepingHandler";
import { handleUserRoute } from "@/lib/mock/handlers/userHandler";
import {
  notFound,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

const MOCK_LATENCY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type RouteHandler = (request: MockRequest) => HandlerResult;

/** Prefixo → handler do domínio. Mesma ordem de leitura das rotas reais. */
const ROUTES: ReadonlyArray<[string, RouteHandler]> = [
  // "/auth" não aparece aqui: a autenticação fala com o backend real
  // (ver redux/reducers/queries/authBaseApi.ts).
  ["/access-events", handleAccessRoute],
  ["/devices", handleDeviceRoute],
  ["/timekeeping", handleTimekeepingRoute],
  ["/departments", handleDepartmentRoute],
  ["/employees", handleEmployeeRoute],
  ["/badges", handleBadgeRoute],
  ["/schedules", handleScheduleRoute],
  ["/absences", handleAbsenceRoute],
  ["/audit-logs", handleAuditRoute],
  ["/gate", handleGateRoute],
  ["/settings", handleSettingsRoute],
  ["/users", handleUserRoute],
];

function parseUrl(url: string): { path: string; searchParams: URLSearchParams } {
  const [path = url, query = ""] = url.split("?");
  return { path, searchParams: new URLSearchParams(query) };
}

/**
 * Roteador do backend stubado. Substituível por `fetchBaseQuery` sem tocar em
 * componentes ou hooks — a interface é a mesma.
 */
export const mockBaseQuery: BaseQueryFn<
  MockRequestArgs,
  unknown,
  ApiError
> = async ({ url, method = "GET", body }, api) => {
  await delay(MOCK_LATENCY_MS);

  const { path, searchParams } = parseUrl(url);
  const handler = ROUTES.find(([prefix]) => path.startsWith(prefix))?.[1];

  if (!handler) {
    return notFound();
  }

  return handler({
    path,
    method,
    body,
    searchParams,
    scenario: searchParams.get("scenario"),
    state: api.getState() as RootState,
  });
};
