"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/skeleton";
import { useDeviceList } from "@/hooks/useDeviceList";
import { useElapsed } from "@/hooks/useElapsed";
import { TimeService } from "@/services/TimeService";
import type { DeviceListItem } from "@/types/device";
import { cn } from "@/lib/utils";

function DeviceCard({ device }: { device: DeviceListItem }) {
  const { t } = useTranslation(["device", "access"]);
  const elapsed = useElapsed(device.lastContactAt);
  const lastContact =
    elapsed === null
      ? "—"
      : t(`common:${TimeService.relativeLabel(elapsed).key}`, {
          ...(TimeService.relativeLabel(elapsed).values ?? {}),
        });

  const online = device.status === "ONLINE";

  return (
    <Link
      href={`/dispositivos/${device.id}`}
      className={cn(
        "flex flex-wrap items-center gap-6 rounded-sm border bg-gun-950 p-6 transition-colors hover:bg-gun-900",
        online ? "border-chart/35 border-l-2 border-l-chart" : "border-border",
      )}
    >
      <div className="min-w-[210px]">
        <div className="mb-2 flex items-center gap-2.5">
          <span
            className={cn(
              "size-2 rounded-full",
              online ? "bg-chart" : "bg-cherry",
            )}
            aria-hidden
          />
          <span className="font-display text-lg font-bold text-linen">
            {device.name}
          </span>
        </div>
        <div className="font-mono text-[11.5px] uppercase text-n300">
          {device.location}
        </div>
      </div>

      <dl className="flex flex-1 flex-wrap gap-8">
        <div>
          <dt className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("device:list.metrics.status")}
          </dt>
          <dd className="font-mono text-sm text-chart">
            {t(`access:mode.${device.status}`)}
          </dd>
        </div>
        <div>
          <dt className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("device:list.metrics.lastContact")}
          </dt>
          <dd className="font-mono text-sm text-linen">{lastContact}</dd>
        </div>
        <div>
          <dt className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("device:list.metrics.firmware")}
          </dt>
          <dd className="font-mono text-sm text-linen">
            {device.firmwareVersion ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("device:list.metrics.clock")}
          </dt>
          <dd
            className={cn(
              "font-mono text-sm",
              device.clockDriftMs !== null ? "text-chart" : "text-n400",
            )}
          >
            {device.clockDriftMs !== null
              ? `${device.clockDriftMs > 0 ? "+" : ""}${device.clockDriftMs}ms`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("device:list.metrics.queue")}
          </dt>
          <dd
            className={cn(
              "font-mono text-sm",
              device.pendingUploads > 0 ? "text-sun" : "text-linen",
            )}
          >
            {device.pendingUploads}
          </dd>
        </div>
      </dl>

      <div className="flex items-center gap-3">
        {device.lifecycle !== "ACTIVE" ? (
          // MAINTENANCE e DISABLED mudam o que o totem pode fazer, não só como
          // ele aparece: DISABLED faz `fn_verificar_dispositivo` recusar a chave.
          <span className="rounded-sm border border-sun/45 px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wide text-sun">
            {t(`device:lifecycle.${device.lifecycle}`)}
          </span>
        ) : null}
        <span className="font-mono text-[11px] text-linen">
          {t("device:list.open")}
        </span>
      </div>
    </Link>
  );
}

export function DeviceAdminList() {
  const { t } = useTranslation(["device", "common"]);
  const { devices, isLoading, isError, retry } = useDeviceList();

  return (
    <RoleGuard roles={["ADMIN"]}>
      <>
        <PageHeader
          title={t("device:list.title")}
          subtitle={t("device:list.subtitle", { count: devices.length })}
          actions={
            <Button asChild size="entryInline">
              <Link href="/dispositivos/novo">{t("device:list.create")}</Link>
            </Button>
          }
        />

        <DataBoundary
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
          isEmpty={devices.length === 0}
          skeleton={<SkeletonText lines={6} className="p-6" />}
          empty={<EmptyState title={t("common:empty.title")} className="py-16" />}
        >
          <div className="flex flex-col gap-3.5 px-5 pb-8 md:px-8">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}

            <div className="flex items-center gap-3.5 rounded-sm border border-border bg-gun-950 px-5 py-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-moon">
                {t("device:list.singleNote")}
              </span>
              <span className="flex-1 text-[13px] text-n300">
                {t("device:list.singleNoteBody")}
              </span>
            </div>
          </div>
        </DataBoundary>
      </>
    </RoleGuard>
  );
}
