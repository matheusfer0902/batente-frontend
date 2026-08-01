import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/redux/reducers/queries/fetchBaseQuery";
import { testDb } from "../db";
import { unavailableResponse } from "../utils";
import { authHandlers } from "./auth.handlers";
import { resourceHandlers } from "./resource.handlers";

const base = API_BASE_URL;

/** Stubs mínimos para endpoints ainda sem testes de domínio. */
const stubHandlers = [
  http.get(`${base}/access-events`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json([]);
  }),
  http.get(`${base}/access-events/stats`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json({ total: 0, granted: 0, denied: 0, offline: 0 });
  }),
  http.get(`${base}/access-events/:id`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json(null, { status: 404 });
  }),
  http.get(`${base}/devices/primary`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json({
      id: "device-1",
      name: "Totem 01",
      location: "Portaria",
      status: "ONLINE",
      lastContactAt: new Date().toISOString(),
      clockDriftMs: 0,
      pendingUploads: 0,
    });
  }),
  http.get(`${base}/timekeeping/pending`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json({ days: 0, blockingClosure: 0, periodLabel: "" });
  }),
  http.get(`${base}/timekeeping/adjustments`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json({ count: 0, oldestWaitingDays: 0 });
  }),
];

export const handlers = [
  ...authHandlers,
  ...resourceHandlers,
  ...stubHandlers,
];
