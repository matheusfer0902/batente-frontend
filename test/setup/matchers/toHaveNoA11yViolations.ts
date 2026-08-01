import { axe } from "vitest-axe";

export async function toHaveNoA11yViolations(received: HTMLElement) {
  const results = await axe(received);
  const pass = results.violations.length === 0;

  return {
    pass,
    message: () =>
      pass
        ? "Expected element to have a11y violations"
        : `A11y violations:\n${results.violations
            .map((v) => `- ${v.id}: ${v.description}\n  ${v.help}`)
            .join("\n")}`,
  };
}

declare module "vitest" {
  interface Assertion {
    toHaveNoA11yViolations(): Promise<void>;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoA11yViolations(): Promise<void>;
  }
}
