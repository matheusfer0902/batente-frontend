export const deviceStatuses = ["ONLINE", "OFFLINE"] as const;
export type DeviceStatus = (typeof deviceStatuses)[number];

export interface Device {
  id: string;
  name: string;
  location: string;
  status: DeviceStatus;
  /** ISO — último batimento recebido pelo painel. */
  lastContactAt: string;
  /** `null` enquanto offline: o painel não tem como medir. */
  clockDriftMs: number | null;
  /** Registros que o totem ainda não conseguiu enviar. */
  pendingUploads: number;
}

/** Item da listagem admin — estende telemetria básica. */
export interface DeviceListItem extends Device {
  firmwareVersion: string;
  serialNumber: string;
}

export interface DeviceEventLog {
  id: string;
  occurredAt: string;
  message: string;
  tone: "ok" | "contingency" | "error";
}

export interface DeviceDetail extends DeviceListItem {
  doorOpenMs: number;
  badgeListVersion: string;
  badgeListSyncedAt: string | null;
  recentEvents: DeviceEventLog[];
}

export interface CreateDevicePayload {
  name: string;
  location: string;
  serialNumber: string;
  doorOpenMs: number;
}

export interface CreateDeviceResult {
  device: DeviceListItem;
  /** Exibida uma única vez após cadastro ou rotação. */
  secretKey: string;
}

export interface DeviceQueryArgs {
  scenario?: string;
}
