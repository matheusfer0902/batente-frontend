import type { Department } from "@/types/department";

export const DepartmentService = {
  canDelete(department: Department): boolean {
    return department.employeeCount === 0;
  },

  sortByName(departments: Department[]): Department[] {
    return [...departments].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    );
  },
};
