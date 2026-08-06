import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { namespaces, languages } from "@/lib/i18n/settings";

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

function loadLocale(lng: string, ns: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(
      path.join(process.cwd(), "src/locales", lng, `${ns}.json`),
      "utf8",
    ),
  ) as Record<string, unknown>;
}

describe("i18n.locale-parity", () => {
  it("pt e en expõem as mesmas chaves em todos os namespaces", () => {
    const [ptLng, enLng] = languages;

    for (const ns of namespaces) {
      const ptKeys = flattenKeys(loadLocale(ptLng, ns)).sort();
      const enKeys = flattenKeys(loadLocale(enLng, ns)).sort();
      expect(enKeys, `namespace ${ns}`).toEqual(ptKeys);
    }
  });
});
