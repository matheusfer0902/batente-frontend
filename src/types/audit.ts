export interface AuditActor {
  id: string;
  name: string;
  email: string;
}

export interface AuditLogListItem {
  id: string;
  occurredAt: string;
  actor: AuditActor;
  action: string;
  resource: string;
  summary: string;
}
