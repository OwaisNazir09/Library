import { baseApi } from './baseApi';

export const membershipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPackages: builder.query({
      query: (params) => ({
        url: '/packages',
        params,
      }),
      providesTags: ['Membership'],
    }),
    getPackage: builder.query({
      query: (id) => `/packages/${id}`,
      providesTags: (result, error, id) => [{ type: 'Membership', id }],
    }),
    addPackage: builder.mutation({
      query: (data) => ({
        url: '/packages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Membership'],
    }),
    updatePackage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/packages/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Membership', { type: 'Membership', id }],
    }),
    deletePackage: builder.mutation({
      query: (id) => ({
        url: `/packages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Membership'],
    }),
    assignPackage: builder.mutation({
      query: ({ userId, packageId }) => ({
        url: `/users/${userId}/assign-package`,
        method: 'POST',
        body: { packageId },
      }),
      invalidatesTags: (result, error, { userId }) => ['User', 'Membership', { type: 'User', id: userId }],
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useGetPackageQuery,
  useAddPackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  useAssignPackageMutation,
} = membershipApi;
