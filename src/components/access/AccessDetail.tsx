"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AccessTimeline } from "@/components/access/AccessTimeline";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SkeletonText } from "@/components/ui/skeleton";
import { useAccessDetail } from "@/hooks/useAccessDetail";
import { AccessService } from "@/services/AccessService";
import { TimeService } from "@/services/TimeService";
import type { AccessEvent, AccessTimelineStep } from "@/types/access";
import { cn } from "@/lib/utils";

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <Eyebrow
        tone="inherit"
        className="mb-1.5 text-[9.5px] tracking-[0.14em] text-n400"
      >
        {label}
      </Eyebrow>
      <p className="text-sm text-linen">{value}</p>
    </div>
  );
}

function ClockRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-sm border border-border bg-gun-950 px-4 py-3">
      <span className="text-[13.5px] text-n300">{label}</span>
      <span className="font-mono text-sm text-linen">{value}</span>
    </div>
  );
}

function AccessDetailContent({
  event,
  timeline,
}: {
  event: AccessEvent;
  timeline: AccessTimelineStep[];
}) {
  const { t } = useTranslation("access");
  const isGranted = event.decision === "GRANTED";
  const subject = AccessService.subjectLabel(event);

  return (
    <>
      <header className="border-b border-border px-5 py-5 md:px-8">
        <nav className="mb-3 font-mono text-[11px] text-n400">
          <Link href="/monitor" className="transition-colors hover:text-linen">
            {t("detail.breadcrumbMonitor")}
          </Link>
          <span aria-hidden="true"> → </span>
          <span>{t("detail.breadcrumbCurrent")}</span>
        </nav>

        <div className="flex flex-wrap items-start gap-6">
          <div className="min-w-[300px] flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "rounded-[2px] px-2.5 py-0.5 font-mono text-[11px] tracking-[0.14em]",
                  isGranted ? "bg-chart text-gun" : "bg-cherry text-linen",
                )}
              >
                {t(AccessService.decisionLabelKey(event))}
              </span>
              <span className="font-mono text-[11px] text-n400">
                {t("detail.eventId", { id: event.id })}
              </span>
            </div>

            <h1 className="font-display type-action text-3xl tracking-[-0.01em] text-linen">
              {t(subject.key, subject.values)}
            </h1>

            <p className="mt-2 font-mono text-xs text-n400">
              {[
                TimeService.shortDate(event.occurredAt),
                TimeService.clock(event.occurredAt),
                event.device.location,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {event.employee ? (
              <Button asChild variant="quiet" size="entryInline">
                <Link href="/colaboradores">{t("detail.openEmployee")}</Link>
              </Button>
            ) : null}
            <Button asChild variant="quiet" size="entryInline">
              <Link href="/crachas">{t("detail.openBadge")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-px bg-border lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col gap-[22px] bg-gun px-5 py-6 md:px-8">
          <section>
            <Eyebrow className="mb-4">{t("detail.reading.title")}</Eyebrow>
            <div className="grid gap-[18px] sm:grid-cols-2">
              <DetailField
                label={t("detail.reading.badge")}
                value={<span className="font-mono">{event.badgeCode}</span>}
              />
              <DetailField
                label={t("detail.reading.registration")}
                value={
                  <span className="font-mono">
                    {event.employee?.registration ?? "—"}
                  </span>
                }
              />
              <DetailField
                label={t("detail.reading.department")}
                value={event.employee?.department ?? "—"}
              />
              <DetailField
                label={t("detail.reading.device")}
                value={`${event.device.name} · ${event.device.location}`}
              />
            </div>
          </section>

          <section className="border-t border-border pt-[22px]">
            <Eyebrow className="mb-4">{t("detail.clocks.title")}</Eyebrow>
            <div className="flex flex-col gap-3">
              <ClockRow
                label={t("detail.clocks.deviceStamp")}
                value={TimeService.clockWithMillis(event.occurredAt) ?? "—"}
              />
              <ClockRow
                label={t("detail.clocks.serverArrival")}
                value={TimeService.clockWithMillis(event.receivedAt) ?? "—"}
              />
              <div className="flex items-center justify-between gap-3 px-4">
                <span className="font-mono text-[11px] text-n400">
                  {t("detail.clocks.drift")}
                </span>
                <span className="font-mono text-xs text-chart">
                  {TimeService.drift(event.clockDriftMs) ?? "—"}
                </span>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-[22px]">
            <Eyebrow className="mb-3.5">{t("detail.immutable.title")}</Eyebrow>
            <p className="text-[13px] leading-[1.65] text-n400">
              {t("detail.immutable.description")}
            </p>
          </section>
        </div>

        <div className="bg-gun px-5 py-6 md:px-8">
          <Eyebrow className="mb-[18px]">{t("detail.timeline.title")}</Eyebrow>
          <AccessTimeline steps={timeline} />

          <div className="mt-[26px] rounded-sm border border-border bg-gun-950 p-4">
            <Eyebrow
              tone="inherit"
              className="mb-2 text-[9.5px] tracking-[0.14em] text-n400"
            >
              {t("detail.notTimeEntry.title")}
            </Eyebrow>
            <p className="text-[12.5px] leading-[1.6] text-n400">
              {t("detail.notTimeEntry.description")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/** Detalhe do acesso. Somente leitura: nada aqui edita ou apaga o registro. */
export function AccessDetail({ id }: { id: string }) {
  const { event, timeline } = useAccessDetail(id);

  return (
    <DataBoundary
      isLoading={event.isLoading}
      isError={event.isError}
      onRetry={event.retry}
      skeleton={<SkeletonText className="p-8" lines={7} />}
    >
      {event.data ? (
        <AccessDetailContent event={event.data} timeline={timeline} />
      ) : null}
    </DataBoundary>
  );
}
