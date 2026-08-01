import { baseApi } from "@/redux/reducers/queries/baseApi";
import { withScenario } from "@/types/api";
import type { Device, DeviceQueryArgs } from "@/types/device";

export const deviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrimaryDevice: builder.query<Device, DeviceQueryArgs | void>({
      query: (args) => ({
        url: withScenario("/devices/primary", args?.scenario),
        method: "GET",
      }),
      providesTags: [{ type: "Device", id: "PRIMARY" }],
    }),
  }),
});

export const { useGetPrimaryDeviceQuery } = deviceApi;
