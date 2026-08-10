"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SkeletonText } from "@/components/ui/skeleton";
import { useIssueBadgeMutation } from "@/redux/reducers/queries/badgeApi";
import { useGetEmployeeListQuery } from "@/redux/reducers/queries/employeeApi";
import { BADGE_ERROR_KEYS } from "@/services/BadgeService";
import { apiErrorCode, apiErrorStatus } from "@/lib/apiError";
import { FORMATO_UID } from "@/types/badge";

/** Tela 18 — vincular crachá a colaborador. */
export function BadgeForm() {
  const { t } = useTranslation(["badge", "common"]);
  const router = useRouter();
  const [issueBadge, { isLoading: salvando }] = useIssueBadgeMutation();

  const [employeeId, setEmployeeId] = useState("");
  const [uid, setUid] = useState("");
  const [label, setLabel] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Só colaboradores ativos **sem** crachá — `missingBadge` é o mesmo alerta
   * que a lista de pessoas mostra. Oferecer quem já tem daria um 409 de RN-2.1
   * previsível, e o usuário não teria como saber de antemão.
   */
  const listaQuery = useGetEmployeeListQuery({
    status: "ACTIVE",
    filter: "missing-badge",
    limit: 200,
  });

  const candidatos = useMemo(
    () => listaQuery.data?.items ?? [],
    [listaQuery.data],
  );

  const uidValido = FORMATO_UID.test(uid.trim());
  const podeSalvar = employeeId.length > 0 && uidValido && !salvando;

  async function vincular() {
    setErro(null);

    try {
      const criado = await issueBadge({
        employeeId,
        uid: uid.trim(),
        label: label.trim() || undefined,
      }).unwrap();

      router.push(`/crachas/${criado.id}`);
    } catch (causa) {
      // 403 é o `GRANT` recusando: a tela achou que dava, o banco discordou.
      // Sem este ramo, a recusa mais informativa do sistema virava "erro ao
      // salvar" — e `useCanMutate` avisa que o palpite dele é otimista.
      if (apiErrorStatus(causa) === 403) {
        setErro(t("badge:errors.forbidden"));
        return;
      }

      const chave = BADGE_ERROR_KEYS[apiErrorCode(causa) ?? ""];
      setErro(chave ? t(chave) : t("common:errors.generic"));
    }
  }

  return (
    <>
      <PageHeader
        title={t("badge:createTitle")}
        subtitle={t("badge:createSubtitle")}
      />

      <DataBoundary
        isLoading={listaQuery.isLoading}
        isError={listaQuery.isError}
        onRetry={listaQuery.refetch}
        isEmpty={candidatos.length === 0}
        skeleton={<SkeletonText lines={6} className="px-8" />}
        empty={
          <EmptyState
            title={t("badge:form.noCandidates")}
            className="mx-auto max-w-md py-12"
          />
        }
      >
        <div className="space-y-5 px-5 py-5 md:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="badge-employee">
                {t("badge:form.employee")}
              </Label>
              <Select
                id="badge-employee"
                className="mt-1.5"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.currentTarget.value)}
              >
                <option value="">{t("badge:form.employeePlaceholder")}</option>
                {candidatos.map((pessoa) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {pessoa.registration} · {pessoa.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="badge-uid">{t("badge:form.uid")}</Label>
              <Input
                id="badge-uid"
                className="mt-1.5 font-mono uppercase"
                value={uid}
                onChange={(e) => setUid(e.currentTarget.value)}
                placeholder="830D31DD"
                aria-invalid={uid.length > 0 && !uidValido}
              />
              <p className="mt-1.5 text-[12.5px] text-n400">
                {t("badge:form.uidHint")}
              </p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="badge-label">{t("badge:form.label")}</Label>
              <Input
                id="badge-label"
                className="mt-1.5"
                value={label}
                onChange={(e) => setLabel(e.currentTarget.value)}
                placeholder="Cartão azul"
              />
            </div>
          </div>

          {/* O UID chega em minúsculas com frequência — o gatilho do banco
              normaliza, e dizer isso evita o usuário achar que digitou errado. */}
          <Alert variant="info">{t("badge:form.normalizeNotice")}</Alert>

          {erro ? <Alert variant="danger">{erro}</Alert> : null}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={salvando}
            >
              {t("common:cancel")}
            </Button>
            <Button onClick={() => void vincular()} disabled={!podeSalvar}>
              {salvando ? t("common:saving") : t("badge:form.submit")}
            </Button>
          </div>
        </div>
      </DataBoundary>
    </>
  );
}
