import type { ApiErrorDetailValue } from "@/types/api";

export function extractBearerToken(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice("Bearer ".length);
}

export function jsonError(
  status: number,
  message: string,
  code?: string,
  details?: Record<string, ApiErrorDetailValue>,
) {
  return Response.json(
    { message, code, details },
    { status, headers: { "Content-Type": "application/json" } },
  );
}

export function unavailableResponse() {
  return jsonError(503, "Service unavailable", "server_unavailable", {
    occurredAt: new Date().toISOString(),
  });
}
