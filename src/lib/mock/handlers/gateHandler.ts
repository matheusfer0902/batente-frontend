import { mockDb, readPrimaryDevice } from "@/lib/mock/mockDb";
import {
  notFound,
  requireAuth,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

export function handleGateRoute({
  path,
  method,
  state,
}: MockRequest): HandlerResult {
  const authResult = requireAuth(state);
  if ("error" in authResult) return authResult.error;

  if (method !== "GET") {
    return notFound();
  }

  if (path === "/gate/queue") {
    return { data: mockDb.gateQueue };
  }

  if (path === "/gate/credentials") {
    return { data: mockDb.gateCredentials };
  }

  if (path === "/gate") {
    const device = readPrimaryDevice();
    return {
      data: {
        queue: mockDb.gateQueue,
        credentials: mockDb.gateCredentials,
        deviceOnline: device.status === "ONLINE",
      },
    };
  }

  return notFound();
}
