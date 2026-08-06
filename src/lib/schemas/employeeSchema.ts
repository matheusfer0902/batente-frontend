import { z } from "zod";
import { employeeStatuses } from "@/types/employee";

export const employeeFormSchema = z.object({
  name: z.string().min(3, "min").max(120, "max"),
  registration: z.string().min(5, "min").max(20, "max"),
  departmentId: z.string().min(1, "required"),
  status: z.enum(employeeStatuses).optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
