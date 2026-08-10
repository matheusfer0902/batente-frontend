import type { ApiError } from "@/types/api";

/**
 * Lê o `code` estável de uma recusa da API.
 *
 * O backend responde `{ statusCode, message, code }` — o `code` é o contrato,
 * a `message` é texto para humano e pode mudar. Comparar mensagem seria ligar a
 * interface a uma string de servidor; comparar `code` sobrevive à tradução.
 *
 * O mesmo formato sai do mock (`lib/mock/handlers/shared.ts`), então a tela não
 * distingue mock de backend real.
 */
export function apiErrorCode(causa: unknown): string | undefined {
  if (!causa || typeof causa !== "object") return undefined;

  const data = (causa as Partial<ApiError>).data;

  return typeof data?.code === "string" ? data.code : undefined;
}

export function apiErrorStatus(causa: unknown): number | undefined {
  if (!causa || typeof causa !== "object") return undefined;

  const status = (causa as Partial<ApiError>).status;

  return typeof status === "number" ? status : undefined;
}
