import { describe, expect, it } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/reducers/slices/authSlice";
import { mockBaseQuery } from "@/lib/mock/mockBaseQuery";
import { createBaseApi } from "@/redux/reducers/queries/createBaseApi";
import { createFetchBaseQuery } from "@/redux/reducers/queries/fetchBaseQuery";
import { createSession, testDb } from "../mocks/db";
import { mockDb } from "@/lib/mock/mockDb";

describe("basequery.substitution", () => {
  it("H1 · mockBaseQuery e fetchBaseQuery+MSW retornam mesma forma na listagem", async () => {
    const userId = testDb.users[0]!.id;
    const token = createSession(userId);
    mockDb.sessions[token] = userId;

    // Sem `token`: a sessão real é cookie `HttpOnly` e não é representável no
    // estado do cliente. `status` é o que o mock e os guards observam agora.
    const preloadedState = {
      auth: {
        user: {
          id: testDb.users[0]!.id,
          email: testDb.users[0]!.email,
          name: testDb.users[0]!.name,
          role: testDb.users[0]!.role,
        },
        status: "authenticated" as const,
      },
    };

    const mockApi = createBaseApi(mockBaseQuery).injectEndpoints({
      endpoints: (builder) => ({
        getResources: builder.query<unknown, void>({
          query: () => ({ url: "/resources", method: "GET" }),
        }),
      }),
    });

    const fetchApi = createBaseApi(createFetchBaseQuery()).injectEndpoints({
      endpoints: (builder) => ({
        getResources: builder.query<unknown, void>({
          query: () => ({ url: "/resources", method: "GET" }),
        }),
      }),
    });

    const mockStore = configureStore({
      reducer: {
        auth: authReducer,
        api: mockApi.reducer,
      },
      middleware: (gDM) => gDM().concat(mockApi.middleware),
      preloadedState,
    });

    const fetchStore = configureStore({
      reducer: {
        auth: authReducer,
        api: fetchApi.reducer,
      },
      middleware: (gDM) => gDM().concat(fetchApi.middleware),
      preloadedState,
    });

    const mockResult = await mockStore.dispatch(
      mockApi.endpoints.getResources.initiate(),
    );
    const fetchResult = await fetchStore.dispatch(
      fetchApi.endpoints.getResources.initiate(),
    );

    expect(mockResult.data).toBeDefined();
    expect(fetchResult.data).toBeDefined();
    expect(Array.isArray(mockResult.data)).toBe(true);
    expect(Array.isArray(fetchResult.data)).toBe(true);

    const mockIds = (mockResult.data as { id: string }[]).map((r) => r.id).sort();
    const fetchIds = (fetchResult.data as { id: string }[]).map((r) => r.id).sort();
    expect(fetchIds).toEqual(mockIds);
  });
});
