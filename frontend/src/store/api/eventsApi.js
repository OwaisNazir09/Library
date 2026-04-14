import { baseApi } from './baseApi';

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({
        url: '/events',
        params,
      }),
      providesTags: ['Event'],
    }),
    addEvent: builder.mutation({
      query: (data) => ({
        url: '/events',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Event'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useAddEventMutation,
} = eventsApi;
