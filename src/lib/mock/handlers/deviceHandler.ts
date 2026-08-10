import type {
  CreateDevicePayload,
  DeviceDetail,
  DeviceListItem,
  DeviceWithSecret,
  UpdateDevicePayload,
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

/** Espelha `system_settings.lock.pulse_ms`, semeado com 3000. */
const TRAVA_GLOBAL_MS = 3000;

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
    lifecycle: stored?.lifecycle ?? "ACTIVE",
    firmwareVersion: stored?.firmwareVersion ?? "v2.4.1",
    serialNumber: stored?.serialNumber ?? "BT-0001-0042",
  };
}

/**
 * O bloco do `secrets.h`, no mesmo formato do backend.
 *
 * Se o mock respondesse outra coisa, a tela pareceria funcionar em demo e
 * quebraria no cutover — que é justamente o que o Plano B existe para evitar.
 */
function comSegredo(device: DeviceDetail): DeviceWithSecret {
  const secretKey = crypto.randomUUID().replace(/-/g, "");

  return {
    device,
    secretKey,
    firmwareSnippet: [
      `#define DEVICE_ID  "${device.id}"`,
      `#define DEVICE_KEY "${secretKey}"`,
    ].join("\n"),
  };
}

function paraDetalhe(listItem: DeviceListItem): DeviceDetail {
  const extra = mockDb.deviceDetails[listItem.id];

  return {
    ...listItem,
    installedAt:
      extra?.installedAt ?? new Date().toISOString().slice(0, 10),
    doorOpenMs: extra?.doorOpenMs ?? null,
    effectiveDoorOpenMs: extra?.doorOpenMs ?? TRAVA_GLOBAL_MS,
    badgeListVersion: extra?.badgeListVersion ?? 1842,
  };
}

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
        scenario && OFFLINE_SCENARIOS.has(scenario)
          ? toOfflineListItem(device)
          : device,
    };
  }

  if (path === "/devices" && method === "GET") {
    const device = toListItem();
    const list =
      scenario && OFFLINE_SCENARIOS.has(scenario)
        ? [toOfflineListItem(device)]
        : [device];

    return { data: list };
  }

  if (path === "/devices" && method === "POST") {
    const payload = body as CreateDevicePayload;

    // Só o nome é obrigatório — igual ao backend. Local e serial são opcionais,
    // e a trava em branco herda a global.
    if (!payload.name?.trim()) {
      return error(400, "Name is required", "validation_error");
    }

    const id = generateId("device");
    const detail: DeviceDetail = {
      id,
      name: payload.name.trim(),
      location: payload.location?.trim() || "—",
      status: "OFFLINE",
      lifecycle: "ACTIVE",
      lastContactAt: new Date().toISOString(),
      clockDriftMs: null,
      pendingUploads: 0,
      firmwareVersion: null,
      serialNumber: payload.serialNumber?.trim() || null,
      installedAt: new Date().toISOString().slice(0, 10),
      doorOpenMs: payload.doorOpenMs ?? null,
      effectiveDoorOpenMs: payload.doorOpenMs ?? TRAVA_GLOBAL_MS,
      badgeListVersion: 0,
    };

    mockDb.deviceDetails[id] = detail;

    return { data: comSegredo(detail) };
  }

  const rotateMatch = path.match(/^\/devices\/([^/]+)\/rotate-key$/);
  if (rotateMatch?.[1] && method === "POST") {
    const listItem = toListItem();
    if (listItem.id !== rotateMatch[1]) return error(404, "Device not found");

    return { data: comSegredo(paraDetalhe(listItem)) };
  }

  const detailMatch = path.match(/^\/devices\/([^/]+)$/);
  if (detailMatch?.[1]) {
    const id = detailMatch[1];
    const listItem = toListItem();
    if (listItem.id !== id) return error(404, "Device not found");

    if (method === "GET") {
      return { data: paraDetalhe(listItem) };
    }

    if (method === "PUT") {
      const payload = body as UpdateDevicePayload;
      const atual = paraDetalhe(listItem);
      const atualizado: DeviceDetail = {
        ...atual,
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.location ? { location: payload.location } : {}),
        ...(payload.serialNumber ? { serialNumber: payload.serialNumber } : {}),
        ...(payload.doorOpenMs !== undefined
          ? {
              doorOpenMs: payload.doorOpenMs,
              effectiveDoorOpenMs: payload.doorOpenMs,
            }
          : {}),
        ...(payload.lifecycle ? { lifecycle: payload.lifecycle } : {}),
      };

      mockDb.deviceDetails[id] = atualizado;

      return { data: atualizado };
    }
  }

  return notFound();
}
