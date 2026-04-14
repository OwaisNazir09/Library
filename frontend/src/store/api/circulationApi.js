import { baseApi } from './baseApi';

export const circulationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBorrowings: builder.query({
      query: (params) => ({
        url: '/borrowings',
        params,
      }),
      providesTags: ['Borrowing'],
    }),
    issueBook: builder.mutation({
      query: (data) => ({
        url: '/borrowings/borrow',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Borrowing', 'Books', 'Dashboard'],
    }),
    returnBook: builder.mutation({
      query: (id) => ({
        url: `/borrowings/return/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Borrowing', 'Books', 'Dashboard'],
    }),
    renewBook: builder.mutation({
      query: (id) => ({
        url: `/borrowings/renew/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Borrowing'],
    }),
  }),
});

export const {
  useGetBorrowingsQuery,
  useIssueBookMutation,
  useReturnBookMutation,
  useRenewBookMutation,
} = circulationApi;
