"use client";

import { useTranslation } from "react-i18next";
import { Alert, AlertBody, AlertTitle } from "@/components/ui/alert";
import { AuthService } from "@/services/AuthService";
import type { LoginFailure } from "@/types/auth";

interface LoginAlertProps {
  failure: LoginFailure;
  /** Bloqueio ainda vigente segundo o relógio local. */
  isLocked: boolean;
  /** `mm:ss` restante até a liberação automática. */
  countdownLabel: string;
  /** Fração 0–1 do bloqueio já decorrida. */
  lockProgress: number;
}

/**
 * Traduz uma falha de login no aviso correspondente. Falha de infraestrutura
 * usa a cor de contingência — nunca a cor de negação.
 */
export function LoginAlert({
  failure,
  isLocked,
  countdownLabel,
  lockProgress,
}: LoginAlertProps) {
  const { t } = useTranslation("auth");

  if (failure.code === "account_locked" && isLocked) {
    return (
      <Alert variant="warning">
        <AlertTitle>{t("entry.errors.locked.title")}</AlertTitle>
        <AlertBody className="mt-1.5 mb-3">
          {t("entry.errors.locked.body", {
            attempts: failure.failedAttempts,
            time: countdownLabel,
          })}
        </AlertBody>
        <div
          aria-hidden="true"
          className="h-[3px] overflow-hidden rounded-sm bg-sun/20"
        >
          <div
            className="h-full bg-sun transition-[width] duration-1000 ease-linear"
            style={{ width: `${Math.round(lockProgress * 100)}%` }}
          />
        </div>
      </Alert>
    );
  }

  if (failure.code === "server_unavailable") {
    const attemptTime = AuthService.formatTimeOfDay(failure.occurredAt);

    return (
      <Alert variant="info">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-moon"
          />
          <AlertTitle>{t("entry.errors.unavailable.title")}</AlertTitle>
        </div>
        <AlertBody className="mt-1.5 mb-2.5">
          {t("entry.errors.unavailable.body")}
        </AlertBody>
        <p className="font-mono text-[11px] leading-[1.8] text-n600">
          {attemptTime
            ? t("entry.errors.unavailable.diagnostics", {
                time: attemptTime,
                status: failure.status ?? 503,
              })
            : null}
          {attemptTime ? <br /> : null}
          {t("entry.errors.unavailable.reassurance")}
        </p>
      </Alert>
    );
  }

  const isKnownCredentialFailure = failure.code === "invalid_credentials";

  return (
    <Alert variant="danger">
      <AlertTitle>
        {t(
          isKnownCredentialFailure
            ? "entry.errors.invalidCredentials.title"
            : "entry.errors.unknown.title",
        )}
      </AlertTitle>
      <AlertBody className="mt-1.5">
        {t(
          isKnownCredentialFailure
            ? "entry.errors.invalidCredentials.body"
            : "entry.errors.unknown.body",
        )}
      </AlertBody>
    </Alert>
  );
}
