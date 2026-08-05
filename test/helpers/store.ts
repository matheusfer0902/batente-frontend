import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/redux/reducers/queries/baseApi";
import "@/redux/reducers/queries/authApi";
import "@/redux/reducers/queries/resourceApi";
import "@/redux/reducers/queries/accessApi";
import "@/redux/reducers/queries/deviceApi";
import "@/redux/reducers/queries/timekeepingApi";
import { rootReducer, type RootState } from "@/redux/store";

export type TestStore = ReturnType<typeof makeTestStore>;

/**
 * Store de teste — reusa o `rootReducer` da aplicação em vez de remontar o mapa
 * de reducers. Remontar deixava as duas definições livres para divergir, e um
 * store de teste com forma diferente da real testa outra coisa.
 *
 * Estado novo por teste para evitar vazamento entre casos.
 */
export function makeTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState: preloadedState as RootState | undefined,
  });
}
