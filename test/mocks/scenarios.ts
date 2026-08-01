import { testDb, resetTestDb, normalizeEmail } from "./db";

export const scenarios = {
  /** Marca um dia como inconsistente — placeholder para M7. */
  diaInconsistente(_opts: { employeeId: string; date: string }): void {
    // Implementação completa na Fase 6 quando existir espelho de ponto.
  },

  periodoFechado(_opts: { from: string; to: string }): void {
    // Implementação completa na Fase 6.
  },

  totemOffline(_opts: { deviceId: string; since: string }): void {
    // Implementação completa na Fase 6.
  },

  contaBloqueada(opts: { email: string; unlockAt: string }): void {
    testDb.loginAttempts[normalizeEmail(opts.email)] = {
      failedAttempts: 5,
      lockedAt: new Date().toISOString(),
      unlockAt: opts.unlockAt,
    };
  },

  servidorIndisponivel(): void {
    testDb.serverUnavailable = true;
  },

  reset(): void {
    resetTestDb();
  },
};
