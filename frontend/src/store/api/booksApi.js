import { baseApi } from './baseApi';

export const booksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query({
      query: (params) => ({
        url: '/books',
        params,
      }),
      providesTags: ['Books'],
    }),
    getBook: builder.query({
      query: (id) => `/books/${id}`,
      providesTags: (result, error, id) => [{ type: 'Books', id }],
    }),
    addBook: builder.mutation({
      query: (data) => ({
        url: '/books',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Books'],
    }),
    updateBook: builder.mutation({
      query: ({ id, data }) => ({
        url: `/books/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Books', { type: 'Books', id }],
    }),
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/books/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Books'],
    }),
    
    // Quick actions
    toggleBookAvailability: builder.mutation({
      query: (id) => ({
        url: `/books/${id}/toggle-availability`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => ['Books', { type: 'Books', id }],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useAddBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useToggleBookAvailabilityMutation,
} = booksApi;
