"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/skeleton";
import { useCanMutate } from "@/hooks/useCanMutate";
import { useScheduleList } from "@/hooks/useScheduleList";
import { ScheduleService } from "@/services/ScheduleService";
import type { Weekday } from "@/types/schedule";

/**
 * Tela 19 — os modelos de jornada.
 *
 * Cartão em vez de tabela porque o que identifica uma escala é o **resumo dos
 * dias** ("SEG A SEX · 08:00–12:00 · 13:00–17:48"), que não cabe numa célula.
 */
export function ScheduleList() {
  const { t } = useTranslation(["schedule", "common"]);
  const { schedules, uncoveredCount, isLoading, isError, retry } =
    useScheduleList();
  const { canCreate } = useCanMutate("schedules");

  const nomeDoDia = (weekday: Weekday) => t(`schedule:weekdayShort.${weekday}`);

  return (
    <>
      <PageHeader
        title={t("schedule:title")}
        subtitle={t("schedule:subtitle", { count: schedules.length })}
        actions={
          canCreate ? (
            <Button asChild size="entryInline">
              <Link href="/escalas/nova">{t("schedule:create")}</Link>
            </Button>
          ) : null
        }
      />

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={retry}
        isEmpty={schedules.length === 0}
        skeleton={<SkeletonText lines={6} className="p-6" />}
        empty={
          <EmptyState
            title={t("schedule:empty")}
            className="mx-auto max-w-md py-16"
          />
        }
      >
        <div className="space-y-3 px-5 py-5 md:px-8">
          {schedules.map((escala) => (
            <Link
              key={escala.id}
              href={`/escalas/${escala.id}`}
              className="block rounded-sm border border-border bg-gun-950 px-5 py-4 transition-colors hover:border-chart"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-display text-[15px] text-linen">
                  {escala.name}
                </span>
                {!escala.active ? (
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
                    {t("schedule:inactive")}
                  </span>
                ) : null}
              </div>

              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-n300">
                {ScheduleService.summarize(escala.days, nomeDoDia)}
              </p>

              <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-n400">
                <span>
                  {t("schedule:load")}{" "}
                  <span className="text-linen">
                    {ScheduleService.formatMinutes(escala.weeklyMinutes)}
                  </span>
                </span>
                <span>
                  {t("schedule:tolerance")}{" "}
                  <span className="text-linen">
                    {t("schedule:minutes", { count: escala.toleranceMinutes })}
                  </span>
                </span>
                <span>
                  {t("schedule:minBreak")}{" "}
                  <span className="text-linen">
                    {escala.minBreakMinutes > 0
                      ? t("schedule:minutes", { count: escala.minBreakMinutes })
                      : "—"}
                  </span>
                </span>
                <span>
                  {t("schedule:people", { count: escala.employeeCount })}
                </span>
              </div>
            </Link>
          ))}

          {/* O alerta da tela 19. Sem escala vigente a marcação não é
              classificável (RN-6.2) e o mês não fecha. */}
          {uncoveredCount > 0 ? (
            <Alert variant="warning">
              <strong className="block">
                {t("schedule:uncovered.title", { count: uncoveredCount })}
              </strong>
              {t("schedule:uncovered.body")}{" "}
              <Link
                href="/colaboradores?filtro=sem-escala"
                className="underline underline-offset-2"
              >
                {t("schedule:uncovered.link")}
              </Link>
            </Alert>
          ) : null}
        </div>
      </DataBoundary>
    </>
  );
}
