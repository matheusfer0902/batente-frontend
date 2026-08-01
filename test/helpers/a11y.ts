import { axe } from "vitest-axe";

export async function expectNoA11yViolations(container: HTMLElement): Promise<void> {
  const results = await axe(container);
  expect(results.violations).toEqual([]);
}
