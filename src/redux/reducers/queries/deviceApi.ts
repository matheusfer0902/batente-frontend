import { baseApi } from "@/redux/reducers/queries/baseApi";
import { withScenario } from "@/types/api";
import type {
  CreateDevicePayload,
  Device,
  DeviceDetail,
  DeviceListItem,
  DeviceQueryArgs,
  DeviceWithSecret,
  UpdateDevicePayload,
} from "@/types/device";

export const deviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Bloco do painel — aberto também ao OPERADOR, vive no módulo `access`. */
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
    createDevice: builder.mutation<DeviceWithSecret, CreateDevicePayload>({
      query: (body) => ({ url: "/devices", method: "POST", body }),
      invalidatesTags: [
        { type: "Device", id: "LIST" },
        { type: "Device", id: "PRIMARY" },
      ],
    }),
    updateDevice: builder.mutation<DeviceDetail, UpdateDevicePayload>({
      query: ({ id, ...body }) => ({
        url: `/devices/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Device", id },
        { type: "Device", id: "LIST" },
        { type: "Device", id: "PRIMARY" },
      ],
    }),
    /**
     * A chave anterior morre no COMMIT. O totem em campo passa a receber 401
     * até alguém regravar o `secrets.h` — é o procedimento de totem furtado,
     * não um efeito colateral.
     */
    rotateDeviceKey: builder.mutation<DeviceWithSecret, string>({
      query: (id) => ({ url: `/devices/${id}/rotate-key`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Device", id }],
    }),
  }),
});

export const {
  useGetPrimaryDeviceQuery,
  useGetDeviceListQuery,
  useGetDeviceByIdQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useRotateDeviceKeyMutation,
} = deviceApi;
