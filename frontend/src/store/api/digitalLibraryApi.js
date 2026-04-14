import { baseApi } from './baseApi';

export const digitalLibraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getResources: builder.query({
      query: (params) => ({
        url: '/resources',
        params,
      }),
      providesTags: ['Resource'],
    }),
    addResource: builder.mutation({
      query: (data) => ({
        url: '/resources',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Resource'],
    }),
    updateResource: builder.mutation({
      query: ({ id, data }) => ({
        url: `/resources/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Resource', { type: 'Resource', id }],
    }),
    deleteResource: builder.mutation({
      query: (id) => ({
        url: `/resources/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Resource'],
    }),
    trackDownload: builder.mutation({
      query: (id) => ({
        url: `/resources/${id}/download`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Resource', id }],
    }),
  }),
});

export const {
  useGetResourcesQuery,
  useAddResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useTrackDownloadMutation,
} = digitalLibraryApi;
