"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { PanelCard } from "@/components/shared/PanelCard";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SkeletonText } from "@/components/ui/skeleton";
import { useElapsed } from "@/hooks/useElapsed";
import { TimeService } from "@/services/TimeService";
import type { Device } from "@/types/device";
import type { BlockState } from "@/types/ui";
import { cn } from "@/lib/utils";

interface MetricProps {
  label: string;
  value: string;
  tone?: "default" | "accent" | "moon" | "warning";
}

function Metric({ label, value, tone = "default" }: MetricProps) {
  return (
    <div>
      <Eyebrow tone="inherit" className="mb-1.5 text-[9.5px] tracking-[0.14em] text-n400">
        {label}
      </Eyebrow>
      <p
        className={cn(
          "font-mono text-sm",
          tone === "accent" && "text-chart",
          tone === "moon" && "text-moon",
          tone === "warning" && "text-sun",
          tone === "default" && "text-linen",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DeviceStatusContent({ device }: { device: Device }) {
  const { t } = useTranslation(["device", "common"]);
  const elapsedMs = useElapsed(device.lastContactAt);
  const isOnline = device.status === "ONLINE";

  const relative = elapsedMs === null ? null : TimeService.relativeLabel(elapsedMs);
  const lastContact = relative
    ? t(`common:${relative.key}`, relative.values)
    : "—";

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>
          {t("device:card.title", { location: device.location })}
        </Eyebrow>
        {isOnline ? (
          <Link
            href="/dispositivos"
            className="font-mono text-[10px] text-n400 transition-colors hover:text-linen"
          >
            {t("device:card.openDevice")}
          </Link>
        ) : null}
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "size-[9px] shrink-0 rounded-full",
            isOnline ? "bg-chart" : "bg-moon",
          )}
        />
        <p className="font-display type-action text-[32px] leading-none text-linen">
          {t(isOnline ? "device:status.online" : "device:status.offline")}
        </p>
      </div>

      {!isOnline ? (
        <p className="mt-4 text-[13px] leading-[1.6] text-n400">
          {t("device:card.offlineExplanation", {
            time: TimeService.shortClock(device.lastContactAt) ?? "—",
          })}
        </p>
      ) : null}

      <div className="mt-[18px] grid grid-cols-3 gap-3.5 border-t border-border pt-4">
        <Metric
          label={t("device:metrics.lastContact")}
          value={lastContact}
          tone={isOnline ? "default" : "moon"}
        />
        <Metric
          label={t("device:metrics.clockDrift")}
          value={TimeService.drift(device.clockDriftMs) ?? "—"}
          tone={device.clockDriftMs === null ? "default" : "accent"}
        />
        <Metric
          label={t("device:metrics.pendingUploads")}
          value={
            isOnline
              ? String(device.pendingUploads)
              : t("device:metrics.approximate", { value: device.pendingUploads })
          }
          tone={device.pendingUploads > 0 ? "warning" : "default"}
        />
      </div>
    </>
  );
}

/** "O totem está vivo?" — a primeira pergunta que o Início responde. */
export function DeviceStatusCard({ block }: { block: BlockState<Device> }) {
  const isOffline = block.data?.status === "OFFLINE";

  return (
    <PanelCard
      tone={block.isError ? "danger" : isOffline ? "contingency" : "default"}
      className="min-h-[220px] gap-0"
    >
      <DataBoundary
        isLoading={block.isLoading}
        isError={block.isError}
        onRetry={block.retry}
        skeleton={<SkeletonText lines={4} />}
      >
        {block.data ? <DeviceStatusContent device={block.data} /> : null}
      </DataBoundary>
    </PanelCard>
  );
}
