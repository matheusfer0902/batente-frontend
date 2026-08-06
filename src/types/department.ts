export interface Department {
  id: string;
  name: string;
  /** Quantidade de colaboradores vinculados — usada na exclusão. */
  employeeCount: number;
}

export interface CreateDepartmentPayload {
  name: string;
}

export interface UpdateDepartmentPayload {
  id: string;
  name: string;
}
