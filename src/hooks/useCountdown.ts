"use client";

import { useCallback, useSyncExternalStore } from "react";

const TICK_MS = 1000;

interface CountdownState {
  /** `null` no servidor e durante a hidratação — evita divergência de marcação. */
  now: number | null;
  msRemaining: number | null;
  isExpired: boolean;
}

function parseTarget(targetIso: string | null): number | null {
  if (!targetIso) return null;
  const target = new Date(targetIso).getTime();
  return Number.isNaN(target) ? null : target;
}

/**
 * Relógio de UI para contagens regressivas (bloqueio temporário de login).
 * Não é server state: assina um tique de 1s enquanto houver alvo e se
 * desinscreve sozinho quando o prazo termina.
 */
export function useCountdown(targetIso: string | null): CountdownState {
  const target = parseTarget(targetIso);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (target === null) return () => {};

      const intervalId = window.setInterval(() => {
        onStoreChange();
        if (Date.now() >= target) {
          window.clearInterval(intervalId);
        }
      }, TICK_MS);

      return () => window.clearInterval(intervalId);
    },
    [target],
  );

  const getSnapshot = useCallback(
    () => (target === null ? null : Math.floor(Date.now() / TICK_MS) * TICK_MS),
    [target],
  );

  const getServerSnapshot = useCallback(() => null, []);

  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const msRemaining =
    target !== null && now !== null ? Math.max(target - now, 0) : null;

  return { now, msRemaining, isExpired: msRemaining === 0 };
}
