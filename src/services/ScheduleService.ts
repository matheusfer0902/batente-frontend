import type {
  ScheduleDay,
  ScheduleDayPayload,
  ScheduleListItem,
  Weekday,
} from "@/types/schedule";

const MINUTOS_POR_HORA = 60;

/**
 * Lógica pura da escala — sem React, sem Redux.
 *
 * O cálculo de carga existe **também** no backend (`WorkloadPolicy`), e isso é
 * proposital: aqui ele serve ao "recalculada a cada campo preenchido" da tela
 * 20, que precisa responder enquanto se digita. O número que é gravado é
 * sempre o do servidor.
 */
export const ScheduleService = {
  /** `528` → `"08:48"`. Nunca decimal: 8,8 não é 8h48. */
  formatMinutes(total: number): string {
    const sinal = total < 0 ? "-" : "";
    const absoluto = Math.abs(total);
    const horas = Math.floor(absoluto / MINUTOS_POR_HORA);
    const minutos = absoluto % MINUTOS_POR_HORA;

    return `${sinal}${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
  },

  /** `"08:00"` → minutos desde a meia-noite. `null` quando inválido. */
  toMinutes(hora: string | null | undefined): number | null {
    if (!hora) return null;

    const partes = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hora);
    if (!partes) return null;

    return Number(partes[1]) * MINUTOS_POR_HORA + Number(partes[2]);
  },

  /** Carga de um dia: jornada menos intervalo. `0` em folga ou dado incompleto. */
  dayMinutes(dia: ScheduleDayPayload): number {
    if (!dia.isWorkday) return 0;

    const entrada = ScheduleService.toMinutes(dia.entryTime);
    const saida = ScheduleService.toMinutes(dia.exitTime);
    if (entrada === null || saida === null || saida <= entrada) return 0;

    const inicioPausa = ScheduleService.toMinutes(dia.breakStart);
    const fimPausa = ScheduleService.toMinutes(dia.breakEnd);
    const pausa =
      inicioPausa !== null && fimPausa !== null && fimPausa > inicioPausa
        ? fimPausa - inicioPausa
        : 0;

    return Math.max(saida - entrada - pausa, 0);
  },

  weeklyMinutes(dias: readonly ScheduleDayPayload[]): number {
    return dias.reduce((total, dia) => total + ScheduleService.dayMinutes(dia), 0);
  },

  /**
   * Resumo textual da tela 19: "SEG A SEX · 08:00–12:00 · 13:00–17:48".
   *
   * Agrupa dias úteis consecutivos com o mesmo horário — sem isso a linha
   * viraria sete repetições do mesmo intervalo.
   */
  summarize(
    dias: readonly ScheduleDay[],
    nomeDoDia: (weekday: Weekday) => string,
  ): string {
    const uteis = [...dias]
      .filter((dia) => dia.isWorkday)
      .sort((a, b) => a.weekday - b.weekday);

    if (uteis.length === 0) return "";

    const blocos: string[] = [];
    let inicio = uteis[0]!;
    let anterior = uteis[0]!;

    const fecharBloco = (fim: ScheduleDay) => {
      const faixa =
        inicio.weekday === fim.weekday
          ? nomeDoDia(inicio.weekday)
          : `${nomeDoDia(inicio.weekday)} a ${nomeDoDia(fim.weekday)}`;

      blocos.push(`${faixa} · ${horarioDoDia(inicio)}`);
    };

    for (const dia of uteis.slice(1)) {
      const contiguo = dia.weekday === anterior.weekday + 1;

      if (contiguo && mesmoHorario(dia, anterior)) {
        anterior = dia;
        continue;
      }

      fecharBloco(anterior);
      inicio = dia;
      anterior = dia;
    }

    fecharBloco(anterior);

    return blocos.join(" · ");
  },

  sortByName(escalas: ScheduleListItem[]): ScheduleListItem[] {
    return [...escalas].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  },
};

function mesmoHorario(a: ScheduleDay, b: ScheduleDay): boolean {
  return (
    a.entryTime === b.entryTime &&
    a.exitTime === b.exitTime &&
    a.breakStart === b.breakStart &&
    a.breakEnd === b.breakEnd
  );
}

function horarioDoDia(dia: ScheduleDay): string {
  if (dia.breakStart && dia.breakEnd) {
    return `${dia.entryTime}–${dia.breakStart} · ${dia.breakEnd}–${dia.exitTime}`;
  }

  return `${dia.entryTime}–${dia.exitTime}`;
}
