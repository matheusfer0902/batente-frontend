"use client";

import { useTranslation } from "react-i18next";
import { AdjustmentsCard } from "@/components/dashboard/AdjustmentsCard";
import { LatestAccessTable } from "@/components/dashboard/LatestAccessTable";
import { PendingTimekeepingCard } from "@/components/dashboard/PendingTimekeepingCard";
import { DeviceStatusCard } from "@/components/device/DeviceStatusCard";
import { DeviceStatusPill } from "@/components/device/DeviceStatusPill";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDashboardHome } from "@/hooks/useDashboardHome";
import { TimeService } from "@/services/TimeService";

/**
 * Início. Responde "o totem está vivo?" e "o que preciso resolver hoje?".
 * Cada bloco tem a própria query: um erro não derruba a tela.
 */
export function DashboardHome() {
  const { t, i18n } = useTranslation("dashboard");
  const { device, pending, adjustments, latestAccess, now } = useDashboardHome();

  const nowIso = now === null ? null : new Date(now).toISOString();
  const subtitle =
    nowIso === null
      ? null
      : `${TimeService.longDate(nowIso, i18n.language)} · ${TimeService.shortClock(nowIso)}`;

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={subtitle}
        actions={<DeviceStatusPill device={device.data} />}
      />

      <div className="flex flex-col gap-[22px] p-5 md:px-8 md:py-7">
        <div className="grid gap-[18px] lg:grid-cols-[1.25fr_1fr_1fr]">
          <DeviceStatusCard block={device} />
          <PendingTimekeepingCard block={pending} />
          <AdjustmentsCard block={adjustments} />
        </div>

        <LatestAccessTable block={latestAccess} />
      </div>
    </>
  );
}
