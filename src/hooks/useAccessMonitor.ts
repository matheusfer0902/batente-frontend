"use client";

import { useElapsed } from "@/hooks/useElapsed";
import { useScenario } from "@/hooks/useScenario";
import { toBlockState } from "@/redux/queryState";
import {
  useGetAccessEventListQuery,
  useGetAccessStatsQuery,
} from "@/redux/reducers/queries/accessApi";
import { useGetPrimaryDeviceQuery } from "@/redux/reducers/queries/deviceApi";

/** A tela observa o agora: recarrega sozinha. */
const MONITOR_POLL_MS = 10_000;
const FEED_LIMIT = 6;

/**
 * Monitor de acessos. Distingue os dois silêncios: totem offline (o painel
 * não recebe) e ausência de movimento (ninguém passou).
 */
export function useAccessMonitor() {
  const scenario = useScenario();
  const pollingInterval = MONITOR_POLL_MS;

  const deviceQuery = useGetPrimaryDeviceQuery({ scenario }, { pollingInterval });
  const statsQuery = useGetAccessStatsQuery({ scenario }, { pollingInterval });
  const feedQuery = useGetAccessEventListQuery(
    { limit: FEED_LIMIT, scenario },
    { pollingInterval },
  );

  const events = feedQuery.data ?? [];
  const isDeviceOffline = deviceQuery.data?.status === "OFFLINE";

  return {
    device: toBlockState(deviceQuery),
    stats: toBlockState(statsQuery),
    feed: toBlockState(feedQuery),
    events,
    isDeviceOffline,
    /** Sem eventos e totem vivo: ninguém passou — não é falha. */
    isSilent: !feedQuery.isLoading && events.length === 0,
    /** Idade da última leitura recebida, para o subtítulo "há Xs". */
    lastReadElapsedMs: useElapsed(feedQuery.fulfilledTimeStamp ?? null),
  };
}
