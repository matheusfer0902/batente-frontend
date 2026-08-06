import { describe, expect, it } from "vitest";
import { AccessService } from "@/services/AccessService";
import type { AccessEvent } from "@/types/access";

const EVENT = {
  id: "ev-1",
  occurredAt: "2026-08-06T12:00:00.000Z",
  receivedAt: "2026-08-06T12:00:00.356Z",
  clockDriftMs: 0,
  decision: "GRANTED",
  denialReason: null,
  mode: "ONLINE",
  syncedAt: null,
  badgeCode: "04A2B3C4",
  employee: null,
  device: { id: "d1", name: "Totem", location: "Portaria" },
  doorOpenMs: 3000,
  timeEntry: null,
} satisfies AccessEvent;

describe("AccessService.parseEventListResponse", () => {
  it("aceita array legado do mock", () => {
    const page = AccessService.parseEventListResponse([EVENT]);
    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(1);
  });

  it("aceita página do backend real", () => {
    const page = AccessService.parseEventListResponse({
      items: [EVENT],
      total: 42,
      page: 2,
      limit: 6,
    });
    expect(page.total).toBe(42);
    expect(page.page).toBe(2);
    expect(page.limit).toBe(6);
  });
});
