import type { EmployeeListItem, EmployeeStatus } from "@/types/employee";

export const EmployeeService = {
  statusTone(status: EmployeeStatus): "active" | "vacation" | "inactive" {
    if (status === "ACTIVE") return "active";
    if (status === "VACATION") return "vacation";
    return "inactive";
  },

  statusKey(status: EmployeeStatus): string {
    return `status.${status}`;
  },

  filterBySearch(
    employees: EmployeeListItem[],
    query: string,
  ): EmployeeListItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.registration.includes(q),
    );
  },
};
