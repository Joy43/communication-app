import { baseAPI } from "../api/base.api";

interface RegisterData {
  email: string;
  name: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface VerifyOTPData {
  otp: string;
  email: string;
}

interface ResendOTPData {
  email: string;
  type: "VERIFICATION" | "PASSWORD_RESET";
}

interface ResendOTPResponse {
  success: boolean;
  message: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      isVerified: boolean;
      lastLoginAt: string;
      lastActiveAt: string;
      profilePictureId: string | null;
      profilePictureUrl: string | null;
      createdAt: string;
      updatedAt: string;
    };
    token: {
      accessToken: string;
      refreshToken: string;
      refreshTokenExpiresAt: string;
    };
  };
}

interface LoginResponse {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    token: string;
  };
}

export const userApi = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    // -------- register --------
    register: build.mutation<AuthResponse, RegisterData>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    // --------- login ---------
    login: build.mutation<LoginResponse, LoginData>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),

    // --------- verify otp ---------
    verifyOTP: build.mutation<AuthResponse, VerifyOTPData>({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [],
    }),
    // ----------resend-otp------------
    resendOTP: build.mutation<ResendOTPResponse, ResendOTPData>({
      query: (data) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: data,
      }),
    }),
    // --------- forgot password ---------
    forgotPassword: build.mutation({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    // --------- reset password ---------
    resetPassword: build.mutation({
      query: (data) => ({
        url: "/user/me/update-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyOTPMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendOTPMutation,
} = userApi;
