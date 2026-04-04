
import { get } from "node:http";
import { baseAPI } from "../../api/base.api";
import { create } from "node:domain";

export const PostAPI = baseAPI.injectEndpoints({
  // -----create profile for contributor application------


  endpoints: (build) => ({
    // ----------create post-----
    CreatePost: build.mutation({
      query: (data) => ({
        url: `/post/create-post`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["posts"],
    }),

    //--------- get my post post ------
    getMyPost: build.query({
      query: () => ({
        url: `/user/my-posts`,
        method: "GET",
      }),
      providesTags: ["posts"],
    }),
    // ------ get post by id ------
    getPostById: build.query({
      query: (postId) => ({
        url: `/post/${postId}`,
        method: "GET",
      }),
      providesTags: ["posts"],
    }),

    // -------crate category --------

    createCategory: build.mutation({
      query: (data) => ({
        url: `/post/category/create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["posts"],
    }),

    // -------get all category --------

    getAllCategory: build.query({
      query: () => ({
        url: `/post/category/all`,
        method: "GET",
      }),
      providesTags: ["posts"],
    }),

//--------get cetegory by id --------

    getCategoryById: build.query({
      query: (categoryId) => ({
        url: `/post/category/${categoryId}`,
        method: "GET",
      }),
      providesTags: ["posts"],
    }),

    //--------- crate ads --------

    createAds: build.mutation({
      query: ({ postId, data }) => ({
        url: `/post/ads/${postId}/create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ad-management"],
    }),

    //-----get all ads --------

    getAllAds: build.query({
      query: () => ({
        url: `/post/ads/all`,
        method: "GET",
      }),
      providesTags: ["ad-management"],
    }),
    // ------- update ads --------
    updateAds: build.mutation({
      query: ({ adId, data }) => ({
        url: `/post/ads/${adId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["ad-management"],
    }),
    //--------- delete ads --------

    deleteAds: build.mutation({
      query: (adId) => ({
        url: `/post/ads/${adId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ad-management"],
    }), 

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
    useGetMyPostQuery,
    useGetPostByIdQuery,
    useCreateCategoryMutation,
    useGetAllCategoryQuery,
    useGetCategoryByIdQuery,
    useCreateAdsMutation,
    useGetAllAdsQuery,
    useUpdateAdsMutation,
    useDeleteAdsMutation
} = PostAPI;