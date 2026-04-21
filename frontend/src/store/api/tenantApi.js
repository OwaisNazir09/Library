import { baseApi } from './baseApi';

export const tenantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentTenant: builder.query({
      query: () => '/tenants/current',
      providesTags: ['Tenant'],
    }),
  }),
});

export const { useGetCurrentTenantQuery } = tenantApi;
