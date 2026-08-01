/** RN-1.6 / RN-9.8 — OPERADOR não deve ver dados trabalhistas. */
const LABOR_DATA_PATTERNS = [
  /espelho/i,
  /jornada/i,
  /marcação/i,
  /horas\s+extras/i,
  /banco\s+de\s+horas/i,
  /INCONSISTENT/i,
  /ODD_PUNCH_COUNT/i,
];

export function toContainNoLaborData(received: HTMLElement) {
  const text = received.textContent ?? "";
  const matches = LABOR_DATA_PATTERNS.filter((pattern) => pattern.test(text));
  const pass = matches.length === 0;

  return {
    pass,
    message: () =>
      pass
        ? "Expected labor data to be present"
        : `Labor data found matching: ${matches.map(String).join(", ")}`,
  };
}

declare module "vitest" {
  interface Assertion {
    toContainNoLaborData(): void;
  }
}
