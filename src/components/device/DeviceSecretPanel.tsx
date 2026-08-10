"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { DeviceWithSecret } from "@/types/device";

interface DeviceSecretPanelProps {
  result: DeviceWithSecret;
  /** Habilitado só depois da confirmação — é a trava da tela 38. */
  onConfirm: () => void;
  confirmLabelKey?: string;
}

/**
 * A chave do totem, exibida uma única vez.
 *
 * O design é explícito sobre a trava: copiar, marcar a confirmação, e só então
 * concluir. Não é cerimônia — o banco guarda apenas o SHA-256, então sair
 * desta tela sem copiar significa cadastrar o totem de novo ou rotacionar.
 *
 * O bloco mostrado é o do `secrets.h`, com os dois `#define` que o firmware
 * espera. É o mesmo formato que `npm run db:seed:device` imprime no terminal,
 * de propósito: quem já provisionou pela linha de comando reconhece, e o passo
 * seguinte — gravar o `hardware.ino` — não muda.
 */
export function DeviceSecretPanel({
  result,
  onConfirm,
  confirmLabelKey = "device:secret.finish",
}: DeviceSecretPanelProps) {
  const { t } = useTranslation(["device", "common"]);
  const [confirmado, setConfirmado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(result.firmwareSnippet);
      setCopiado(true);
    } catch {
      // Clipboard bloqueado (contexto inseguro, permissão negada). O bloco
      // está visível e selecionável — copiar à mão continua possível.
      setCopiado(false);
    }
  }

  return (
    <div className="space-y-4">
      <Alert variant="warning">
        <strong className="block">{t("device:secret.title")}</strong>
        {t("device:secret.body")}
      </Alert>

      <div className="rounded-sm border border-border bg-gun-950 p-4">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-moon">
          {t("device:secret.snippetLabel", { name: result.device.name })}
        </div>

        <pre className="mt-2.5 overflow-x-auto whitespace-pre rounded-sm bg-gun p-3.5 font-mono text-[12.5px] leading-relaxed text-chart">
          {result.firmwareSnippet}
        </pre>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => void copiar()}>
            {copiado ? t("device:secret.copied") : t("device:secret.copy")}
          </Button>
          <span className="font-mono text-[11px] text-n400">
            {t("device:secret.pathHint")}
          </span>
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-[13px] text-n300">
        <Checkbox
          className="mt-0.5"
          checked={confirmado}
          onChange={(e) => setConfirmado(e.currentTarget.checked)}
        />
        <span>{t("device:secret.confirm")}</span>
      </label>

      <div className="flex items-center gap-3">
        <Button onClick={onConfirm} disabled={!confirmado}>
          {t(confirmLabelKey)}
        </Button>
        {!confirmado ? (
          <span className="font-mono text-[11px] text-n400">
            {t("device:secret.confirmHint")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
