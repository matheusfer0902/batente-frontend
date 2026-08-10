import { afterEach, describe, expect, it, vi } from "vitest";
import {
  API_ROUTES_AUTH,
  API_ROUTES_CUTOVER,
  parseRealApiPrefixes,
  resolveRealApiPrefixes,
} from "./apiRoutes";

describe("apiRoutes", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("modo real inclui auth e todos os prefixos de painel", () => {
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "real");
    vi.stubEnv("NEXT_PUBLIC_REAL_API_PREFIXES", "");

    const prefixes = resolveRealApiPrefixes();

    for (const route of API_ROUTES_AUTH) {
      expect(prefixes).toContain(route);
    }
    for (const route of API_ROUTES_CUTOVER) {
      expect(prefixes).toContain(route);
    }
  });

  it("REAL_API_PREFIXES=all espelha o cutover completo", () => {
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_REAL_API_PREFIXES", "all");

    expect(parseRealApiPrefixes()).toEqual([...API_ROUTES_CUTOVER]);
    expect(resolveRealApiPrefixes()).toEqual([
      ...API_ROUTES_AUTH,
      ...API_ROUTES_CUTOVER,
    ]);
  });

  it("cutover parcial mantém só os prefixos pedidos", () => {
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_REAL_API_PREFIXES", "/devices,/absences");

    expect(resolveRealApiPrefixes()).toEqual([
      ...API_ROUTES_AUTH,
      "/devices",
      "/absences",
    ]);
  });
});
