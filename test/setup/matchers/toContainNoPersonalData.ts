/** LGPD — CPF e dados pessoais sensíveis. */
const PERSONAL_DATA_PATTERNS = [
  /\d{3}\.\d{3}\.\d{3}-\d{2}/,
  /\bCPF\b/i,
  /atestado/i,
];

export function toContainNoPersonalData(received: HTMLElement) {
  const text = received.textContent ?? "";
  const matches = PERSONAL_DATA_PATTERNS.filter((pattern) => pattern.test(text));
  const pass = matches.length === 0;

  return {
    pass,
    message: () =>
      pass
        ? "Expected personal data to be present"
        : `Personal data found matching: ${matches.map(String).join(", ")}`,
  };
}

declare module "vitest" {
  interface Assertion {
    toContainNoPersonalData(): void;
  }
}
