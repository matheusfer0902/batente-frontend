"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkeletonText } from "@/components/ui/skeleton";
import {
  useBlockBadgeMutation,
  useGetBadgeByIdQuery,
  useReplaceBadgeMutation,
  useReportBadgeLossMutation,
  useRevokeBadgeMutation,
  useUnblockBadgeMutation,
} from "@/redux/reducers/queries/badgeApi";
import {
  BADGE_ERROR_KEYS,
  BadgeService,
  type BadgeAction,
} from "@/services/BadgeService";
import { apiErrorCode, apiErrorStatus } from "@/lib/apiError";
import { useCanMutate } from "@/hooks/useCanMutate";
import { TimeService } from "@/services/TimeService";
import { FORMATO_UID, MOTIVO_MINIMO, type CredentialStatus } from "@/types/badge";
import { cn } from "@/lib/utils";

const COR_POR_STATUS: Record<CredentialStatus, string> = {
  ACTIVE: "text-chart",
  BLOCKED: "text-cherry",
  LOST: "text-cherry",
  REVOKED: "text-n400",
};

/** Tela 17 — detalhe e as transições que RN-2.5 permite. */
export function BadgeDetailView({ id }: { id: string }) {
  const { t } = useTranslation(["badge", "common"]);
  const router = useRouter();
  const { canEdit } = useCanMutate("badges");

  const detalhe = useGetBadgeByIdQuery(id);
  const [block, blockState] = useBlockBadgeMutation();
  const [unblock, unblockState] = useUnblockBadgeMutation();
  const [loss, lossState] = useReportBadgeLossMutation();
  const [revoke, revokeState] = useRevokeBadgeMutation();
  const [replace, replaceState] = useReplaceBadgeMutation();

  const [acao, setAcao] = useState<BadgeAction | null>(null);
  const [motivo, setMotivo] = useState("");
  const [novoUid, setNovoUid] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const salvando =
    blockState.isLoading ||
    unblockState.isLoading ||
    lossState.isLoading ||
    revokeState.isLoading ||
    replaceState.isLoading;

  const cracha = detalhe.data;

  function fechar() {
    setAcao(null);
    setMotivo("");
    setNovoUid("");
    setErro(null);
  }

  async function confirmar() {
    if (!acao || !cracha) return;
    setErro(null);

    try {
      if (acao === "unblock") {
        await unblock(cracha.id).unwrap();
      } else if (acao === "replacement") {
        const nova = await replace({
          id: cracha.id,
          uid: novoUid.trim(),
          reason: motivo.trim(),
        }).unwrap();

        // A segunda via é outro registro: seguir para ele, senão a tela ficaria
        // mostrando o crachá revogado como se nada tivesse acontecido.
        router.push(`/crachas/${nova.id}`);
        return;
      } else {
        const payload = { id: cracha.id, reason: motivo.trim() };
        if (acao === "block") await block(payload).unwrap();
        if (acao === "loss") await loss(payload).unwrap();
        if (acao === "revoke") await revoke(payload).unwrap();
      }

      fechar();
    } catch (causa) {
      // 403 é o `GRANT` do Postgres. O OPERADOR pode bloquear e reportar perda,
      // e não pode revogar nem reativar — `useCanMutate` não sabe distinguir
      // isso, porque a distinção não cabe em privilégio de coluna.
      if (apiErrorStatus(causa) === 403) {
        setErro(t("badge:errors.forbidden"));
        return;
      }

      const chave = BADGE_ERROR_KEYS[apiErrorCode(causa) ?? ""];
      setErro(chave ? t(chave) : t("common:errors.generic"));
    }
  }

  const motivoOk =
    !acao || !BadgeService.exigeMotivo(acao)
      ? true
      : motivo.trim().length >= MOTIVO_MINIMO;
  const uidOk = acao !== "replacement" || FORMATO_UID.test(novoUid.trim());

  return (
    <>
      <PageHeader
        title={t("badge:detailTitle", { code: cracha?.uid ?? "" })}
        subtitle={cracha?.employee.name ?? ""}
        actions={
          <Button variant="outline" size="entry" onClick={() => router.push("/crachas")}>
            {t("common:back")}
          </Button>
        }
      />

      <DataBoundary
        isLoading={detalhe.isLoading}
        isError={detalhe.isError}
        onRetry={detalhe.refetch}
        skeleton={<SkeletonText lines={8} className="px-8" />}
      >
        {cracha ? (
          <div className="space-y-5 px-5 py-5 md:px-8">
            <dl className="grid gap-4 rounded-sm border border-border bg-gun-950 p-5 md:grid-cols-3">
              <Campo rotulo={t("badge:table.code")}>
                <span className="font-mono">{cracha.uid}</span>
              </Campo>
              <Campo rotulo={t("badge:table.status")}>
                <span className={cn("font-mono text-[11px]", COR_POR_STATUS[cracha.status])}>
                  ● {t(`badge:credentialStatus.${cracha.status}`)}
                </span>
              </Campo>
              <Campo rotulo={t("badge:detail.employee")}>
                {cracha.employee.registration} · {cracha.employee.name}
              </Campo>
              <Campo rotulo={t("badge:detail.label")}>
                {cracha.label ?? "—"}
              </Campo>
              {/* `null` nestes campos significa "seu perfil não lê esta coluna",
                  não "está vazio" — dizer "—" seria inventar um fato. */}
              <Campo rotulo={t("badge:table.linkedAt")}>
                {cracha.issuedAt
                  ? (TimeService.shortDate(cracha.issuedAt) ?? "—")
                  : t("badge:detail.restricted")}
              </Campo>
              <Campo rotulo={t("badge:detail.validUntil")}>
                {cracha.validUntil
                  ? (TimeService.shortDate(cracha.validUntil) ?? "—")
                  : "—"}
              </Campo>
              {BadgeService.ehTerminal(cracha.status) ? (
                <Campo rotulo={t("badge:detail.revokedReason")}>
                  {cracha.revokedReason ?? t("badge:detail.restricted")}
                </Campo>
              ) : null}
            </dl>

            {BadgeService.ehTerminal(cracha.status) ? (
              <Alert variant="info">{t("badge:detail.terminalNotice")}</Alert>
            ) : null}

            {canEdit ? (
              <div className="flex flex-wrap gap-3">
                {BadgeService.acoesPara(cracha.status).map((item) => (
                  <Button
                    key={item}
                    variant={item === "unblock" ? "default" : "outline"}
                    onClick={() => {
                      fechar();
                      setAcao(item);
                    }}
                    disabled={salvando}
                  >
                    {t(`badge:actions.${item}`)}
                  </Button>
                ))}
              </div>
            ) : null}

            {acao ? (
              <div className="space-y-4 rounded-sm border border-border bg-gun-950 p-5">
                <p className="text-[13.5px] text-linen">
                  {t(`badge:confirm.${acao}`)}
                </p>

                {acao === "replacement" ? (
                  <div>
                    <Label htmlFor="badge-new-uid">
                      {t("badge:form.newUid")}
                    </Label>
                    <Input
                      id="badge-new-uid"
                      className="mt-1.5 font-mono uppercase"
                      value={novoUid}
                      onChange={(e) => setNovoUid(e.currentTarget.value)}
                      placeholder="04A2B3C4"
                      aria-invalid={novoUid.length > 0 && !uidOk}
                    />
                    <p className="mt-1.5 text-[12.5px] text-n400">
                      {t("badge:form.uidHint")}
                    </p>
                  </div>
                ) : null}

                {BadgeService.exigeMotivo(acao) ? (
                  <div>
                    <Label htmlFor="badge-reason">{t("badge:form.reason")}</Label>
                    <Input
                      id="badge-reason"
                      className="mt-1.5"
                      value={motivo}
                      onChange={(e) => setMotivo(e.currentTarget.value)}
                      placeholder={t("badge:form.reasonPlaceholder")}
                      aria-invalid={motivo.length > 0 && !motivoOk}
                    />
                    <p className="mt-1.5 text-[12.5px] text-n400">
                      {t("badge:form.reasonHint", { min: MOTIVO_MINIMO })}
                    </p>
                  </div>
                ) : null}

                {erro ? <Alert variant="danger">{erro}</Alert> : null}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={fechar} disabled={salvando}>
                    {t("common:cancel")}
                  </Button>
                  <Button
                    onClick={() => void confirmar()}
                    disabled={salvando || !motivoOk || !uidOk}
                  >
                    {salvando ? t("common:saving") : t("common:confirm")}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </DataBoundary>
    </>
  );
}

function Campo({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-moon">
        {rotulo}
      </dt>
      <dd className="mt-1 text-[13.5px] text-linen">{children}</dd>
    </div>
  );
}
