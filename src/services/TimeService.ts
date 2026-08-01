/** Rótulo pronto para o i18n: a chave e os valores de interpolação. */
export interface TranslatableLabel {
  key: string;
  values?: Record<string, string | number>;
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export class TimeService {
  /**
   * "há 4s" / "há 12min" — devolve chave e valor; quem traduz é o componente.
   * Só arredonda para baixo: 119s vira "1min", nunca "2min".
   */
  static relativeLabel(elapsedMs: number): TranslatableLabel {
    const elapsed = Math.max(elapsedMs, 0);

    if (elapsed < MINUTE_MS) {
      return { key: "time.secondsAgo", values: { count: Math.floor(elapsed / 1000) } };
    }
    if (elapsed < HOUR_MS) {
      return { key: "time.minutesAgo", values: { count: Math.floor(elapsed / MINUTE_MS) } };
    }
    if (elapsed < DAY_MS) {
      return { key: "time.hoursAgo", values: { count: Math.floor(elapsed / HOUR_MS) } };
    }
    return { key: "time.daysAgo", values: { count: Math.floor(elapsed / DAY_MS) } };
  }

  /** `HH:MM:SS` no fuso do cliente. */
  static clock(isoDate: string | null | undefined): string | null {
    const date = TimeService.parse(isoDate);
    if (!date) return null;
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  /** `HH:MM:SS.mmm` — precisão de carimbo do totem. */
  static clockWithMillis(isoDate: string | null | undefined): string | null {
    const date = TimeService.parse(isoDate);
    if (!date) return null;
    const base = TimeService.clock(isoDate);
    return base
      ? `${base}.${String(date.getMilliseconds()).padStart(3, "0")}`
      : null;
  }

  /** `HH:MM`. */
  static shortClock(isoDate: string | null | undefined): string | null {
    const date = TimeService.parse(isoDate);
    if (!date) return null;
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  /** `31/07/2026`. */
  static shortDate(isoDate: string | null | undefined): string | null {
    const date = TimeService.parse(isoDate);
    if (!date) return null;
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  /** `31/07` — dia do ponto, sem o ano. */
  static dayMonth(isoDate: string | null | undefined): string | null {
    const date = TimeService.parse(isoDate);
    if (!date) return null;
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
  }

  /** "Sexta-feira, 31 de julho de 2026" no idioma ativo. */
  static longDate(isoDate: string | null | undefined, locale: string): string | null {
    const date = TimeService.parse(isoDate);
    if (!date) return null;
    const formatted = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  /** "+18ms" — o sinal importa: mostra se o totem adianta ou atrasa. */
  static drift(driftMs: number | null | undefined): string | null {
    if (driftMs === null || driftMs === undefined) return null;
    const sign = driftMs > 0 ? "+" : "";
    return `${sign}${driftMs}ms`;
  }

  static elapsedSince(isoDate: string | null | undefined, reference: number): number | null {
    const date = TimeService.parse(isoDate);
    if (!date) return null;
    return Math.max(reference - date.getTime(), 0);
  }

  private static parse(isoDate: string | null | undefined): Date | null {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
