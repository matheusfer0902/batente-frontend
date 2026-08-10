"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ScheduleDayGrid } from "@/components/schedule/ScheduleDayGrid";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useScheduleEditor } from "@/hooks/useScheduleEditor";
import { useScheduleList } from "@/hooks/useScheduleList";
import { apiErrorCode } from "@/lib/apiError";
import { ScheduleService } from "@/services/ScheduleService";
import { scheduleTypes, type ScheduleDetail } from "@/types/schedule";

interface ScheduleFormProps {
  /** Ausente = tela 20 (nova). Presente = tela 5c (editar). */
  schedule?: ScheduleDetail;
}

export function ScheduleForm({ schedule }: ScheduleFormProps) {
  const { t } = useTranslation(["schedule", "common"]);
  const router = useRouter();
  const { create, update, isSaving } = useScheduleList();
  const { state, setCampo, setDia, alternarDia, weeklyMinutes } =
    useScheduleEditor(schedule);
  const [erro, setErro] = useState<string | null>(null);

  const nomeInvalido = state.name.trim().length < 2;
  const semDiaUtil = state.days.every((dia) => !dia.isWorkday);

  async function salvar() {
    setErro(null);

    try {
      const payload = {
        name: state.name.trim(),
        type: state.type,
        toleranceMinutes: state.toleranceMinutes,
        minBreakMinutes: state.minBreakMinutes,
        days: state.days,
      };

      const salva = schedule
        ? await update({ id: schedule.id, ...payload })
        : await create(payload);

      router.push(`/escalas/${salva.id}`);
    } catch (causa) {
      setErro(
        apiErrorCode(causa) === "schedule_name_taken"
          ? t("schedule:errors.nameTaken")
          : t("common:errors.generic"),
      );
    }
  }

  return (
    <>
      <PageHeader
        title={schedule ? t("schedule:editTitle") : t("schedule:createTitle")}
        subtitle={t("schedule:weeklyLoad", {
          value: ScheduleService.formatMinutes(weeklyMinutes),
        })}
      />

      <div className="space-y-6 px-5 py-5 md:px-8">
        {schedule && schedule.employeeCount > 0 ? (
          <Alert variant="warning">
            {/* Aviso de alcance da tela 5c: quem edita precisa saber quantas
                pessoas a mudança atinge antes de salvar. */}
            {t("schedule:reach", { count: schedule.employeeCount })}
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label htmlFor="schedule-name">{t("schedule:form.name")}</Label>
            <Input
              id="schedule-name"
              className="mt-1.5"
              value={state.name}
              onChange={(e) => setCampo("name", e.currentTarget.value)}
              placeholder={t("schedule:form.namePlaceholder")}
            />
          </div>

          <div>
            <Label htmlFor="schedule-type">{t("schedule:form.type")}</Label>
            <Select
              id="schedule-type"
              className="mt-1.5"
              value={state.type}
              onChange={(e) =>
                setCampo("type", e.currentTarget.value as typeof state.type)
              }
            >
              {scheduleTypes.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {t(`schedule:type.${tipo}`)}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="schedule-tolerance">
                {t("schedule:form.tolerance")}
              </Label>
              <Input
                id="schedule-tolerance"
                className="mt-1.5 font-mono"
                type="number"
                min={0}
                max={120}
                value={state.toleranceMinutes}
                onChange={(e) =>
                  setCampo("toleranceMinutes", Number(e.currentTarget.value))
                }
              />
            </div>
            <div>
              <Label htmlFor="schedule-break">
                {t("schedule:form.minBreak")}
              </Label>
              <Input
                id="schedule-break"
                className="mt-1.5 font-mono"
                type="number"
                min={0}
                max={480}
                value={state.minBreakMinutes}
                onChange={(e) =>
                  setCampo("minBreakMinutes", Number(e.currentTarget.value))
                }
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-[15px] text-linen">
            {t("schedule:grid.title")}
          </h2>
          <p className="mb-3 text-[12.5px] text-n400">
            {t("schedule:grid.hint")}
          </p>
          <ScheduleDayGrid
            days={state.days}
            onToggleDay={alternarDia}
            onChangeDay={setDia}
            disabled={isSaving}
          />
        </div>

        {semDiaUtil ? (
          <Alert variant="warning">{t("schedule:errors.noWorkday")}</Alert>
        ) : null}

        {erro ? <Alert variant="danger">{erro}</Alert> : null}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            {t("common:cancel")}
          </Button>
          <Button
            onClick={() => void salvar()}
            disabled={isSaving || nomeInvalido || semDiaUtil}
          >
            {isSaving
              ? t("common:saving")
              : schedule
                ? t("schedule:form.saveChanges")
                : t("schedule:form.create")}
          </Button>
        </div>
      </div>
    </>
  );
}
