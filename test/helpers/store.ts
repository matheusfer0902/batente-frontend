import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/reducers/slices/authSlice";
import { baseApi } from "@/redux/reducers/queries/baseApi";
import "@/redux/reducers/queries/authApi";
import "@/redux/reducers/queries/resourceApi";
import "@/redux/reducers/queries/accessApi";
import "@/redux/reducers/queries/deviceApi";
import "@/redux/reducers/queries/timekeepingApi";
import type { RootState } from "@/redux/store";

export type TestStore = ReturnType<typeof makeTestStore>;

/**
 * Store de teste — em Vitest, `baseApi` já usa `fetchBaseQuery` + MSW.
 * Estado novo a cada teste para evitar flaky.
 */
export function makeTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState: preloadedState as RootState | undefined,
  });
}
