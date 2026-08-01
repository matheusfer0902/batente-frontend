"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AccessFeedRow } from "@/components/access/AccessFeedRow";
import { AccessStatsStrip } from "@/components/access/AccessStatsStrip";
import {
  FeedSuspendedState,
  NoMovementState,
} from "@/components/access/AccessSilence";
import { DeviceStatusPill } from "@/components/device/DeviceStatusPill";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SkeletonText } from "@/components/ui/skeleton";
import { useAccessMonitor } from "@/hooks/useAccessMonitor";
import { TimeService } from "@/services/TimeService";

/** Monitor de acessos: observa o agora e atualiza sozinho. */
export function AccessMonitor() {
  const { t } = useTranslation(["access", "common"]);
  const {
    device,
    stats,
    feed,
    events,
    isDeviceOffline,
    isSilent,
    lastReadElapsedMs,
  } = useAccessMonitor();

  const relative =
    lastReadElapsedMs === null
      ? null
      : TimeService.relativeLabel(lastReadElapsedMs);

  const subtitle = relative
    ? t("access:monitor.subtitle", {
        elapsed: t(`common:${relative.key}`, relative.values),
      })
    : t("access:monitor.subtitleIdle");

  const lastEvent = events[0];

  return (
    <>
      <PageHeader
        title={t("access:monitor.title")}
        subtitle={subtitle}
        actions={
          <>
            <DeviceStatusPill device={device.data} showDetail={false} />
            <Button asChild variant="quiet" size="entryInline">
              <Link href="/historico">{t("access:monitor.history")}</Link>
            </Button>
          </>
        }
      />

      <AccessStatsStrip block={stats} />

      <section className="flex flex-1 flex-col gap-2.5 p-5 md:px-8 md:py-6">
        <div className="mb-1 flex items-center gap-2.5">
          <Eyebrow>{t("access:monitor.feedTitle")}</Eyebrow>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>

        <DataBoundary
          isLoading={feed.isLoading}
          isError={feed.isError}
          isEmpty={isSilent}
          onRetry={feed.retry}
          skeleton={<SkeletonText lines={6} />}
          empty={
            isDeviceOffline ? (
              <FeedSuspendedState
                lastContact={
                  TimeService.shortClock(device.data?.lastContactAt) ?? "—"
                }
              />
            ) : (
              <NoMovementState
                stats={stats.data}
                lastRead={TimeService.shortClock(lastEvent?.occurredAt) ?? null}
              />
            )
          }
        >
          {events.map((event, index) => (
            <AccessFeedRow
              key={event.id}
              event={event}
              isLatest={index === 0}
              isFading={index === events.length - 1 && events.length > 1}
            />
          ))}
        </DataBoundary>
      </section>
    </>
  );
}
