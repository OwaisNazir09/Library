import { baseApi } from './baseApi';
import { setCredentials } from '../slices/authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          if (data.tenantId) {
            localStorage.setItem('tenantId', data.tenantId);
          }
          dispatch(setCredentials({
            user: data.data.user,
            token: data.token,
            role: data.role,
            tenantId: data.tenantId,
          }));
        } catch (error) {
        }
      },
      invalidatesTags: ['Auth'],
    }),
    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useGetProfileQuery } = authApi;
