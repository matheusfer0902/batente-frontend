import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const SERVICES_DIR = path.join(process.cwd(), "src/services");
const UI_DIR = path.join(process.cwd(), "src/components/ui");

describe("arch.layers", () => {
  it("services não importam React nem Redux", () => {
    const files = readdirSync(SERVICES_DIR).filter(
      (file) => file.endsWith(".ts") && !file.endsWith(".test.ts"),
    );

    for (const file of files) {
      const content = readFileSync(path.join(SERVICES_DIR, file), "utf8");
      expect(content, file).not.toMatch(/from ["']react/);
      expect(content, file).not.toMatch(/@\/redux\//);
    }
  });

  it("components/ui não importam domínio (hooks, redux, services de feature)", () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(fullPath);
        return entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")
          ? [fullPath]
          : [];
      });

    for (const file of walk(UI_DIR)) {
      const content = readFileSync(file, "utf8");
      const relative = path.relative(process.cwd(), file);
      expect(content, relative).not.toMatch(/@\/hooks\//);
      expect(content, relative).not.toMatch(/@\/redux\//);
      expect(content, relative).not.toMatch(/@\/services\//);
    }
  });
});
