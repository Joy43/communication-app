
import { baseAPI } from "../../api/base.api";

export const PostAPI = baseAPI.injectEndpoints({
  // -----create profile for contributor application------
  endpoints: (build) => ({
    CreatePost: build.mutation({
      query: (data) => ({
        url: `/profile/update-profile`,
        method: "PATCH",
        body: data,
      }),
    }),

    getPost: build.query({
      query: () => ({
        url: `/auth/profile`,
        method: "GET",
      }),
      providesTags: ["getProfile"],
    }),

    // ------- update profile --------
    // updateStatusUserProfile: build.mutation({
    //   query: ({  id }) => ({
    //     url: `/admin-management/contributor/${id}/status`,
    //     method: "PATCH",
    //     body: { status },
    //   }),
    //   invalidatesTags: ["contributor"],
    // }),

    // ---------account setting reviw alert toggle--
    // changeReviewToggle: build.mutation({
    //   query: (status: boolean) => ({
    //     url: `user/toggle-review-alerts`,
    //     method: "PATCH",
    //     body: { reviewAlerts: status },
    //   }),
    // }),

  }),
});

export const {
    useCreatePostMutation,
    useGetPostQuery,
} = PostAPI;