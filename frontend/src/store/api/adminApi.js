import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),
    getTenants: builder.query({
      query: (params) => ({
        url: '/admin/libraries',
        params,
      }),
      providesTags: ['Admin'],
    }),
    createTenant: builder.mutation({
      query: (data) => ({
        url: '/admin/libraries',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin'],
    }),
    updateTenant: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/libraries/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Admin'],
    }),
    deleteTenant: builder.mutation({
      query: (id) => ({
        url: `/admin/libraries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),
    getLibraryAnalytics: builder.query({
      query: (id) => `/admin/libraries/${id}/analytics`,
      providesTags: ['Admin'],
    }),
    getGlobalUsers: builder.query({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['Admin'],
    }),
    updateGlobalUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Admin'],
    }),
    getQueries: builder.query({
      query: () => '/admin/queries',
      providesTags: ['Admin'],
    }),
    updateQuery: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/queries/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Admin'],
    }),
    getPlans: builder.query({
      query: () => '/admin/packages',
      providesTags: ['Subscription'],
    }),
    createPlan: builder.mutation({
      query: (data) => ({
        url: '/admin/packages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),
    updatePlan: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/packages/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),
    deletePlan: builder.mutation({
      query: (id) => ({
        url: `/admin/packages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscription'],
    }),
    assignPlan: builder.mutation({
      query: (data) => ({
        url: '/admin/assign-package',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin', 'Subscription'],
    }),
    getSubscriptionAnalytics: builder.query({
      query: () => '/admin/packages/analytics',
      providesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetTenantsQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useGetLibraryAnalyticsQuery,
  useGetGlobalUsersQuery,
  useUpdateGlobalUserMutation,
  useGetQueriesQuery,
  useUpdateQueryMutation,
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useAssignPlanMutation,
  useGetSubscriptionAnalyticsQuery,
} = adminApi;
