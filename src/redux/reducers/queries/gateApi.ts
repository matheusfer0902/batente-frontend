import { baseApi } from "@/redux/reducers/queries/baseApi";
import type { GateMonitorData } from "@/types/gate";

export const gateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGateMonitor: builder.query<GateMonitorData, void>({
      query: () => ({ url: "/gate", method: "GET" }),
      providesTags: [{ type: "Gate", id: "MONITOR" }],
    }),
  }),
});

export const { useGetGateMonitorQuery } = gateApi;
