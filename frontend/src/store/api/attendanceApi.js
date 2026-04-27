import { baseApi } from './baseApi';

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAttendance: builder.query({
      query: (params) => ({
        url: '/attendance',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    getAttendanceStats: builder.query({
      query: (params) => ({
        url: '/attendance/stats',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    getMyAttendance: builder.query({
      query: () => '/attendance/my',
      providesTags: ['Attendance'],
    }),
    scanQR: builder.mutation({
      query: (data) => ({
        url: '/attendance/scan',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    markAttendance: builder.mutation({
      query: (data) => ({
        url: '/attendance/manual',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetAllAttendanceQuery,
  useGetAttendanceStatsQuery,
  useGetMyAttendanceQuery,
  useScanQRMutation,
  useMarkAttendanceMutation,
} = attendanceApi;
