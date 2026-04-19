import { baseApi } from './baseApi';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params) => ({
        url: '/notifications',
        params,
      }),
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/mark-as-read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    sendPushNotification: builder.mutation({
      query: (data) => ({
        url: '/notifications/send',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useSendPushNotificationMutation,
} = notificationApi;
