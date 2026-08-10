"use client";

import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScheduleService } from "@/services/ScheduleService";
import { cn } from "@/lib/utils";
import type { ScheduleDayPayload, Weekday } from "@/types/schedule";

const HEAD =
  "border-b border-border px-3 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

interface ScheduleDayGridProps {
  days: readonly ScheduleDayPayload[];
  onToggleDay: (weekday: Weekday, isWorkday: boolean) => void;
  onChangeDay: (weekday: Weekday, mudanca: Partial<ScheduleDayPayload>) => void;
  disabled?: boolean;
}

/**
 * "Os sete dias" da tela 20.
 *
 * Os sete aparecem sempre, inclusive as folgas — a grade é fixa, e desmarcar é
 * o que transforma o dia em folga. O total por linha vem do mesmo serviço que
 * soma a semana, para as duas contas não divergirem.
 */
export function ScheduleDayGrid({
  days,
  onToggleDay,
  onChangeDay,
  disabled,
}: ScheduleDayGridProps) {
  const { t } = useTranslation("schedule");

  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-gun-950">
      <table className="w-full min-w-[640px] border-collapse text-[13px]">
        <thead>
          <tr>
            <th className={cn(HEAD, "w-[22%]")}>{t("grid.day")}</th>
            <th className={HEAD}>{t("grid.entry")}</th>
            <th className={HEAD}>{t("grid.breakStart")}</th>
            <th className={HEAD}>{t("grid.breakEnd")}</th>
            <th className={HEAD}>{t("grid.exit")}</th>
            <th className={cn(HEAD, "text-right")}>{t("grid.total")}</th>
          </tr>
        </thead>
        <tbody>
          {days.map((dia) => {
            const total = ScheduleService.dayMinutes(dia);

            return (
              <tr
                key={dia.weekday}
                className="border-b border-border last:border-b-0"
              >
                <td className="px-3 py-2">
                  <label className="flex items-center gap-2.5">
                    <Checkbox
                      checked={dia.isWorkday}
                      disabled={disabled}
                      onChange={(e) =>
                        onToggleDay(dia.weekday, e.currentTarget.checked)
                      }
                      aria-label={t(`weekday.${dia.weekday}`)}
                    />
                    <span
                      className={dia.isWorkday ? "text-linen" : "text-n400"}
                    >
                      {t(`weekday.${dia.weekday}`)}
                    </span>
                  </label>
                </td>

                {dia.isWorkday ? (
                  <>
                    <HoraCell
                      dia={dia}
                      campo="entryTime"
                      onChangeDay={onChangeDay}
                      disabled={disabled}
                    />
                    <HoraCell
                      dia={dia}
                      campo="breakStart"
                      onChangeDay={onChangeDay}
                      disabled={disabled}
                    />
                    <HoraCell
                      dia={dia}
                      campo="breakEnd"
                      onChangeDay={onChangeDay}
                      disabled={disabled}
                    />
                    <HoraCell
                      dia={dia}
                      campo="exitTime"
                      onChangeDay={onChangeDay}
                      disabled={disabled}
                    />
                  </>
                ) : (
                  <td
                    className="px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-n400"
                    colSpan={4}
                  >
                    {t("grid.dayOff")}
                  </td>
                )}

                <td className="px-3 py-2 text-right font-mono text-n300">
                  {dia.isWorkday ? ScheduleService.formatMinutes(total) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type CampoDeHora = "entryTime" | "breakStart" | "breakEnd" | "exitTime";

function HoraCell({
  dia,
  campo,
  onChangeDay,
  disabled,
}: {
  dia: ScheduleDayPayload;
  campo: CampoDeHora;
  onChangeDay: (weekday: Weekday, mudanca: Partial<ScheduleDayPayload>) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation("schedule");

  return (
    <td className="px-3 py-2">
      {/* `type="time"` dá máscara e teclado numérico de graça, e no celular
          abre o seletor do sistema. O valor sai já em HH:MM. */}
      <Input
        type="time"
        className="h-9 w-[7.5rem] font-mono"
        value={dia[campo] ?? ""}
        disabled={disabled}
        aria-label={`${t(`grid.${campoParaChave(campo)}`)} — ${t(`weekday.${dia.weekday}`)}`}
        onChange={(e) =>
          onChangeDay(dia.weekday, { [campo]: e.currentTarget.value || null })
        }
      />
    </td>
  );
}

function campoParaChave(campo: CampoDeHora): string {
  return campo === "entryTime"
    ? "entry"
    : campo === "exitTime"
      ? "exit"
      : campo === "breakStart"
        ? "breakStart"
        : "breakEnd";
}
