import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),
    getTenants: builder.query({
      query: (params) => ({
        url: '/admin/tenants',
        params,
      }),
      providesTags: ['Admin'],
    }),
    createTenant: builder.mutation({
      query: (data) => ({
        url: '/admin/tenants',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin'],
    }),
    deleteTenant: builder.mutation({
      query: (id) => ({
        url: `/admin/tenants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetTenantsQuery,
  useCreateTenantMutation,
  useDeleteTenantMutation,
} = adminApi;
