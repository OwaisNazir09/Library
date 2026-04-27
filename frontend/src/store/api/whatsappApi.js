import { baseApi } from "./baseApi";

export const whatsappApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWhatsAppStatus: builder.query({
      query: () => "/whatsapp/status",
      providesTags: ["WhatsApp"],
    }),
    initWhatsApp: builder.mutation({
      query: () => ({
        url: "/whatsapp/init",
        method: "POST",
      }),
      invalidatesTags: ["WhatsApp"],
    }),
    logoutWhatsApp: builder.mutation({
      query: () => ({
        url: "/whatsapp/logout",
        method: "POST",
      }),
      invalidatesTags: ["WhatsApp"],
    }),
    getWhatsAppLogs: builder.query({
      query: () => "/whatsapp/logs",
      providesTags: ["WhatsApp"],
    }),
  }),
});

export const {
  useGetWhatsAppStatusQuery,
  useInitWhatsAppMutation,
  useLogoutWhatsAppMutation,
  useGetWhatsAppLogsQuery,
} = whatsappApi;
