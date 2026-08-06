import { describe, expect, it } from "vitest";
import { z } from "zod";
import { mockDb } from "@/lib/mock/mockDb";
import { API_BASE_URL } from "@/redux/reducers/queries/fetchBaseQuery";
import { testDb, createSession } from "../mocks/db";

const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  employeeCount: z.number(),
});

describe("api.contract", () => {
  it("H2 · listagem de departamentos conforme schema Zod", async () => {
    const token = createSession(testDb.users[0]!.id);

    const response = await fetch(`${API_BASE_URL}/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    const data: unknown = await response.json();
    const parsed = z.array(departmentSchema).safeParse(data);
    expect(parsed.success).toBe(true);
    expect((data as { id: string }[]).length).toBe(mockDb.departments.length);
  });

  it("H2 · departamento individual conforme schema Zod", async () => {
    const token = createSession(testDb.users[0]!.id);
    const departmentId = mockDb.departments[0]!.id;

    const response = await fetch(`${API_BASE_URL}/departments/${departmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    const data: unknown = await response.json();
    const parsed = departmentSchema.safeParse(data);
    expect(parsed.success).toBe(true);
  });
});
