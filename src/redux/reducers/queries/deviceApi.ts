import { baseApi } from "@/redux/reducers/queries/baseApi";
import { withScenario } from "@/types/api";
import type {
  CreateDevicePayload,
  CreateDeviceResult,
  Device,
  DeviceDetail,
  DeviceListItem,
  DeviceQueryArgs,
} from "@/types/device";

export const deviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrimaryDevice: builder.query<Device, DeviceQueryArgs | void>({
      query: (args) => ({
        url: withScenario("/devices/primary", args?.scenario),
        method: "GET",
      }),
      providesTags: [{ type: "Device", id: "PRIMARY" }],
    }),
    getDeviceList: builder.query<DeviceListItem[], void>({
      query: () => ({ url: "/devices", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Device" as const, id })),
              { type: "Device", id: "LIST" },
            ]
          : [{ type: "Device", id: "LIST" }],
    }),
    getDeviceById: builder.query<DeviceDetail, string>({
      query: (id) => ({ url: `/devices/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Device", id }],
    }),
    createDevice: builder.mutation<CreateDeviceResult, CreateDevicePayload>({
      query: (body) => ({ url: "/devices", method: "POST", body }),
      invalidatesTags: [{ type: "Device", id: "LIST" }],
    }),
    rotateDeviceKey: builder.mutation<CreateDeviceResult, string>({
      query: (id) => ({
        url: `/devices/${id}/rotate-key`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "Device", id }],
    }),
  }),
});

export const {
  useGetPrimaryDeviceQuery,
  useGetDeviceListQuery,
  useGetDeviceByIdQuery,
  useCreateDeviceMutation,
  useRotateDeviceKeyMutation,
} = deviceApi;
