import { baseAPI } from "../../api/base.api";

export const uploadAPI = baseAPI.injectEndpoints({
  // -----create profile for contributor application------
  endpoints: (build) => ({
    cloudinaryUploadMultiple: build.mutation({
      query: (data) => ({
        url: `/upload-files/cloudinary`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["uploadfiles"],
    }),

    // ----single cloudinary upload for profile picture------

    cloudinaryUploadSingle: build.mutation({
      query: (data) => ({
        url: `/upload-files/cloudinary/single`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["uploadfiles"],
    }),
    //---------aws s3 upload for profile picture------
    awsS3Upload: build.mutation({
      query: (data) => ({
        url: `/upload/aws`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["uploadfiles"],
    }),
    //---------aws s3 upload for multiple files------
    awsS3UploadMultiple: build.mutation({
      query: (data) => ({
        url: `/upload/aws/multiple`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["uploadfiles"],
    }),
  }),
});

//------ get user profile------

export const {
  useCloudinaryUploadMultipleMutation,
  useCloudinaryUploadSingleMutation,
    useAwsS3UploadMutation,
    useAwsS3UploadMultipleMutation
} = uploadAPI;
