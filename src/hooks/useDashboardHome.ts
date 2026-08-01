"use client";

import { useClock } from "@/hooks/useClock";
import { useScenario } from "@/hooks/useScenario";
import { toBlockState } from "@/redux/queryState";
import { useGetAccessEventListQuery } from "@/redux/reducers/queries/accessApi";
import { useGetPrimaryDeviceQuery } from "@/redux/reducers/queries/deviceApi";
import {
  useGetAdjustmentSummaryQuery,
  useGetPendingSummaryQuery,
} from "@/redux/reducers/queries/timekeepingApi";

/** O batimento do totem é a informação mais perecível da tela. */
const DEVICE_POLL_MS = 10_000;
const LATEST_ACCESS_LIMIT = 5;

/**
 * Início: quatro blocos independentes. Cada um tem a própria query, então a
 * falha de um não derruba os outros (estado 2b do design).
 */
export function useDashboardHome() {
  const scenario = useScenario();

  const deviceQuery = useGetPrimaryDeviceQuery(
    { scenario },
    { pollingInterval: DEVICE_POLL_MS },
  );
  const pendingQuery = useGetPendingSummaryQuery({ scenario });
  const adjustmentQuery = useGetAdjustmentSummaryQuery({ scenario });
  const latestAccessQuery = useGetAccessEventListQuery({
    limit: LATEST_ACCESS_LIMIT,
    scenario,
  });

  return {
    device: toBlockState(deviceQuery),
    pending: toBlockState(pendingQuery),
    adjustments: toBlockState(adjustmentQuery),
    latestAccess: toBlockState(latestAccessQuery),
    /** Relógio do cabeçalho; `null` até montar no cliente. */
    now: useClock(),
  };
}
