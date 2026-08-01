"use client";

import { useCallback, useSyncExternalStore } from "react";

export const DEFAULT_TICK_MS = 1000;

interface UseClockOptions {
  /** Desligado, não assina nada e devolve `null`. */
  active?: boolean;
  tickMs?: number;
  /** Instante em que o tique se encerra sozinho (ex.: fim de um bloqueio). */
  untilMs?: number | null;
}

/**
 * Relógio de UI compartilhado. `null` no servidor e durante a hidratação —
 * o horário do cliente nunca entra no HTML renderizado no servidor.
 */
export function useClock({
  active = true,
  tickMs = DEFAULT_TICK_MS,
  untilMs = null,
}: UseClockOptions = {}): number | null {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!active) return () => {};

      const intervalId = window.setInterval(() => {
        onStoreChange();
        if (untilMs !== null && Date.now() >= untilMs) {
          window.clearInterval(intervalId);
        }
      }, tickMs);

      return () => window.clearInterval(intervalId);
    },
    [active, tickMs, untilMs],
  );

  const getSnapshot = useCallback(
    () => (active ? Math.floor(Date.now() / tickMs) * tickMs : null),
    [active, tickMs],
  );

  const getServerSnapshot = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
