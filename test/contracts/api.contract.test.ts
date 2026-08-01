import { describe, expect, it } from "vitest";
import { z } from "zod";
import { API_BASE_URL } from "@/redux/reducers/queries/fetchBaseQuery";
import { testDb, createSession } from "../mocks/db";

const resourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

describe("api.contract", () => {
  it("H2 · listagem de recursos conforme schema Zod", async () => {
    const token = createSession(testDb.users[0]!.id);

    const response = await fetch(`${API_BASE_URL}/resources`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    const data: unknown = await response.json();
    const parsed = z.array(resourceSchema).safeParse(data);
    expect(parsed.success).toBe(true);
  });

  it("H2 · recurso individual conforme schema Zod", async () => {
    const token = createSession(testDb.users[0]!.id);
    const resourceId = testDb.resources[0]!.id;

    const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    const data: unknown = await response.json();
    const parsed = resourceSchema.safeParse(data);
    expect(parsed.success).toBe(true);
  });
});
