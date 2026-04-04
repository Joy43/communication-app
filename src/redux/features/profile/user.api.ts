
import { baseAPI } from "../../api/base.api";



export const userAPI = baseAPI.injectEndpoints({
  // -----create profile for contributor application------
  endpoints: (build) => ({
    updateProfileUser: build.mutation({
      query: (data) => ({
        url: `/profile/update-profile`,
        method: "PATCH",
        body: data,
      }),
    }),
//------ get user profile------
    getUserProfile: build.query({
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
    changeReviewToggle: build.mutation({
      query: (status: boolean) => ({
        url: `user/toggle-review-alerts`,
        method: "PATCH",
        body: { reviewAlerts: status },
      }),
    }),
    // --------get user a follower------
      getUserFollower: build.query({
        query: (userId) => ({
          url: `/post/followers/${userId}`,
          method: "GET",
        }),
        providesTags: ["getProfile"],
      }),
//  ----crate follow targated userid------
      crateFollowUser: build.mutation({
        query: (targetUserId) => ({
          url: `/post/follow/${targetUserId}`,
          method: "POST",
        }),
        invalidatesTags: ["getProfile"],
      }), 
      // ----delete follow targated userid------
      deleteFollowUser: build.mutation({
        query: (targetUserId) => ({
          url: `/post/follow/${targetUserId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["getProfile"],
      }),
//----- Check if current user follows target user------
      checkFollowStatus: build.query({
        query: (targetUserId) => ({
          url: `/post/follow/status/${targetUserId}`,
          method: "GET",
        }),
        providesTags: ["getProfile"],
      }),

     
  }),
});

export const {
  useUpdateProfileUserMutation,
  useGetUserProfileQuery,
  useChangeReviewToggleMutation,
  useGetUserFollowerQuery,
  useCrateFollowUserMutation,
  useDeleteFollowUserMutation,
  useCheckFollowStatusQuery,
} = userAPI;