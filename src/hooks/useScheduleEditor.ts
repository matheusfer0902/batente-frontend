"use client";

import { useCallback, useMemo, useState } from "react";
import { ScheduleService } from "@/services/ScheduleService";
import type {
  ScheduleDayPayload,
  ScheduleDetail,
  ScheduleType,
  Weekday,
} from "@/types/schedule";
import { weekdays } from "@/types/schedule";

/** Jornada padrão que a tela 20 já mostra preenchida ao abrir. */
const PADRAO = {
  entryTime: "08:00",
  breakStart: "12:00",
  breakEnd: "13:00",
  exitTime: "17:00",
};

export interface ScheduleEditorState {
  name: string;
  type: ScheduleType;
  toleranceMinutes: number;
  minBreakMinutes: number;
  days: ScheduleDayPayload[];
}

function gradeInicial(): ScheduleDayPayload[] {
  return weekdays.map((weekday) => {
    // Sábado e domingo entram desmarcados: é a jornada mais comum, e desmarcar
    // custa menos que preencher.
    const util = weekday >= 1 && weekday <= 5;

    return util
      ? { weekday, isWorkday: true, ...PADRAO }
      : {
          weekday,
          isWorkday: false,
          entryTime: null,
          breakStart: null,
          breakEnd: null,
          exitTime: null,
        };
  });
}

function daPartida(escala: ScheduleDetail): ScheduleEditorState {
  return {
    name: escala.name,
    type: escala.type,
    toleranceMinutes: escala.toleranceMinutes,
    minBreakMinutes: escala.minBreakMinutes,
    days: escala.days.map((dia) => ({
      weekday: dia.weekday,
      isWorkday: dia.isWorkday,
      entryTime: dia.entryTime,
      breakStart: dia.breakStart,
      breakEnd: dia.breakEnd,
      exitTime: dia.exitTime,
    })),
  };
}

/**
 * Estado do editor de escala (telas 20 e 21).
 *
 * A carga semanal é recalculada aqui a cada tecla — é o "recalculada a cada
 * campo preenchido" do design, e serve para o erro aparecer antes de salvar.
 * O valor gravado, porém, é sempre o que o backend calcula: `WorkloadPolicy` é
 * quem tem a palavra final, e o formulário não envia `expectedMinutes`.
 */
export function useScheduleEditor(escala?: ScheduleDetail) {
  const [state, setState] = useState<ScheduleEditorState>(() =>
    escala
      ? daPartida(escala)
      : {
          name: "",
          type: "FIXED",
          toleranceMinutes: 10,
          minBreakMinutes: 60,
          days: gradeInicial(),
        },
  );

  const setCampo = useCallback(
    <K extends keyof ScheduleEditorState>(
      campo: K,
      valor: ScheduleEditorState[K],
    ) => setState((atual) => ({ ...atual, [campo]: valor })),
    [],
  );

  const setDia = useCallback(
    (weekday: Weekday, mudanca: Partial<ScheduleDayPayload>) =>
      setState((atual) => ({
        ...atual,
        days: atual.days.map((dia) =>
          dia.weekday === weekday ? { ...dia, ...mudanca } : dia,
        ),
      })),
    [],
  );

  const alternarDia = useCallback(
    (weekday: Weekday, util: boolean) =>
      setDia(
        weekday,
        util
          ? { isWorkday: true, ...PADRAO }
          : {
              isWorkday: false,
              entryTime: null,
              breakStart: null,
              breakEnd: null,
              exitTime: null,
            },
      ),
    [setDia],
  );

  const weeklyMinutes = useMemo(
    () => ScheduleService.weeklyMinutes(state.days),
    [state.days],
  );

  return { state, setCampo, setDia, alternarDia, weeklyMinutes };
}
