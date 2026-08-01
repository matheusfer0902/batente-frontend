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

export interface DeviceQueryArgs {
  scenario?: string;
}
