import { baseApi } from './baseApi';

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinanceStats: builder.query({
      query: () => '/finance/stats',
      providesTags: ['Finance', 'Dashboard'],
    }),
    getStudentAccounts: builder.query({
      query: ({ page = 1, limit = 10, search = '' } = {}) =>
        `/finance/accounts?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ['Finance'],
    }),
    getStudentAccount: builder.query({
      query: (studentId) => `/finance/accounts/${studentId}`,
      providesTags: (result, error, arg) => [{ type: 'Finance', id: arg }],
    }),
    getTransactions: builder.query({
      query: (params) => ({
        url: '/finance/transactions',
        params,
      }),
      providesTags: ['Finance'],
    }),
    getReceipts: builder.query({
      query: (params) => ({
        url: '/finance/receipts',
        params,
      }),
      providesTags: ['Finance'],
    }),
    getReceipt: builder.query({
      query: (id) => `/finance/receipts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Finance', id }],
    }),
    addPayment: builder.mutation({
      query: ({ studentId, data }) => ({
        url: `/finance/accounts/${studentId}/payment`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        'Finance', 'Dashboard', { type: 'Finance', id: studentId }
      ],
    }),
    addCharge: builder.mutation({
      query: ({ studentId, data }) => ({
        url: `/finance/accounts/${studentId}/charge`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        'Finance', 'Dashboard', { type: 'Finance', id: studentId }
      ],
    }),
    addCreditNote: builder.mutation({
      query: ({ studentId, data }) => ({
        url: `/finance/accounts/${studentId}/credit-note`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        'Finance', 'Dashboard', { type: 'Finance', id: studentId }
      ],
    }),
    addDebitNote: builder.mutation({
      query: ({ studentId, data }) => ({
        url: `/finance/accounts/${studentId}/debit-note`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        'Finance', 'Dashboard', { type: 'Finance', id: studentId }
      ],
    }),
    addExpense: builder.mutation({
      query: (data) => ({
        url: '/finance/transactions/expense',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Finance', 'Dashboard'],
    }),

    getDailyReport: builder.query({
      query: (params) => ({
        url: '/finance/reports/daily',
        params,
      }),
      providesTags: ['Finance'],
    }),
    getMonthlyReport: builder.query({
      query: () => '/finance/reports/monthly',
      providesTags: ['Finance'],
    }),
    getPendingReport: builder.query({
      query: () => '/finance/reports/pending-fees',
      providesTags: ['Finance'],
    }),
    getPLReport: builder.query({
      query: () => '/finance/reports/profit-loss',
      providesTags: ['Finance'],
    }),
  }),
});

export const {
  useGetFinanceStatsQuery,
  useGetStudentAccountsQuery,
  useGetStudentAccountQuery,
  useGetTransactionsQuery,
  useGetReceiptsQuery,
  useGetReceiptQuery,
  useAddPaymentMutation,
  useAddChargeMutation,
  useAddCreditNoteMutation,
  useAddDebitNoteMutation,
  useAddExpenseMutation,
  useGetDailyReportQuery,
  useGetMonthlyReportQuery,
  useGetPendingReportQuery,
  useGetPLReportQuery,
} = financeApi;
