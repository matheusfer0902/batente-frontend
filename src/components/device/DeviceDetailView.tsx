"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { PageHeader } from "@/components/shared/PageHeader";
import { DeviceSecretPanel } from "@/components/device/DeviceSecretPanel";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/skeleton";
import {
  useGetDeviceByIdQuery,
  useRotateDeviceKeyMutation,
  useUpdateDeviceMutation,
} from "@/redux/reducers/queries/deviceApi";
import { cn } from "@/lib/utils";
import type { DeviceWithSecret } from "@/types/device";

/** Tela 39, aba Dados. Telemetria e sincronizações ficam para a fila offline. */
export function DeviceDetailView({ id }: { id: string }) {
  const { t } = useTranslation(["device", "common"]);
  const { data, isLoading, isError, refetch } = useGetDeviceByIdQuery(id);
  const [rotateKey, rotateState] = useRotateDeviceKeyMutation();
  const [updateDevice, updateState] = useUpdateDeviceMutation();

  const [rotacionada, setRotacionada] = useState<DeviceWithSecret | null>(null);
  const [confirmandoRotacao, setConfirmandoRotacao] = useState(false);

  async function rotacionar() {
    setConfirmandoRotacao(false);
    setRotacionada(await rotateKey(id).unwrap());
  }

  async function alternarManutencao() {
    if (!data) return;

    await updateDevice({
      id,
      lifecycle: data.lifecycle === "MAINTENANCE" ? "ACTIVE" : "MAINTENANCE",
    }).unwrap();
  }

  return (
    <>
      <PageHeader
        title={data?.name ?? t("device:title")}
        subtitle={
          data
            ? [
                data.location,
                data.serialNumber,
                data.firmwareVersion
                  ? `${t("device:firmware")} ${data.firmwareVersion}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
        actions={
          data ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="entryInline"
                onClick={() => void alternarManutencao()}
                disabled={updateState.isLoading}
              >
                {data.lifecycle === "MAINTENANCE"
                  ? t("device:actions.leaveMaintenance")
                  : t("device:actions.maintenance")}
              </Button>
              <Button
                variant="outline"
                size="entryInline"
                onClick={() => setConfirmandoRotacao(true)}
                disabled={rotateState.isLoading}
              >
                {t("device:actions.rotate")}
              </Button>
            </div>
          ) : null
        }
      />

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        skeleton={<SkeletonText lines={8} className="p-6" />}
      >
        <div className="space-y-5 px-5 py-5 md:px-8">
          {rotacionada ? (
            <DeviceSecretPanel
              result={rotacionada}
              confirmLabelKey="device:secret.done"
              onConfirm={() => setRotacionada(null)}
            />
          ) : null}

          {confirmandoRotacao ? (
            <Alert variant="warning">
              <strong className="block">
                {t("device:rotate.confirmTitle")}
              </strong>
              {t("device:rotate.confirmBody")}
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => void rotacionar()}>
                  {t("device:rotate.confirmAction")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmandoRotacao(false)}
                >
                  {t("common:cancel")}
                </Button>
              </div>
            </Alert>
          ) : null}

          {data ? (
            <dl className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              <Campo rotulo={t("device:fields.link")}>
                <span
                  className={cn(
                    "font-mono text-[12.5px]",
                    data.status === "ONLINE" ? "text-chart" : "text-n400",
                  )}
                >
                  ● {t(`device:status.${data.status}`)}
                </span>
              </Campo>

              <Campo rotulo={t("device:fields.lifecycle")}>
                {t(`device:lifecycle.${data.lifecycle}`)}
              </Campo>

              <Campo rotulo={t("device:fields.lastContact")}>
                {new Date(data.lastContactAt).toLocaleString("pt-BR")}
              </Campo>

              <Campo rotulo={t("device:fields.clockDrift")}>
                {data.clockDriftMs === null
                  ? "—"
                  : `${data.clockDriftMs > 0 ? "+" : ""}${data.clockDriftMs}ms`}
              </Campo>

              <Campo rotulo={t("device:fields.pending")}>
                {data.pendingUploads}
              </Campo>

              <Campo rotulo={t("device:fields.doorOpen")}>
                {/* Herdar do global é o padrão, e a tela diz de onde veio. */}
                {`${data.effectiveDoorOpenMs}ms`}
                {data.doorOpenMs === null ? (
                  <span className="ml-1.5 text-[11px] text-n400">
                    {t("device:fields.inherited")}
                  </span>
                ) : null}
              </Campo>

              <Campo rotulo={t("device:fields.badgeListVersion")}>
                {`v${data.badgeListVersion}`}
              </Campo>

              <Campo rotulo={t("device:fields.installedAt")}>
                {data.installedAt}
              </Campo>

              <Campo rotulo={t("device:fields.serial")}>
                {data.serialNumber ?? "—"}
              </Campo>
            </dl>
          ) : null}
        </div>
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
    <div className="bg-gun-950 px-5 py-3.5">
      <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-moon">
        {rotulo}
      </dt>
      <dd className="mt-1 text-[13.5px] text-linen">{children}</dd>
    </div>
  );
}
