import { z } from "zod";

export const departmentFormSchema = z.object({
  name: z.string().min(2, "min").max(80, "max"),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;
