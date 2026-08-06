import { baseApi } from "@/redux/reducers/queries/baseApi";
import type { SettingItem } from "@/types/settings";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettingsList: builder.query<SettingItem[], void>({
      query: () => ({ url: "/settings", method: "GET" }),
      providesTags: [{ type: "Settings", id: "LIST" }],
    }),
  }),
});

export const { useGetSettingsListQuery } = settingsApi;
