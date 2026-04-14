import { baseApi } from './baseApi';

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinanceStats: builder.query({
      query: () => '/finance/stats',
      providesTags: ['Finance', 'Dashboard'],
    }),

    getAccounts: builder.query({
      query: (params) => ({
        url: '/finance/accounts',
        params
      }),
      providesTags: ['Finance'],
    }),
    addAccount: builder.mutation({
      query: (data) => ({
        url: '/finance/accounts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Finance'],
    }),
    getAccountLedger: builder.query({
      query: (id) => `/finance/accounts/${id}/ledger`,
      providesTags: (result, error, id) => [{ type: 'Finance', id }],
    }),

    // --- Transactions ---
    getTransactions: builder.query({
      query: (params) => ({
        url: '/finance/transactions',
        params,
      }),
      providesTags: ['Finance'],
    }),
    addTransaction: builder.mutation({
      query: (data) => ({
        url: '/finance/transactions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Finance', 'Dashboard'],
    }),
    addJournalEntry: builder.mutation({
      query: (data) => ({
        url: '/finance/transactions/journal',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Finance', 'Dashboard'],
    }),
    addTransfer: builder.mutation({
      query: (data) => ({
        url: '/finance/transactions/transfer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Finance', 'Dashboard'],
    }),

    // --- Student Specific Shortcuts ---
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

    // --- Receipts ---
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

    // --- Professional Reports ---
    getTrialBalance: builder.query({
      query: () => '/finance/reports/trial-balance',
      providesTags: ['Finance'],
    }),
    getProfitAndLoss: builder.query({
      query: () => '/finance/reports/profit-loss',
      providesTags: ['Finance'],
    }),
    getBalanceSheet: builder.query({
      query: () => '/finance/reports/balance-sheet',
      providesTags: ['Finance'],
    }),
  }),
});

export const {
  useGetFinanceStatsQuery,
  useGetAccountsQuery,
  useAddAccountMutation,
  useGetAccountLedgerQuery,
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useAddJournalEntryMutation,
  useAddTransferMutation,
  useAddPaymentMutation,
  useAddChargeMutation,
  useGetReceiptsQuery,
  useGetReceiptQuery,
  useGetTrialBalanceQuery,
  useGetProfitAndLossQuery,
  useGetBalanceSheetQuery,
} = financeApi;
