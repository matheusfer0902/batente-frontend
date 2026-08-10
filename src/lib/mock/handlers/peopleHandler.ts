import type { Department } from "@/types/department";
import type { EmployeeListItem, EmployeeSummary } from "@/types/employee";
import { mockDb, generateId } from "@/lib/mock/mockDb";
import {
  error,
  notFound,
  requireAuth,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

export function handleDepartmentRoute({
  path,
  method,
  body,
  state,
}: MockRequest): HandlerResult {
  const authResult = requireAuth(state);
  if ("error" in authResult) return authResult.error;

  if (path === "/departments" && method === "GET") {
    return { data: mockDb.departments };
  }

  if (path === "/departments" && method === "POST") {
    const payload = body as { name?: string };
    if (!payload.name?.trim()) {
      return error(400, "Name is required", "validation_error");
    }
    const department: Department = {
      id: generateId("dept"),
      name: payload.name.trim(),
      employeeCount: 0,
    };
    mockDb.departments.push(department);
    return { data: department };
  }

  const detailMatch = path.match(/^\/departments\/([^/]+)$/);
  if (detailMatch?.[1]) {
    const id = detailMatch[1];
    const index = mockDb.departments.findIndex((d) => d.id === id);
    if (index === -1) return error(404, "Department not found");

    if (method === "PUT") {
      const payload = body as { name?: string };
      if (!payload.name?.trim()) {
        return error(400, "Name is required", "validation_error");
      }
      mockDb.departments[index] = {
        ...mockDb.departments[index]!,
        name: payload.name.trim(),
      };
      return { data: mockDb.departments[index] };
    }

    if (method === "DELETE") {
      const department = mockDb.departments[index]!;
      if (department.employeeCount > 0) {
        return error(
          409,
          "Department has employees",
          "department_has_employees",
          { count: department.employeeCount },
        );
      }
      mockDb.departments.splice(index, 1);
      return { data: { id } };
    }
  }

  return notFound();
}

function filterEmployees(request: MockRequest): EmployeeListItem[] {
  const { searchParams } = request;
  let items = [...mockDb.employees];

  const status = searchParams.get("status");
  if (status && status !== "ALL") {
    items = items.filter((e) => e.status === status);
  }

  const departmentId = searchParams.get("departmentId");
  if (departmentId) {
    items = items.filter((e) => e.department?.id === departmentId);
  }

  const filter = searchParams.get("filter");
  if (filter === "missing-badge") {
    items = items.filter((e) => e.flags.missingBadge);
  }
  if (filter === "missing-schedule") {
    items = items.filter((e) => e.flags.missingSchedule);
  }

  const q = searchParams.get("q")?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.registration.includes(q),
    );
  }

  return items;
}

function computeSummary(): EmployeeSummary {
  const active = mockDb.employees.filter((e) => e.status === "ACTIVE");
  return {
    total: mockDb.employees.length,
    active: active.length,
    missingBadge: active.filter((e) => e.flags.missingBadge).length,
    missingSchedule: active.filter((e) => e.flags.missingSchedule).length,
  };
}

export function handleEmployeeRoute(request: MockRequest): HandlerResult {
  const { path, method, body, state } = request;
  const authResult = requireAuth(state);
  if ("error" in authResult) return authResult.error;

  if (path === "/employees/summary" && method === "GET") {
    return { data: computeSummary() };
  }

  if (path === "/employees" && method === "GET") {
    return { data: filterEmployees(request) };
  }

  if (path === "/employees" && method === "POST") {
    const payload = body as {
      name?: string;
      registration?: string;
      departmentId?: string;
    };
    const department = mockDb.departments.find((d) => d.id === payload.departmentId);
    if (!department) return error(400, "Invalid department", "validation_error");

    const employee: EmployeeListItem = {
      id: generateId("employee"),
      name: payload.name?.trim() ?? "",
      registration: payload.registration?.trim() ?? "",
      department: { id: department.id, name: department.name },
      badgeCode: null,
      scheduleName: null,
      status: "ACTIVE",
      flags: { missingBadge: true, missingSchedule: true },
    };
    mockDb.employees.unshift(employee);
    department.employeeCount += 1;
    return { data: employee };
  }

  const detailMatch = path.match(/^\/employees\/([^/]+)$/);
  if (detailMatch?.[1] && method === "GET") {
    const employee = mockDb.employees.find((e) => e.id === detailMatch[1]);
    if (!employee) return error(404, "Employee not found");
    return { data: employee };
  }

  if (detailMatch?.[1] && method === "PUT") {
    const index = mockDb.employees.findIndex((e) => e.id === detailMatch[1]);
    if (index === -1) return error(404, "Employee not found");
    const payload = body as {
      name?: string;
      registration?: string;
      departmentId?: string;
      status?: EmployeeListItem["status"];
    };
    const current = mockDb.employees[index]!;
    if (payload.departmentId && payload.departmentId !== current.department?.id) {
      const oldDept = mockDb.departments.find((d) => d.id === current.department?.id);
      const newDept = mockDb.departments.find((d) => d.id === payload.departmentId);
      if (!newDept) return error(400, "Invalid department", "validation_error");
      if (oldDept) oldDept.employeeCount = Math.max(0, oldDept.employeeCount - 1);
      newDept.employeeCount += 1;
      current.department = { id: newDept.id, name: newDept.name };
    }
    mockDb.employees[index] = {
      ...current,
      name: payload.name?.trim() ?? current.name,
      registration: payload.registration?.trim() ?? current.registration,
      status: payload.status ?? current.status,
    };
    return { data: mockDb.employees[index] };
  }

  return notFound();
}
