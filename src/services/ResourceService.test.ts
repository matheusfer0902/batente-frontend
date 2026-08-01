import { describe, expect, it } from "vitest";
import { ResourceService } from "@/services/ResourceService";
import type { Resource } from "@/types/resource";

const baseResource: Resource = {
  id: "r-1",
  title: "  Título  ",
  description: "Descrição longa ".repeat(20),
  ownerId: "user-1",
  createdAt: "2026-07-31T12:00:00.000Z",
  updatedAt: "2026-07-31T12:00:00.000Z",
};

describe("ResourceService", () => {
  describe("sortByUpdatedAt", () => {
    it("I3 · ordena do mais recente ao mais antigo", () => {
      const resources: Resource[] = [
        { ...baseResource, id: "a", updatedAt: "2026-07-29T12:00:00.000Z" },
        { ...baseResource, id: "b", updatedAt: "2026-07-31T12:00:00.000Z" },
        { ...baseResource, id: "c", updatedAt: "2026-07-30T12:00:00.000Z" },
      ];

      const sorted = ResourceService.sortByUpdatedAt(resources);
      expect(sorted.map((r) => r.id)).toEqual(["b", "c", "a"]);
    });

    it("I3 · mantém ordem estável para datas iguais", () => {
      const resources: Resource[] = [
        { ...baseResource, id: "first" },
        { ...baseResource, id: "second" },
      ];

      const sorted = ResourceService.sortByUpdatedAt(resources);
      expect(sorted.map((r) => r.id)).toEqual(["first", "second"]);
    });

    it("I3 · retorna lista vazia sem erro", () => {
      expect(ResourceService.sortByUpdatedAt([])).toEqual([]);
    });
  });

  describe("toCardViewModel", () => {
    it("I4 · não perde campos nem inventa valores", () => {
      const viewModel = ResourceService.toCardViewModel(baseResource);

      expect(viewModel.id).toBe("r-1");
      expect(viewModel.displayTitle).toBe("Título");
      expect(viewModel.ownerId).toBe("user-1");
      expect(viewModel.summary.endsWith("…")).toBe(true);
      expect(viewModel.updatedLabel).toBeTruthy();
    });
  });

  describe("filterBySearch", () => {
    it("filtra por título ou descrição", () => {
      const resources: Resource[] = [
        { ...baseResource, id: "1", title: "Alpha", description: "x" },
        { ...baseResource, id: "2", title: "Beta", description: "gamma" },
      ];

      expect(ResourceService.filterBySearch(resources, "alpha")).toHaveLength(1);
      expect(ResourceService.filterBySearch(resources, "gamma")).toHaveLength(1);
      expect(ResourceService.filterBySearch(resources, "")).toHaveLength(2);
    });
  });
});
