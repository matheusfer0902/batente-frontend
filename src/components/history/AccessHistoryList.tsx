"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonText } from "@/components/ui/skeleton";
import { useAccessHistory } from "@/hooks/useAccessHistory";
import { AccessService } from "@/services/AccessService";
import { TimeService } from "@/services/TimeService";
import { accessDecisions, accessModes } from "@/types/access";
import { cn } from "@/lib/utils";

const HEAD =
  "border-b border-border px-5 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

export function AccessHistoryList() {
  const { t } = useTranslation(["history", "access", "common"]);
  const {
    events,
    decision,
    setDecision,
    mode,
    setMode,
    search,
    setSearch,
    badgeCode,
    setBadgeCode,
    isLoading,
    isError,
    retry,
  } = useAccessHistory();

  const filtered =
    search.trim().length > 0 ||
    badgeCode.trim().length > 0 ||
    decision !== "ALL" ||
    mode !== "ALL";

  return (
    <>
      <PageHeader
        title={t("history:title")}
        subtitle={t("history:subtitle", { count: events.length })}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="entry" asChild>
              <Link href="/monitor">{t("history:openMonitor")}</Link>
            </Button>
            <Button variant="default" size="entry" disabled>
              {t("history:export")}
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 px-5 py-5 md:px-8">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("history:filters.person")}
          className="min-w-[180px] flex-1"
          aria-label={t("history:filters.person")}
        />
        <Input
          value={badgeCode}
          onChange={(e) => setBadgeCode(e.target.value)}
          placeholder={t("history:filters.badgeCode")}
          className="min-w-[180px] font-mono"
          aria-label={t("history:filters.badgeCode")}
        />
        <label className="flex items-center gap-2 rounded-sm border border-border bg-gun-950 px-3.5 py-2.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("history:filters.decision")}
          </span>
          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value as typeof decision)}
            className="bg-transparent text-[13.5px] text-linen outline-none"
          >
            <option value="ALL">{t("history:decision.ALL")}</option>
            {accessDecisions.map((item) => (
              <option key={item} value={item}>
                {t(`history:decision.${item}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-sm border border-border bg-gun-950 px-3.5 py-2.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("history:filters.mode")}
          </span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
            className="bg-transparent text-[13.5px] text-linen outline-none"
          >
            <option value="ALL">{t("history:modeFilter.ALL")}</option>
            {accessModes.map((item) => (
              <option key={item} value={item}>
                {t(`history:modeFilter.${item}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={retry}
        isEmpty={events.length === 0}
        skeleton={<SkeletonText lines={10} className="px-8" />}
        empty={
          <EmptyState
            title={filtered ? t("history:emptyFiltered") : t("history:empty")}
            className="mx-auto max-w-md py-12"
          />
        }
      >
        <div className="mx-5 mb-6 overflow-hidden rounded-sm border border-border bg-gun-950 md:mx-8">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th className={cn(HEAD, "w-[14%]")}>{t("history:table.occurredAt")}</th>
                <th className={cn(HEAD, "w-[22%]")}>{t("history:table.employee")}</th>
                <th className={cn(HEAD, "w-[14%]")}>{t("history:table.badge")}</th>
                <th className={cn(HEAD, "w-[14%]")}>{t("history:table.decision")}</th>
                <th className={cn(HEAD, "w-[12%]")}>{t("history:table.mode")}</th>
                <th className={HEAD}>{t("history:table.device")}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-5 py-3 font-mono text-n300">
                    {TimeService.clockWithMillis(event.occurredAt) ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-linen">
                    <Link
                      href={`/acessos/${event.id}`}
                      className="hover:text-chart"
                    >
                      {event.employee?.name ?? t("access:subject.unknownBadge")}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-n300">{event.badgeCode}</td>
                  {/* `decisionDetailKey`, não `decisionLabelKey`: no histórico o
                      que se procura é por que barrou. "BARRADO" obriga a ir ao
                      psql ou ao curl para saber se foi crachá bloqueado, fora do
                      horário ou UID desconhecido — e é justamente a pergunta que
                      traz alguém a esta tela. As traduções já existiam.

                      Prefixo `access:` explícito: este componente carrega
                      ["history","access","common"], e `history` também tem uma
                      chave `decision` — só que com as siglas em maiúsculas, para
                      as opções do filtro. Sem o prefixo, a resolução depende de
                      cair de um namespace para o outro por não encontrar a
                      capitalização, o que é acidente, não desenho. */}
                  <td className="px-5 py-3 font-mono text-[11px]">
                    <span
                      className={cn(
                        event.decision === "GRANTED" ? "text-chart" : "text-cherry",
                      )}
                    >
                      {t(`access:${AccessService.decisionDetailKey(event)}`)}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-n400">
                    {t(`access:mode.${event.mode}`)}
                  </td>
                  <td className="px-5 py-3 text-n300">{event.device.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataBoundary>
    </>
  );
}
