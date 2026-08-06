import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/reducers/slices/authSlice";
import { baseApi } from "@/redux/reducers/queries/baseApi";
import "@/redux/reducers/queries/authApi";
import "@/redux/reducers/queries/accessApi";
import "@/redux/reducers/queries/deviceApi";
import "@/redux/reducers/queries/timekeepingApi";
import "@/redux/reducers/queries/departmentApi";
import "@/redux/reducers/queries/employeeApi";
import "@/redux/reducers/queries/badgeApi";
import "@/redux/reducers/queries/scheduleApi";
import "@/redux/reducers/queries/absenceApi";
import "@/redux/reducers/queries/auditApi";
import "@/redux/reducers/queries/gateApi";
import "@/redux/reducers/queries/settingsApi";
import "@/redux/reducers/queries/userApi";

/**
 * Uma instância de API só. O roteamento entre backend real e mock acontece
 * dentro do base query, por prefixo de URL — ver `queries/hybridBaseQuery.ts`.
 *
 * `rootReducer` é extraído e `RootState` derivado **dele**, não de
 * `ReturnType<AppStore["getState"]>`. Derivar do store fecha um ciclo — o tipo
 * do store depende do `preloadedState`, que é tipado com `RootState` — e o
 * TypeScript desiste da comparação, reclamando que dois tipos de mesmo nome
 * "não têm relação". Com o reducer como origem, o tipo é resolvido antes de
 * qualquer store existir.
 *
 * A chave é literal (`api`) e não `[baseApi.reducerPath]` porque a chave
 * computada é inferida como `string`, o que degrada o mapa numa assinatura de
 * índice.
 */
const rootReducer = combineReducers({
  auth: authReducer,
  api: baseApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

export { rootReducer };
