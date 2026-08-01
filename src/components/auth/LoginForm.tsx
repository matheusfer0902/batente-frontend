"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useCountdown } from "@/hooks/useCountdown";
import { AuthService } from "@/services/AuthService";
import {
  buildLoginSchema,
  type LoginFormValues,
} from "@/lib/schemas/authSchema";
import { BrandPanel } from "@/components/auth/BrandPanel";
import { LoginAlert } from "@/components/auth/LoginAlert";
import { Button } from "@/components/ui/button";
import { BusyBars } from "@/components/ui/busy-bars";
import { Eyebrow, eyebrowVariants } from "@/components/ui/eyebrow";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ENTRY_INPUT_CLASS =
  "h-auto rounded-sm border-border bg-gun-950 px-3.5 py-[13px] text-[15px] text-linen placeholder:text-n600 focus-visible:border-moon focus-visible:ring-0 disabled:cursor-default disabled:opacity-100";

export function LoginForm() {
  const { t } = useTranslation("auth");
  const { login, isSubmitting, loginFailure, clearLoginFailure } = useAuth();

  const schema = useMemo(
    () =>
      buildLoginSchema({
        emailRequired: t("entry.validation.emailRequired"),
        emailInvalid: t("entry.validation.emailInvalid"),
        passwordRequired: t("entry.validation.passwordRequired"),
      }),
    [t],
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const unlockAt =
    loginFailure?.code === "account_locked" ? loginFailure.unlockAt : null;
  const { now, msRemaining } = useCountdown(unlockAt);

  // Bloqueio expirado no relógio local devolve a tela ao estado padrão.
  const isLockExpired =
    loginFailure?.code === "account_locked" && msRemaining === 0;
  const failure = loginFailure && !isLockExpired ? loginFailure : null;

  const isLocked = failure?.code === "account_locked";
  const isUnavailable = failure?.code === "server_unavailable";
  const isCredentialError = Boolean(failure) && !isLocked && !isUnavailable;
  const showRemainingAttempts = AuthService.shouldShowRemainingAttempts(failure);

  const dimClass = isSubmitting
    ? "opacity-50"
    : isLocked
      ? "opacity-40"
      : isUnavailable
        ? "opacity-45"
        : null;

  const fieldsDisabled = isSubmitting || isLocked || isUnavailable;

  const onSubmit = async (values: LoginFormValues) => {
    await login(values);
  };

  /** Erro recuperável some assim que o usuário corrige os dados. */
  const dismissRecoverableFailure = () => {
    if (loginFailure && loginFailure.code !== "account_locked") {
      clearLoginFailure();
    }
  };

  return (
    <div className="grid w-full max-w-[1000px] overflow-hidden rounded-sm border border-border bg-gun entry:min-h-[600px] entry:grid-cols-[440px_1fr]">
      <BrandPanel tone={isUnavailable ? "contingency" : "brand"} />

      <div className="flex flex-col justify-center px-6 py-8 entry:px-[72px] entry:py-16">
        <div className="w-full max-w-[400px]">
          <Eyebrow className="mb-3.5">{t("entry.kicker")}</Eyebrow>
          <h1
            className={cn(
              "font-display type-title text-[26px] leading-none tracking-[-0.01em] text-linen",
              failure ? "mb-6" : "mb-[34px]",
            )}
          >
            {t("entry.title")}
          </h1>

          {failure ? (
            <div className="mb-[26px]">
              <LoginAlert
                failure={failure}
                isLocked={isLocked}
                countdownLabel={
                  msRemaining !== null
                    ? AuthService.formatCountdown(msRemaining)
                    : "--:--"
                }
                lockProgress={
                  now !== null ? AuthService.lockoutProgress(failure, now) : 0
                }
              />
            </div>
          ) : null}

          <Form {...form}>
            <form
              noValidate
              aria-busy={isSubmitting}
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className={cn("flex flex-col gap-5", dimClass)}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={eyebrowVariants()}>
                        {t("entry.fields.email")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          autoFocus
                          disabled={fieldsDisabled}
                          placeholder={t("entry.fields.emailPlaceholder")}
                          className={cn(
                            ENTRY_INPUT_CLASS,
                            isCredentialError && "border-cherry",
                          )}
                          onChange={(event) => {
                            field.onChange(event);
                            dismissRecoverableFailure();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className={eyebrowVariants()}>
                        {t("entry.fields.password")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          autoComplete="current-password"
                          disabled={fieldsDisabled}
                          placeholder="••••••••"
                          className={cn(
                            ENTRY_INPUT_CLASS,
                            isCredentialError && "border-cherry",
                          )}
                          onChange={(event) => {
                            field.onChange(event);
                            dismissRecoverableFailure();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isLocked ? (
                  <Button
                    type="submit"
                    variant="inert"
                    size="entry"
                    disabled
                    className="mt-1.5"
                  >
                    {t("entry.actions.submit")}
                  </Button>
                ) : null}
              </div>

              {isSubmitting ? (
                <div
                  role="status"
                  className="mt-[26px] flex min-h-11 items-center justify-center gap-2.5 rounded-sm border border-border bg-n800 px-4 py-[15px]"
                >
                  <BusyBars />
                  <span className="font-display type-action text-sm uppercase tracking-[0.06em] text-n400">
                    {t("entry.actions.verifying")}
                  </span>
                </div>
              ) : null}

              {!isSubmitting && isUnavailable ? (
                <Button
                  type="submit"
                  variant="contingency"
                  size="entry"
                  className="mt-[26px]"
                >
                  {t("entry.actions.retry")}
                </Button>
              ) : null}

              {!isSubmitting && !isLocked && !isUnavailable ? (
                <Button
                  type="submit"
                  variant="brand"
                  size="entry"
                  className="mt-[26px]"
                >
                  {t("entry.actions.submit")}
                </Button>
              ) : null}
            </form>
          </Form>

          <LoginFooterNote
            isLocked={isLocked}
            isUnavailable={isUnavailable}
            showRemainingAttempts={showRemainingAttempts}
            remainingAttempts={failure?.remainingAttempts ?? 0}
          />
        </div>
      </div>
    </div>
  );
}

interface LoginFooterNoteProps {
  isLocked: boolean;
  isUnavailable: boolean;
  showRemainingAttempts: boolean;
  remainingAttempts: number;
}

function LoginFooterNote({
  isLocked,
  isUnavailable,
  showRemainingAttempts,
  remainingAttempts,
}: LoginFooterNoteProps) {
  const { t } = useTranslation("auth");

  if (isUnavailable) return null;

  const noteClass = "mt-6 text-[12.5px] leading-[1.6] text-n600";

  if (isLocked) {
    return <p className={noteClass}>{t("entry.notes.lockedHelp")}</p>;
  }

  if (showRemainingAttempts) {
    return (
      <p className={noteClass}>
        <Trans
          t={t}
          i18nKey="entry.notes.remainingAttempts"
          count={remainingAttempts}
          components={{ strong: <span className="font-mono text-n400" /> }}
        />
      </p>
    );
  }

  return <p className={noteClass}>{t("entry.notes.noSelfService")}</p>;
}
