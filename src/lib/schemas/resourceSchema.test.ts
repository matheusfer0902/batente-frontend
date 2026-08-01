import { describe, expect, it, expectTypeOf } from "vitest";
import { resourceFormSchema, type ResourceFormValues } from "@/lib/schemas/resourceSchema";
import type { CreateResourcePayload } from "@/types/resource";

describe("resourceFormSchema", () => {
  it("I5 · rejeita título com menos de 3 caracteres", () => {
    const result = resourceFormSchema.safeParse({
      title: "ab",
      description: "descrição válida com dez chars",
    });
    expect(result.success).toBe(false);
  });

  it("I5 · rejeita título com mais de 100 caracteres", () => {
    const result = resourceFormSchema.safeParse({
      title: "a".repeat(101),
      description: "descrição válida com dez chars",
    });
    expect(result.success).toBe(false);
  });

  it("I5 · aceita valores válidos", () => {
    const result = resourceFormSchema.safeParse({
      title: "Título válido",
      description: "Descrição com mais de dez caracteres.",
    });
    expect(result.success).toBe(true);
  });

  it("I9 · z.infer é compatível com CreateResourcePayload", () => {
    expectTypeOf<ResourceFormValues>().toEqualTypeOf<CreateResourcePayload>();
  });
});
