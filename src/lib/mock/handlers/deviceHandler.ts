import type {
  CreateDevicePayload,
  DeviceDetail,
  DeviceEventLog,
  DeviceListItem,
} from "@/types/device";
import { generateId, mockDb, readPrimaryDevice } from "@/lib/mock/mockDb";
import {
  error,
  notFound,
  requireAuth,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

/** Cenários em que o totem perdeu contato com o painel. */
const OFFLINE_SCENARIOS = new Set(["degradado", "offline"]);

const OFFLINE_SINCE_MINUTES = 12;
const OFFLINE_PENDING_UPLOADS = 14;

function toOfflineListItem(device: DeviceListItem): DeviceListItem {
  return {
    ...device,
    status: "OFFLINE",
    lastContactAt: new Date(
      Date.now() - OFFLINE_SINCE_MINUTES * 60 * 1000,
    ).toISOString(),
    clockDriftMs: null,
    pendingUploads: OFFLINE_PENDING_UPLOADS,
  };
}

function toListItem(): DeviceListItem {
  const primary = readPrimaryDevice();
  const stored = mockDb.deviceDetails[primary.id];
  return {
    ...primary,
    firmwareVersion: stored?.firmwareVersion ?? "v2.4.1",
    serialNumber: stored?.serialNumber ?? "BT-0001-0042",
  };
}

const DEFAULT_EVENTS: DeviceEventLog[] = [
  {
    id: "dev-ev-1",
    occurredAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    message: "Sincronização concluída · 6 registros aceitos",
    tone: "ok",
  },
  {
    id: "dev-ev-2",
    occurredAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    message: "Reconectado à rede após 12min offline",
    tone: "contingency",
  },
  {
    id: "dev-ev-3",
    occurredAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    message: "Perda de conexão · totem seguiu decidindo local",
    tone: "contingency",
  },
];

export function handleDeviceRoute({
  path,
  method,
  body,
  scenario,
  state,
}: MockRequest): HandlerResult {
  const authResult = requireAuth(state);
  if ("error" in authResult) {
    return authResult.error;
  }

  if (path === "/devices/primary" && method === "GET") {
    const device = toListItem();
    return {
      data:
        scenario && OFFLINE_SCENARIOS.has(scenario) ? toOfflineListItem(device) : device,
    };
  }

  if (path === "/devices" && method === "GET") {
    const device = toListItem();
    const list =
      scenario && OFFLINE_SCENARIOS.has(scenario) ? [toOfflineListItem(device)] : [device];
    return { data: list };
  }

  if (path === "/devices" && method === "POST") {
    const payload = body as CreateDevicePayload;
    if (!payload.name?.trim() || !payload.location?.trim()) {
      return error(400, "Invalid payload", "validation_error");
    }
    const id = generateId("device");
    const device: DeviceListItem = {
      id,
      name: payload.name.trim(),
      location: payload.location.trim(),
      status: "OFFLINE",
      lastContactAt: new Date().toISOString(),
      clockDriftMs: null,
      pendingUploads: 0,
      firmwareVersion: "v0.0.0",
      serialNumber: payload.serialNumber?.trim() || "BT-0000-0000",
    };
    mockDb.deviceDetails[id] = {
      ...device,
      doorOpenMs: payload.doorOpenMs ?? 3000,
      badgeListVersion: "0",
      badgeListSyncedAt: null,
      recentEvents: [],
    };
    return {
      data: {
        device,
        secretKey: `bt_sk_${crypto.randomUUID().replace(/-/g, "")}`,
      },
    };
  }

  const detailMatch = path.match(/^\/devices\/([^/]+)$/);
  if (detailMatch?.[1] && method === "GET") {
    const id = detailMatch[1];
    const listItem = toListItem();
    if (listItem.id !== id) return error(404, "Device not found");
    const extra = mockDb.deviceDetails[id];
    const detail: DeviceDetail = {
      ...listItem,
      doorOpenMs: extra?.doorOpenMs ?? 3000,
      badgeListVersion: extra?.badgeListVersion ?? "1842",
      badgeListSyncedAt: extra?.badgeListSyncedAt ?? new Date().toISOString(),
      recentEvents: extra?.recentEvents.length
        ? extra.recentEvents
        : DEFAULT_EVENTS,
    };
    return { data: detail };
  }

  const rotateMatch = path.match(/^\/devices\/([^/]+)\/rotate-key$/);
  if (rotateMatch?.[1] && method === "POST") {
    const listItem = toListItem();
    if (listItem.id !== rotateMatch[1]) return error(404, "Device not found");
    return {
      data: {
        device: listItem,
        secretKey: `bt_sk_${crypto.randomUUID().replace(/-/g, "")}`,
      },
    };
  }

  return notFound();
}
