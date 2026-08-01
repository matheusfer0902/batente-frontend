"use client";

import { useClock } from "@/hooks/useClock";

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
 * Contagem regressiva para o bloqueio temporário de login. O tique se
 * encerra sozinho quando o prazo termina.
 */
export function useCountdown(targetIso: string | null): CountdownState {
  const target = parseTarget(targetIso);
  const now = useClock({ active: target !== null, untilMs: target });

  const msRemaining =
    target !== null && now !== null ? Math.max(target - now, 0) : null;

  return { now, msRemaining, isExpired: msRemaining === 0 };
}
