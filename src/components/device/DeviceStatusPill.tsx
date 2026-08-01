"use client";

import { useTranslation } from "react-i18next";
import { useElapsed } from "@/hooks/useElapsed";
import { TimeService } from "@/services/TimeService";
import { eyebrowVariants } from "@/components/ui/eyebrow";
import type { Device } from "@/types/device";
import { cn } from "@/lib/utils";

interface DeviceStatusPillProps {
  device: Device | undefined;
  /** Online mostra o desvio do relógio; offline, há quanto tempo sumiu. */
  showDetail?: boolean;
  className?: string;
}

export function DeviceStatusPill({
  device,
  showDetail = true,
  className,
}: DeviceStatusPillProps) {
  const { t } = useTranslation(["device", "common"]);
  const elapsedMs = useElapsed(device?.lastContactAt ?? null);

  if (!device) return null;

  const isOnline = device.status === "ONLINE";
  const relative = elapsedMs === null ? null : TimeService.relativeLabel(elapsedMs);
  const drift = TimeService.drift(device.clockDriftMs);

  const detail = isOnline
    ? drift
    : relative
      ? t(`common:${relative.key}`, relative.values)
      : null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-sm border px-3 py-1.5",
        isOnline ? "border-border bg-gun-950" : "border-moon/45 bg-moon/12",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          isOnline ? "bg-chart" : "bg-moon",
        )}
      />
      <span
        className={cn(
          eyebrowVariants({ tone: "inherit" }),
          "tracking-[0.14em]",
          isOnline ? "text-chart" : "text-moon",
        )}
      >
        {t(isOnline ? "device:status.online" : "device:status.offline")}
      </span>
      {showDetail && detail ? (
        <span className="font-mono text-[10.5px] text-n400">{detail}</span>
      ) : null}
    </div>
  );
}
