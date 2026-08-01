"use client";

import { useClock } from "@/hooks/useClock";

function toTimestamp(since: number | string | null | undefined): number | null {
  if (since === null || since === undefined) return null;
  if (typeof since === "number") return Number.isFinite(since) ? since : null;
  const parsed = new Date(since).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Tempo decorrido desde um instante, atualizado a cada segundo.
 * `null` até a montagem no cliente.
 */
export function useElapsed(
  since: number | string | null | undefined,
): number | null {
  const target = toTimestamp(since);
  const now = useClock({ active: target !== null });

  if (target === null || now === null) return null;
  return Math.max(now - target, 0);
}
