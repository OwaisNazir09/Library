import { baseApi } from "./baseApi";

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: (params) => ({
        url: "/blogs",
        params,
      }),
      providesTags: ["Blogs"],
    }),
    getPendingBlogs: builder.query({
      query: () => "/blogs/pending",
      providesTags: ["Blogs"],
    }),
    getBlog: builder.query({
      query: (id) => `/blogs/${id}`,
      providesTags: (result, error, id) => [{ type: "Blogs", id }],
    }),
    approveBlog: builder.mutation({
      query: ({ id, status }) => ({
        url: `/blogs/${id}/approve`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Blogs"],
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blogs"],
    }),
    addComment: builder.mutation({
      query: ({ id, content }) => ({
        url: `/blogs/${id}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Blogs", id }],
    }),
    toggleLike: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Blogs", id }],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetPendingBlogsQuery,
  useGetBlogQuery,
  useApproveBlogMutation,
  useDeleteBlogMutation,
  useAddCommentMutation,
  useToggleLikeMutation,
} = blogApi;
