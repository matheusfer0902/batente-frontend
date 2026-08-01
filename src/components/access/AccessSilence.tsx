"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BatenteMark } from "@/components/shared/BatenteLogo";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { AccessStats } from "@/types/access";
import { cn } from "@/lib/utils";

interface SilenceBannerProps {
  tone: "offline" | "online";
  title: string;
  children: React.ReactNode;
}

function SilenceBanner({ tone, title, children }: SilenceBannerProps) {
  const isOffline = tone === "offline";

  return (
    <div
      className={cn(
        "mb-6 flex items-start gap-2.5 rounded-sm border p-4",
        isOffline
          ? "border-moon/45 border-l-2 border-l-moon bg-moon/12"
          : "border-border bg-gun-950",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-1 size-[7px] shrink-0 rounded-full",
          isOffline ? "bg-moon" : "bg-chart",
        )}
      />
      <div>
        <Eyebrow
          tone="inherit"
          className={cn("mb-1.5", isOffline ? "text-moon" : "text-chart")}
        >
          {title}
        </Eyebrow>
        <p className="text-[13.5px] leading-[1.55] text-linen">{children}</p>
      </div>
    </div>
  );
}

/**
 * Totem offline: o feed parou porque o painel não recebe — não porque
 * ninguém passou.
 */
export function FeedSuspendedState({ lastContact }: { lastContact: string }) {
  const { t } = useTranslation("access");

  return (
    <div className="flex flex-1 flex-col">
      <SilenceBanner tone="offline" title={t("silence.offline.badge")}>
        {t("silence.offline.banner", { time: lastContact })}
      </SilenceBanner>

      <EmptyState
        title={t("silence.offline.title")}
        description={t("silence.offline.description")}
        icon={<BatenteMark size={52} tone="moon" className="opacity-70" />}
        action={
          <Button asChild variant="contingency" size="entryInline">
            <Link href="/dispositivos">{t("silence.offline.action")}</Link>
          </Button>
        }
      />
    </div>
  );
}

/** Totem vivo, ninguém passou. Silêncio normal — não é falha. */
export function NoMovementState({
  stats,
  lastRead,
}: {
  stats: AccessStats | undefined;
  lastRead: string | null;
}) {
  const { t } = useTranslation("access");

  return (
    <div className="flex flex-1 flex-col">
      <SilenceBanner tone="online" title={t("silence.idle.badge")}>
        {t("silence.idle.banner")}
      </SilenceBanner>

      <EmptyState
        title={t("silence.idle.title")}
        description={
          lastRead
            ? t("silence.idle.description", { time: lastRead })
            : t("silence.idle.descriptionNoRead")
        }
        icon={
          <span
            aria-hidden="true"
            className="font-mono text-[34px] tracking-[0.1em] text-n700"
          >
            — · —
          </span>
        }
        action={
          stats ? (
            <span className="font-mono text-[11px] text-n400">
              {t("silence.idle.footnote", { count: stats.total })}
            </span>
          ) : null
        }
      />
    </div>
  );
}
