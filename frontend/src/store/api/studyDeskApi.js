import { baseApi } from './baseApi';

export const studyDeskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTables: builder.query({
      query: (params) => ({
        url: '/tables',
        params,
      }),
      providesTags: ['StudyDesk'],
    }),
    addTable: builder.mutation({
      query: (data) => ({
        url: '/tables',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StudyDesk'],
    }),
    updateTable: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/tables/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['StudyDesk', { type: 'StudyDesk', id }],
    }),
    deleteTable: builder.mutation({
      query: (id) => ({
        url: `/tables/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudyDesk'],
    }),
    assignTable: builder.mutation({
      query: ({ id, ...assignmentData }) => ({
        url: `/tables/${id}/assign`,
        method: 'POST',
        body: assignmentData,
      }),
      invalidatesTags: (result, error, { id }) => ['StudyDesk', 'User', { type: 'StudyDesk', id }],
    }),
    unassignTable: builder.mutation({
      query: (id) => ({
        url: `/tables/${id}/unassign`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => ['StudyDesk', 'User', { type: 'StudyDesk', id }],
    }),
    bookTable: builder.mutation({
      query: (bookingData) => ({
        url: '/tables/book',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['StudyDesk'],
    }),
  }),
});

export const {
  useGetTablesQuery,
  useAddTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
  useAssignTableMutation,
  useUnassignTableMutation,
  useBookTableMutation,
} = studyDeskApi;
