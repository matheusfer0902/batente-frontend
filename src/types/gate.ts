export interface GateQueueEntry {
  id: string;
  occurredAt: string;
  employeeName: string;
}

export interface GateCredential {
  id: string;
  code: string;
  employeeName: string | null;
  status: "ACTIVE" | "BLOCKED";
}

export interface GateMonitorData {
  queue: GateQueueEntry[];
  credentials: GateCredential[];
  deviceOnline: boolean;
}
