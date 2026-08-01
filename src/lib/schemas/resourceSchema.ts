import { z } from "zod";

export const resourceFormSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
});

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;
