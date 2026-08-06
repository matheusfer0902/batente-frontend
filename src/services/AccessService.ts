import type {
  AccessEvent,
  AccessEventPage,
  AccessTimelineStep,
  AccessTimelineTone,
} from "@/types/access";
import { TimeService, type TranslatableLabel } from "@/services/TimeService";

/** Tom visual da decisão — dirige cor de borda, ponto e rótulo. */
export type AccessTone = "granted" | "denied";

const TIME_MIRROR_HREF = "/espelho";

export class AccessService {
  static tone(event: AccessEvent): AccessTone {
    return event.decision === "GRANTED" ? "granted" : "denied";
  }

  static isIdentified(event: AccessEvent): boolean {
    return event.employee !== null;
  }

  /** Leitura feita durante a queda e enviada depois. */
  static isSyncedOffline(event: AccessEvent): boolean {
    return event.mode === "OFFLINE" && event.syncedAt !== null;
  }

  /** Nome do colaborador ou o rótulo de crachá sem vínculo. */
  static subjectLabel(event: AccessEvent): TranslatableLabel {
    return event.employee
      ? { key: "subject.employee", values: { name: event.employee.name } }
      : { key: "subject.unknownBadge" };
  }

  /** "MAT 20220023770 · OPERAÇÕES · CRACHÁ 04A2B3C4" — em partes traduzíveis. */
  static metaParts(event: AccessEvent): TranslatableLabel[] {
    if (!event.employee) {
      return [
        { key: "meta.badge", values: { badge: event.badgeCode } },
        { key: "meta.noBinding" },
      ];
    }

    return [
      { key: "meta.registration", values: { registration: event.employee.registration } },
      { key: "meta.department", values: { department: event.employee.department } },
      { key: "meta.badge", values: { badge: event.badgeCode } },
    ];
  }

  /** Nota abaixo da decisão, na linha do feed. */
  static outcomeLabel(event: AccessEvent): TranslatableLabel {
    if (event.decision === "DENIED") {
      return { key: "outcome.doorClosed" };
    }
    if (AccessService.isSyncedOffline(event)) {
      return {
        key: "outcome.syncedOffline",
        values: { time: TimeService.shortClock(event.syncedAt) ?? "" },
      };
    }
    return { key: "outcome.doorOpened" };
  }

  static decisionLabelKey(event: AccessEvent): string {
    return event.decision === "GRANTED" ? "decision.granted" : "decision.denied";
  }

  /**
   * Rótulo da coluna "Decisão" na tabela: quando barrado, mostra o motivo —
   * ali o motivo cabe e evita uma segunda coluna.
   */
  static decisionDetailKey(event: AccessEvent): string {
    if (event.decision === "GRANTED") return "decision.granted";
    return event.denialReason
      ? `denial.${event.denialReason}`
      : "decision.denied";
  }

  /**
   * Os quatro passos de "O que aconteceu" (2e). O service escolhe a mensagem;
   * a tradução acontece no componente.
   */
  static toTimeline(event: AccessEvent): AccessTimelineStep[] {
    const granted = event.decision === "GRANTED";
    const tone: AccessTimelineTone = granted ? "done" : "denied";

    return [
      AccessService.badgeStep(event, tone),
      AccessService.doorStep(event, tone),
      AccessService.timeEntryStep(event),
      AccessService.uploadStep(event),
    ];
  }

  private static badgeStep(
    event: AccessEvent,
    tone: AccessTimelineTone,
  ): AccessTimelineStep {
    if (!event.employee) {
      return {
        id: "badge",
        tone: "denied",
        titleKey: "timeline.badge.unknown.title",
        bodyKey: "timeline.badge.unknown.body",
        bodyValues: { badge: event.badgeCode },
      };
    }

    return {
      id: "badge",
      tone,
      titleKey: "timeline.badge.recognized.title",
      bodyKey: "timeline.badge.recognized.body",
      bodyValues: { name: event.employee.name },
    };
  }

  private static doorStep(
    event: AccessEvent,
    tone: AccessTimelineTone,
  ): AccessTimelineStep {
    if (event.doorOpenMs === null) {
      return {
        id: "door",
        tone: "denied",
        titleKey: "timeline.door.blocked.title",
        bodyKey: "timeline.door.blocked.body",
      };
    }

    return {
      id: "door",
      tone,
      titleKey: "timeline.door.opened.title",
      bodyKey: "timeline.door.opened.body",
      bodyValues: { duration: event.doorOpenMs },
    };
  }

  private static timeEntryStep(event: AccessEvent): AccessTimelineStep {
    if (!event.timeEntry) {
      return {
        id: "timeEntry",
        tone: "muted",
        titleKey: "timeline.timeEntry.skipped.title",
        bodyKey: "timeline.timeEntry.skipped.body",
      };
    }

    return {
      id: "timeEntry",
      tone: "done",
      titleKey: "timeline.timeEntry.registered.title",
      bodyKey: `timeline.timeEntry.registered.body.${event.timeEntry.kind}`,
      bodyValues: {
        date: TimeService.dayMonth(event.timeEntry.date) ?? event.timeEntry.date,
        schedule: event.timeEntry.scheduleName,
      },
      linkKey: "timeline.timeEntry.registered.link",
      href: TIME_MIRROR_HREF,
    };
  }

  private static uploadStep(event: AccessEvent): AccessTimelineStep {
    if (AccessService.isSyncedOffline(event)) {
      return {
        id: "upload",
        tone: "muted",
        titleKey: "timeline.upload.title",
        bodyKey: "timeline.upload.offline",
        bodyValues: { time: TimeService.shortClock(event.syncedAt) ?? "" },
      };
    }

    return {
      id: "upload",
      tone: "muted",
      titleKey: "timeline.upload.title",
      bodyKey: "timeline.upload.online",
    };
  }

  /**
   * Normaliza listagem de acessos: backend real devolve página; mock legado devolvia array.
   */
  static parseEventListResponse(data: unknown): AccessEventPage {
    if (Array.isArray(data)) {
      return {
        items: data,
        total: data.length,
        page: 1,
        limit: data.length || 1,
      };
    }

    if (
      data &&
      typeof data === "object" &&
      "items" in data &&
      Array.isArray((data as AccessEventPage).items)
    ) {
      const page = data as AccessEventPage;
      return {
        items: page.items,
        total: page.total ?? page.items.length,
        page: page.page ?? 1,
        limit: page.limit ?? (page.items.length || 1),
      };
    }

    return { items: [], total: 0, page: 1, limit: 1 };
  }
}
