import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/redux/reducers/queries/fetchBaseQuery";
import { mockDb, readPrimaryDevice } from "@/lib/mock/mockDb";
import { testDb } from "../db";
import { unavailableResponse } from "../utils";
import { authHandlers } from "./auth.handlers";

const base = API_BASE_URL;

function primaryDeviceListItem() {
  const primary = readPrimaryDevice();
  const stored = mockDb.deviceDetails[primary.id];
  return {
    ...primary,
    firmwareVersion: stored?.firmwareVersion ?? "v2.4.1",
    serialNumber: stored?.serialNumber ?? "BT-0001-0042",
  };
}

function employeeSummary() {
  const active = mockDb.employees.filter((e) => e.status === "ACTIVE");
  return {
    total: mockDb.employees.length,
    active: active.length,
    missingBadge: active.filter((e) => e.flags.missingBadge).length,
    missingSchedule: active.filter((e) => e.flags.missingSchedule).length,
  };
}

function listAccessEvents(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
  const limitParam = Number(url.searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? limitParam
      : mockDb.accessEvents.length || 1;
  const start = (page - 1) * limit;
  const items = mockDb.accessEvents.slice(start, start + limit);

  return {
    items,
    total: mockDb.accessEvents.length,
    page,
    limit,
  };
}

function filterAbsences(request: Request) {
  const url = new URL(request.url);
  let items = [...mockDb.absences];

  const status = url.searchParams.get("status");
  if (status && status !== "ALL") {
    items = items.filter((absence) => absence.status === status);
  }

  const q = url.searchParams.get("q")?.trim().toLowerCase();
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

function filterTimesheetMirrors(request: Request) {
  const url = new URL(request.url);
  let items = [...mockDb.timesheetMirrors];

  const month = url.searchParams.get("month");
  if (month) {
    items = items.filter((mirror) => mirror.month === month);
  }

  const q = url.searchParams.get("q")?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (mirror) =>
        mirror.employee.name.toLowerCase().includes(q) ||
        mirror.employee.registration.includes(q),
    );
  }

  return items;
}

/** Stubs e handlers de domínio para testes MSW — paridade com `mockDb`. */
const domainHandlers = [
  http.get(`${base}/departments`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json(mockDb.departments);
  }),
  http.get(`${base}/departments/:id`, ({ params }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const department = mockDb.departments.find((d) => d.id === params.id);
    if (!department) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(department);
  }),
  http.get(`${base}/employees/summary`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json(employeeSummary());
  }),
  http.get(`${base}/employees`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json(mockDb.employees);
  }),
  http.get(`${base}/access-events`, ({ request }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json(listAccessEvents(request));
  }),
  http.get(`${base}/access-events/stats`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json(mockDb.accessStats);
  }),
  http.get(`${base}/access-events/:id`, ({ params }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const event = mockDb.accessEvents.find((e) => e.id === params.id);
    if (!event) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(event);
  }),
  http.get(`${base}/devices`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json([primaryDeviceListItem()]);
  }),
  http.get(`${base}/devices/primary`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json(primaryDeviceListItem());
  }),
  http.get(`${base}/timekeeping/pending`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json(mockDb.pendingSummary);
  }),
  http.get(`${base}/timekeeping/adjustments`, () => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json(mockDb.adjustmentSummary);
  }),
  http.get(`${base}/timekeeping/mirror`, ({ request }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json(filterTimesheetMirrors(request));
  }),
  http.get(`${base}/absences`, ({ request }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    return HttpResponse.json(filterAbsences(request));
  }),
  http.get(`${base}/absences/:id`, ({ params }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const absence = mockDb.absences.find((item) => item.id === params.id);
    if (!absence) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(absence);
  }),
];

export const handlers = [...authHandlers, ...domainHandlers];
