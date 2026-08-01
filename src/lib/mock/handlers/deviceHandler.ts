import type { Device } from "@/types/device";
import { readPrimaryDevice } from "@/lib/mock/mockDb";
import {
  notFound,
  requireAuth,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

/** Cenários em que o totem perdeu contato com o painel. */
const OFFLINE_SCENARIOS = new Set(["degradado", "offline"]);

const OFFLINE_SINCE_MINUTES = 12;
const OFFLINE_PENDING_UPLOADS = 14;

function toOffline(device: Device): Device {
  return {
    ...device,
    status: "OFFLINE",
    lastContactAt: new Date(
      Date.now() - OFFLINE_SINCE_MINUTES * 60 * 1000,
    ).toISOString(),
    // Sem contato, o painel não tem como medir o relógio do totem.
    clockDriftMs: null,
    pendingUploads: OFFLINE_PENDING_UPLOADS,
  };
}

export function handleDeviceRoute({
  path,
  method,
  scenario,
  state,
}: MockRequest): HandlerResult {
  const authResult = requireAuth(state);
  if ("error" in authResult) {
    return authResult.error;
  }

  if (path === "/devices/primary" && method === "GET") {
    const device = readPrimaryDevice();
    return {
      data: scenario && OFFLINE_SCENARIOS.has(scenario) ? toOffline(device) : device,
    };
  }

  return notFound();
}
