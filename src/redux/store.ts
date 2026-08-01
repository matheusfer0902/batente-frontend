import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/reducers/slices/authSlice";
import { baseApi } from "@/redux/reducers/queries/baseApi";
import "@/redux/reducers/queries/authApi";
import "@/redux/reducers/queries/resourceApi";
import "@/redux/reducers/queries/accessApi";
import "@/redux/reducers/queries/deviceApi";
import "@/redux/reducers/queries/timekeepingApi";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
