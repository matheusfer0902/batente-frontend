import type { CredentialStatus } from "@/types/badge";

/**
 * Traduções das recusas do backend, por `code`.
 *
 * Comparar `code` e não `message`: a mensagem é texto para humano e muda; o
 * `code` é o contrato do `PostgresErrorFilter`. Cada entrada aqui corresponde a
 * uma constraint ou gatilho no banco — o que a interface faz é dar nome ao que
 * o Postgres recusou, não repetir a regra.
 */
export const BADGE_ERROR_KEYS: Record<string, string> = {
  employee_already_has_active_credential: "badge:errors.employeeHasBadge",
  uid_already_active: "badge:errors.uidTaken",
  uid_format_invalid: "badge:errors.uidFormat",
  validity_before_issue: "badge:errors.validityBeforeIssue",
  credential_not_reactivatable: "badge:errors.notReactivatable",
  forbidden_by_role: "badge:errors.forbidden",
};

/** Ações que a máquina de estados oferece a partir de cada situação. */
export type BadgeAction =
  | "block"
  | "unblock"
  | "loss"
  | "revoke"
  | "replacement";

export class BadgeService {
  /**
   * O que se pode fazer com um crachá neste estado.
   *
   * Espelha `trg_credentials_transicao` (RN-2.5): de `LOST` e `REVOKED` não se
   * volta a `ACTIVE`, e o caminho é a segunda via. Isto **não** é a regra — é a
   * tela evitando oferecer um botão que o banco recusaria. Se divergir, o banco
   * ganha e o usuário vê um 409 traduzido.
   */
  static acoesPara(status: CredentialStatus): readonly BadgeAction[] {
    switch (status) {
      case "ACTIVE":
        return ["block", "loss", "revoke"];
      case "BLOCKED":
        return ["unblock", "loss", "revoke"];
      // Terminais. Só resta emitir outro cartão para a mesma pessoa.
      case "LOST":
      case "REVOKED":
        return ["replacement"];
    }
  }

  /** Ações que exigem motivo — todas menos desbloquear. */
  static exigeMotivo(acao: BadgeAction): boolean {
    return acao !== "unblock";
  }

  static ehTerminal(status: CredentialStatus): boolean {
    return status === "LOST" || status === "REVOKED";
  }
}
