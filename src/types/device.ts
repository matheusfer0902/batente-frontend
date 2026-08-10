/** Situação de rede, derivada do último heartbeat. Não é coluna do banco. */
export const deviceStatuses = ["ONLINE", "OFFLINE"] as const;
export type DeviceStatus = (typeof deviceStatuses)[number];

/**
 * Situação cadastral (`status_dispositivo`) — o que o ADMIN controla.
 *
 * `DISABLED` é o estado de totem furtado: `fn_verificar_dispositivo` recusa a
 * chave dele, e rotacionar **não** o traz de volta.
 */
export const deviceLifecycles = ["ACTIVE", "MAINTENANCE", "DISABLED"] as const;
export type DeviceLifecycle = (typeof deviceLifecycles)[number];

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
  lifecycle: DeviceLifecycle;
  firmwareVersion: string | null;
  serialNumber: string | null;
}

export interface DeviceDetail extends DeviceListItem {
  installedAt: string;
  /** `null` = herda a trava global de `system_settings.lock.pulse_ms`. */
  doorOpenMs: number | null;
  effectiveDoorOpenMs: number;
  /** `devices.snapshot_version` — versão da lista de crachás no servidor. */
  badgeListVersion: number;
}

export interface CreateDevicePayload {
  name: string;
  location?: string;
  serialNumber?: string;
  doorOpenMs?: number;
}

export interface UpdateDevicePayload {
  id: string;
  name?: string;
  location?: string;
  serialNumber?: string;
  doorOpenMs?: number;
  lifecycle?: DeviceLifecycle;
}

/**
 * Cadastro e rotação devolvem a chave **uma única vez**.
 *
 * O banco guarda só o SHA-256. `firmwareSnippet` já vem no formato dos
 * `#define` do `secrets.h`, que é o mesmo que `npm run db:seed:device` imprime
 * — quem provisiona o totem copia e cola sem traduzir nada.
 */
export interface DeviceWithSecret {
  device: DeviceDetail;
  secretKey: string;
  firmwareSnippet: string;
}

export interface DeviceQueryArgs {
  scenario?: string;
}
