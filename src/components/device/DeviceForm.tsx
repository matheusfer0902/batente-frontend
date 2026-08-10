"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/shared/PageHeader";
import { DeviceSecretPanel } from "@/components/device/DeviceSecretPanel";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDeviceMutation } from "@/redux/reducers/queries/deviceApi";
import { apiErrorCode } from "@/lib/apiError";
import type { DeviceWithSecret } from "@/types/device";

const MENSAGENS: Record<string, string> = {
  device_name_taken: "device:errors.nameTaken",
  device_serial_taken: "device:errors.serialTaken",
};

/** Tela 38 — cadastro e a chave que aparece uma vez. */
export function DeviceForm() {
  const { t } = useTranslation(["device", "common"]);
  const router = useRouter();
  const [createDevice, { isLoading }] = useCreateDeviceMutation();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [doorOpenMs, setDoorOpenMs] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [emitido, setEmitido] = useState<DeviceWithSecret | null>(null);

  async function cadastrar() {
    setErro(null);

    try {
      const resultado = await createDevice({
        name: name.trim(),
        location: location.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        // Vazio herda `system_settings.lock.pulse_ms` — o global.
        doorOpenMs: doorOpenMs ? Number(doorOpenMs) : undefined,
      }).unwrap();

      setEmitido(resultado);
    } catch (causa) {
      const chave = MENSAGENS[apiErrorCode(causa) ?? ""];
      setErro(chave ? t(chave) : t("common:errors.generic"));
    }
  }

  // Depois de emitida, o formulário some: voltar a ele sugeriria que dá para
  // ver a chave de novo, e não dá.
  if (emitido) {
    return (
      <>
        <PageHeader
          title={t("device:secret.pageTitle")}
          subtitle={t("device:secret.pageSubtitle")}
        />
        <div className="px-5 py-5 md:px-8">
          <DeviceSecretPanel
            result={emitido}
            onConfirm={() => router.push(`/dispositivos/${emitido.device.id}`)}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("device:createTitle")}
        subtitle={t("device:createSubtitle")}
      />

      <div className="space-y-5 px-5 py-5 md:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="device-name">{t("device:form.name")}</Label>
            <Input
              id="device-name"
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Totem Portaria ESP32"
            />
          </div>

          <div>
            <Label htmlFor="device-location">{t("device:form.location")}</Label>
            <Input
              id="device-location"
              className="mt-1.5"
              value={location}
              onChange={(e) => setLocation(e.currentTarget.value)}
              placeholder="Entrada principal"
            />
          </div>

          <div>
            <Label htmlFor="device-serial">{t("device:form.serial")}</Label>
            <Input
              id="device-serial"
              className="mt-1.5 font-mono"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.currentTarget.value)}
              placeholder="BT-2024-0117"
            />
          </div>

          <div>
            <Label htmlFor="device-door">{t("device:form.doorOpen")}</Label>
            <Input
              id="device-door"
              className="mt-1.5 font-mono"
              type="number"
              min={500}
              max={15000}
              value={doorOpenMs}
              onChange={(e) => setDoorOpenMs(e.currentTarget.value)}
              placeholder="3000"
            />
            <p className="mt-1.5 text-[12.5px] text-n400">
              {t("device:form.doorOpenHint")}
            </p>
          </div>
        </div>

        <Alert variant="info">{t("device:form.keyNotice")}</Alert>

        {erro ? <Alert variant="danger">{erro}</Alert> : null}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            {t("common:cancel")}
          </Button>
          <Button
            onClick={() => void cadastrar()}
            disabled={isLoading || name.trim().length < 2}
          >
            {isLoading ? t("common:saving") : t("device:form.submit")}
          </Button>
        </div>
      </div>
    </>
  );
}
