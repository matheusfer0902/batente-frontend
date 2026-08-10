/**
 * Dois vocabulários de propósito, porque o backend expõe dois.
 *
 * `BadgeStatus` é a projeção da **lista** (tela 16): responde "passa ou não
 * passa" e colapsa perdido em bloqueado, revogado em livre.
 *
 * `CredentialStatus` é o enum do banco (`status_credencial`), devolvido pelo
 * detalhe e por toda escrita. A tela 17 precisa dele porque RN-2.5 deixa
 * bloqueado voltar a ativo e **não** deixa perdido — sem distinguir os dois não
 * há como oferecer o botão certo.
 *
 * Não há `EXPIRED`: vencimento é a data em `validUntil`, não um estado.
 */
export const badgeStatuses = ["ACTIVE", "BLOCKED", "UNASSIGNED"] as const;
export type BadgeStatus = (typeof badgeStatuses)[number];

export const credentialStatuses = [
  "ACTIVE",
  "BLOCKED",
  "LOST",
  "REVOKED",
] as const;
export type CredentialStatus = (typeof credentialStatuses)[number];

export interface BadgeEmployeeRef {
  id: string;
  name: string;
}

export interface BadgeListItem {
  id: string;
  code: string;
  status: BadgeStatus;
  employee: BadgeEmployeeRef | null;
  department: string | null;
  linkedAt: string | null;
  passCount: number;
}

export interface BadgeQueryArgs {
  status?: BadgeStatus | "ALL";
  q?: string;
}

/**
 * Detalhe e retorno das escritas.
 *
 * Os quatro campos anuláveis vêm `null` para OPERADOR — ele tem
 * `GRANT UPDATE (revoked_reason)` **sem** `SELECT`: registra por que bloqueou e
 * não lê o motivo dos outros. `null` aqui é "este papel não lê", não "está
 * vazio no banco", e a tela precisa dizer isso em vez de mostrar "—".
 */
export interface CredentialDetail {
  id: string;
  uid: string;
  status: CredentialStatus;
  label: string | null;
  validUntil: string | null;
  employee: { id: string; name: string; registration: string };
  type: "RFID_MIFARE" | null;
  issuedAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
}

export interface IssueBadgePayload {
  employeeId: string;
  uid: string;
  label?: string;
  validUntil?: string;
}

/** Bloqueio, perda e revogação — os três só precisam do motivo. */
export interface BadgeStatusChangePayload {
  id: string;
  reason: string;
}

export interface ReplaceBadgePayload {
  id: string;
  uid: string;
  reason: string;
  label?: string;
  validUntil?: string;
}

/** `credentials_uid_fmt` no banco: hexadecimal, 8 a 20 caracteres. */
export const FORMATO_UID = /^[0-9A-Fa-f]{8,20}$/;

/** `adjustments_justificativa` — motivo que não explica nada parece rastro sem ser. */
export const MOTIVO_MINIMO = 10;
