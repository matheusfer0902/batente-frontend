import { generateId, mockDb } from "@/lib/mock/mockDb";
import {
  error,
  notFound,
  requireAuth,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";
import { ScheduleService } from "@/services/ScheduleService";
import type {
  SaveSchedulePayload,
  ScheduleDay,
  ScheduleListItem,
} from "@/types/schedule";

export function handleScheduleRoute({
  path,
  method,
  body,
  state,
}: MockRequest): HandlerResult {
  const authResult = requireAuth(state);
  if ("error" in authResult) return authResult.error;

  if (path === "/schedules" && method === "GET") {
    return { data: mockDb.schedules };
  }

  /**
   * Antes de `/schedules/:id` — a mesma ordem do controller. Se viesse depois,
   * "uncovered" seria lido como um id e o mock responderia 404.
   */
  if (path === "/schedules/uncovered" && method === "GET") {
    const count = mockDb.employees.filter(
      (pessoa) => pessoa.status === "ACTIVE" && pessoa.flags.missingSchedule,
    ).length;

    return { data: { count } };
  }

  if (path === "/schedules" && method === "POST") {
    const payload = body as SaveSchedulePayload;
    const invalido = validar(payload);
    if (invalido) return invalido;

    const schedule = montar(generateId("schedule"), payload, 0);
    mockDb.schedules.push(schedule);

    return { data: schedule };
  }

  const detailMatch = path.match(/^\/schedules\/([^/]+)$/);
  if (detailMatch?.[1]) {
    const id = detailMatch[1];
    const index = mockDb.schedules.findIndex((item) => item.id === id);

    if (method === "GET") {
      const schedule = mockDb.schedules[index];
      if (!schedule) return notFound();
      return { data: schedule };
    }

    if (method === "PUT") {
      if (index === -1) return notFound();

      const payload = body as SaveSchedulePayload;
      const invalido = validar(payload);
      if (invalido) return invalido;

      const atual = mockDb.schedules[index]!;
      mockDb.schedules[index] = montar(id, payload, atual.employeeCount);

      return { data: mockDb.schedules[index] };
    }
  }

  return notFound();
}

function validar(payload: SaveSchedulePayload): HandlerResult | null {
  if (!payload?.name?.trim()) {
    return error(400, "Name is required", "validation_error");
  }

  if (payload.days?.length !== 7) {
    return error(400, "Seven days are required", "validation_error");
  }

  const duplicado = mockDb.schedules.some(
    (item) => item.name.toLowerCase() === payload.name.trim().toLowerCase(),
  );

  if (duplicado) {
    return error(409, "Schedule name taken", "schedule_name_taken");
  }

  return null;
}

/**
 * `expectedMinutes` é derivado aqui também — o cliente nunca o envia, e o mock
 * precisa responder no mesmo formato do backend para o cutover ser invisível.
 */
function montar(
  id: string,
  payload: SaveSchedulePayload,
  employeeCount: number,
): ScheduleListItem {
  const days: ScheduleDay[] = payload.days.map((dia) => ({
    weekday: dia.weekday,
    isWorkday: dia.isWorkday,
    entryTime: dia.isWorkday ? (dia.entryTime ?? null) : null,
    breakStart: dia.isWorkday ? (dia.breakStart ?? null) : null,
    breakEnd: dia.isWorkday ? (dia.breakEnd ?? null) : null,
    exitTime: dia.isWorkday ? (dia.exitTime ?? null) : null,
    expectedMinutes: ScheduleService.dayMinutes(dia),
  }));

  return {
    id,
    name: payload.name.trim(),
    type: payload.type ?? "FIXED",
    toleranceMinutes: payload.toleranceMinutes,
    minBreakMinutes: payload.minBreakMinutes,
    active: payload.active ?? true,
    weeklyMinutes: days.reduce((total, dia) => total + dia.expectedMinutes, 0),
    employeeCount,
    days,
  };
}
