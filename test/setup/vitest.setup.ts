import React from "react";
import "@testing-library/jest-dom/vitest";
import "./matchers";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./msw.server";
import { resetTestDb } from "../mocks/db";
import { setMockSession } from "../mocks/handlers/auth.handlers";
import { resetAuthClientState } from "@/redux/reducers/queries/authBaseQuery";

process.env.TZ = "America/Recife";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  resetTestDb();

  // Estado de módulo não morre com o componente. `csrfToken` e `refreshEmVoo`
  // vivem em `lib/csrf.ts` / `authBaseQuery.ts`, e a sessão do mock vive em
  // `auth.handlers.ts` — sem isto, um teste que faz login deixa o próximo já
  // autenticado, e um token CSRF obtido aqui satisfaz uma asserção lá.
  resetAuthClientState();
  setMockSession(null);

  cleanup();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: IntersectionObserverMock,
});

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

Element.prototype.scrollIntoView = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) =>
    React.createElement("a", { href, ...props }, children),
}));
