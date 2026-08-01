import { vi } from "vitest";

export function freezeTime(isoDate: string): void {
  vi.setSystemTime(new Date(isoDate));
}

export function travelTime(ms: number): void {
  vi.advanceTimersByTime(ms);
}

export function restoreTime(): void {
  vi.useRealTimers();
}

export function useFakeTimers(isoDate?: string): void {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  if (isoDate) {
    vi.setSystemTime(new Date(isoDate));
  }
}
