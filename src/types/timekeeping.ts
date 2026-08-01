export interface PendingSummary {
  /** Dias que precisam de decisão. */
  days: number;
  /** Quantos deles impedem o fechamento do período. */
  blockingClosure: number;
  /** Nome do período em aberto (ex.: "julho"). */
  periodLabel: string;
}

export interface AdjustmentSummary {
  /** Pedidos de correção aguardando análise. */
  count: number;
  /** Há quantos dias o mais antigo espera. */
  oldestWaitingDays: number;
}

export interface TimekeepingQueryArgs {
  scenario?: string;
}
