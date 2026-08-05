import { describe, expect, it } from "vitest";
import { AuthService } from "@/services/AuthService";
import {
  LOGIN_ATTEMPTS_HINT_THRESHOLD,
  MAX_LOGIN_ATTEMPTS,
  type LoginFailure,
} from "@/types/auth";

function falha(overrides: Partial<LoginFailure> = {}): LoginFailure {
  return {
    code: "invalid_credentials",
    failedAttempts: 0,
    remainingAttempts: MAX_LOGIN_ATTEMPTS,
    lockedAt: null,
    unlockAt: null,
    occurredAt: null,
    status: null,
    ...overrides,
  };
}

describe("AuthService.resolveLandingRoute", () => {
  it("manda ADMIN e RH para o painel", () => {
    expect(AuthService.resolveLandingRoute("ADMIN")).toBe("/inicio");
    expect(AuthService.resolveLandingRoute("RH")).toBe("/inicio");
  });

  it("manda OPERADOR para a portaria", () => {
    expect(AuthService.resolveLandingRoute("OPERADOR")).toBe("/portaria");
  });

  it("devolve a tela de entrada quando não há papel", () => {
    expect(AuthService.resolveLandingRoute(null)).toBe("/login");
    expect(AuthService.resolveLandingRoute(undefined)).toBe("/login");
  });
});

describe("AuthService.resolveAuthenticatedRoute", () => {
  it("respeita o papel quando ele é reconhecível", () => {
    expect(AuthService.resolveAuthenticatedRoute("OPERADOR")).toBe("/portaria");
    expect(AuthService.resolveAuthenticatedRoute("RH")).toBe("/inicio");
  });

  it("nunca devolve /login — isso criaria laço de redirecionamento", () => {
    // arrange
    const entradasSuspeitas = [null, undefined, "", "SUPERADMIN", 42, {}];

    // act / assert
    for (const entrada of entradasSuspeitas) {
      expect(AuthService.resolveAuthenticatedRoute(entrada)).not.toBe("/login");
    }
    expect(AuthService.resolveAuthenticatedRoute(null)).toBe("/inicio");
  });
});

describe("AuthService.isUserRole", () => {
  it("reconhece os três papéis e recusa o resto", () => {
    expect(AuthService.isUserRole("ADMIN")).toBe(true);
    expect(AuthService.isUserRole("RH")).toBe(true);
    expect(AuthService.isUserRole("OPERADOR")).toBe(true);
    expect(AuthService.isUserRole("admin")).toBe(false);
    expect(AuthService.isUserRole(null)).toBe(false);
  });
});

describe("AuthService.parseLoginFailure", () => {
  it("prefere o code estável do corpo ao status HTTP", () => {
    // act
    const resultado = AuthService.parseLoginFailure({
      status: 401,
      data: { message: "qualquer texto", code: "account_locked" },
    });

    // assert
    expect(resultado.code).toBe("account_locked");
  });

  it("deriva invalid_credentials de 401 e 403", () => {
    expect(
      AuthService.parseLoginFailure({ status: 401, data: { message: "x" } })
        .code,
    ).toBe("invalid_credentials");
    expect(
      AuthService.parseLoginFailure({ status: 403, data: { message: "x" } })
        .code,
    ).toBe("invalid_credentials");
  });

  it("deriva account_locked de 423 e 429", () => {
    expect(
      AuthService.parseLoginFailure({ status: 423, data: { message: "x" } })
        .code,
    ).toBe("account_locked");
    expect(
      AuthService.parseLoginFailure({ status: 429, data: { message: "x" } })
        .code,
    ).toBe("account_locked");
  });

  it("deriva server_unavailable de indisponibilidade e de erro de rede", () => {
    for (const status of [0, 502, 503, 504, "FETCH_ERROR", "TIMEOUT_ERROR"]) {
      expect(
        AuthService.parseLoginFailure({ status, data: { message: "x" } }).code,
      ).toBe("server_unavailable");
    }
  });

  it("cai em unknown quando não há como classificar", () => {
    expect(AuthService.parseLoginFailure(null).code).toBe("unknown");
    expect(AuthService.parseLoginFailure({ status: 418 }).code).toBe("unknown");
  });

  it("lê os detalhes de bloqueio quando o servidor os envia", () => {
    // act
    const resultado = AuthService.parseLoginFailure({
      status: 423,
      data: {
        message: "locked",
        code: "account_locked",
        details: {
          failedAttempts: 5,
          remainingAttempts: 0,
          lockedAt: "2026-08-05T12:00:00.000Z",
          unlockAt: "2026-08-05T12:15:00.000Z",
          occurredAt: "2026-08-05T12:00:00.000Z",
        },
      },
    });

    // assert
    expect(resultado.failedAttempts).toBe(5);
    expect(resultado.remainingAttempts).toBe(0);
    expect(resultado.unlockAt).toBe("2026-08-05T12:15:00.000Z");
    expect(resultado.status).toBe(423);
  });

  it("calcula as tentativas restantes quando o servidor só informa as falhas", () => {
    // act
    const resultado = AuthService.parseLoginFailure({
      status: 401,
      data: { message: "x", details: { failedAttempts: 3 } },
    });

    // assert
    expect(resultado.remainingAttempts).toBe(MAX_LOGIN_ATTEMPTS - 3);
  });
});

describe("AuthService.sessionConfirmationFailure", () => {
  it("descreve o login aceito cuja identidade não pôde ser confirmada", () => {
    // act
    const resultado = AuthService.sessionConfirmationFailure();

    // assert — sem status HTTP: o POST deu 204, quem falhou foi a confirmação
    expect(resultado.code).toBe("unknown");
    expect(resultado.status).toBeNull();
    expect(resultado.unlockAt).toBeNull();
  });

  it("não é tratada como bloqueio nem como indisponibilidade", () => {
    // act
    const resultado = AuthService.sessionConfirmationFailure();

    // assert
    expect(AuthService.isLockActive(resultado, Date.now())).toBe(false);
    expect(AuthService.shouldShowRemainingAttempts(resultado)).toBe(false);
  });
});

describe("AuthService.shouldShowRemainingAttempts", () => {
  it(`só mostra o contador a partir da ${LOGIN_ATTEMPTS_HINT_THRESHOLD}ª falha`, () => {
    expect(
      AuthService.shouldShowRemainingAttempts(
        falha({ failedAttempts: 2, remainingAttempts: 3 }),
      ),
    ).toBe(false);
    expect(
      AuthService.shouldShowRemainingAttempts(
        falha({ failedAttempts: 3, remainingAttempts: 2 }),
      ),
    ).toBe(true);
  });

  it("não mostra contador sem tentativas restantes nem para outros códigos", () => {
    expect(
      AuthService.shouldShowRemainingAttempts(
        falha({ failedAttempts: 5, remainingAttempts: 0 }),
      ),
    ).toBe(false);
    expect(
      AuthService.shouldShowRemainingAttempts(
        falha({ code: "server_unavailable", failedAttempts: 4 }),
      ),
    ).toBe(false);
    expect(AuthService.shouldShowRemainingAttempts(null)).toBe(false);
  });
});

describe("AuthService.isLockActive", () => {
  const referencia = new Date("2026-08-05T12:00:00.000Z").getTime();

  it("reconhece bloqueio vigente", () => {
    expect(
      AuthService.isLockActive(
        falha({ code: "account_locked", unlockAt: "2026-08-05T12:10:00.000Z" }),
        referencia,
      ),
    ).toBe(true);
  });

  it("reconhece bloqueio já expirado", () => {
    expect(
      AuthService.isLockActive(
        falha({ code: "account_locked", unlockAt: "2026-08-05T11:59:00.000Z" }),
        referencia,
      ),
    ).toBe(false);
  });

  it("não considera bloqueio uma falha de outro código", () => {
    expect(
      AuthService.isLockActive(
        falha({ unlockAt: "2026-08-05T12:10:00.000Z" }),
        referencia,
      ),
    ).toBe(false);
  });
});

describe("AuthService.millisecondsUntilUnlock", () => {
  it("mede o tempo restante e nunca fica negativo", () => {
    const referencia = new Date("2026-08-05T12:00:00.000Z").getTime();

    expect(
      AuthService.millisecondsUntilUnlock(
        falha({ unlockAt: "2026-08-05T12:05:00.000Z" }),
        referencia,
      ),
    ).toBe(5 * 60 * 1000);

    expect(
      AuthService.millisecondsUntilUnlock(
        falha({ unlockAt: "2026-08-05T11:00:00.000Z" }),
        referencia,
      ),
    ).toBe(0);
  });
});

describe("AuthService.formatCountdown", () => {
  it("formata como mm:ss com dois dígitos", () => {
    expect(AuthService.formatCountdown(0)).toBe("00:00");
    expect(AuthService.formatCountdown(9_000)).toBe("00:09");
    expect(AuthService.formatCountdown(15 * 60 * 1000)).toBe("15:00");
  });

  it("arredonda para cima para não exibir 00:00 com tempo restante", () => {
    expect(AuthService.formatCountdown(1)).toBe("00:01");
  });
});

describe("AuthService.lockoutProgress", () => {
  const inicio = "2026-08-05T12:00:00.000Z";
  const fim = "2026-08-05T12:10:00.000Z";

  it("mede a fração decorrida do bloqueio", () => {
    const meio = new Date("2026-08-05T12:05:00.000Z").getTime();
    expect(
      AuthService.lockoutProgress(
        falha({ lockedAt: inicio, unlockAt: fim }),
        meio,
      ),
    ).toBeCloseTo(0.5);
  });

  it("mantém o resultado entre 0 e 1", () => {
    const antes = new Date("2026-08-05T11:00:00.000Z").getTime();
    const depois = new Date("2026-08-05T13:00:00.000Z").getTime();
    const registro = falha({ lockedAt: inicio, unlockAt: fim });

    expect(AuthService.lockoutProgress(registro, antes)).toBe(0);
    expect(AuthService.lockoutProgress(registro, depois)).toBe(1);
  });

  it("devolve 0 quando faltam as datas ou o intervalo é degenerado", () => {
    expect(AuthService.lockoutProgress(null, Date.now())).toBe(0);
    expect(AuthService.lockoutProgress(falha(), Date.now())).toBe(0);
    expect(
      AuthService.lockoutProgress(
        falha({ lockedAt: fim, unlockAt: inicio }),
        Date.now(),
      ),
    ).toBe(0);
  });
});

describe("AuthService.formatTimeOfDay", () => {
  it("devolve null para entrada ausente ou inválida", () => {
    expect(AuthService.formatTimeOfDay(null)).toBeNull();
    expect(AuthService.formatTimeOfDay("nao-e-data")).toBeNull();
  });

  it("formata HH:MM:SS no fuso do cliente", () => {
    // O setup fixa TZ=America/Recife (UTC-3).
    expect(AuthService.formatTimeOfDay("2026-08-05T12:00:00.000Z")).toBe(
      "09:00:00",
    );
  });
});

describe("AuthService.landingRoutes", () => {
  it("lista os destinos sem repetição", () => {
    expect([...AuthService.landingRoutes].sort()).toEqual([
      "/inicio",
      "/portaria",
    ]);
  });
});
