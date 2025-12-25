import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { useVerifyOTPMutation, useResendOTPMutation } from "../redux/auth/auth.api";
import { setUser } from "../redux/auth/auth.slice";
import { AppDispatch } from "../redux/store";

export default function VerifyOTPScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<TextInput[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter the complete 4-digit OTP",
        position: "bottom",
      });
      return;
    }

    if (!email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email not found. Please try again.",
        position: "bottom",
      });
      return;
    }

    try {
      const result = await verifyOTP({
        otp: otpCode,
        email,
      }).unwrap();

      console.log("OTP verified:", result);

      // Store user and token in Redux
      dispatch(
        setUser({
          user: {
            ...result.data.user,
            role: result.data.user.role as "USER" | "ADMIN" | "SUPER_ADMIN",
            status: result.data.user.status as "ACTIVE" | "INACTIVE" | "BANNED",
          },
          accessToken: result.data.token.accessToken,
        })
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Account verified successfully!",
        position: "bottom",
      });

      // Navigate to main app
      router.replace("/(root)/(tabs)/chat");
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      const errorMessage =
        error?.data?.message || "Invalid OTP. Please try again.";
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: errorMessage,
        position: "bottom",
      });
    }
  };

  const handleResend = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email not found. Please try again.",
        position: "bottom",
      });
      return;
    }

    try {
      await resendOTP({ email, type: "VERIFICATION" }).unwrap();

      Toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: "A new OTP has been sent to your email",
        position: "bottom",
      });

      // Clear the OTP inputs
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error("Resend OTP failed:", error);
      const errorMessage =
        error?.data?.message || "Failed to resend OTP. Please try again.";
      Toast.show({
        type: "error",
        text1: "Resend Failed",
        text2: errorMessage,
        position: "bottom",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-4">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2 mb-8"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-12">
            <Text className="text-3xl font-bold text-gray-900">
              Verify Your Email
            </Text>
            <Text className="text-gray-500 text-base mt-2">
              We've sent a code to your email{"\n"}
              <Text className="font-semibold text-gray-700">
                {email || "your email"}
              </Text>
            </Text>
          </View>

          {/* OTP Input */}
          <View className="flex-row justify-between mb-8">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="number-pad"
                className="w-14 h-14 bg-gray-50 rounded-xl text-center text-xl font-bold text-gray-900 border-2 border-gray-200"
                style={{ fontSize: 24 }}
              />
            ))}
          </View>

          {/* Resend Code */}
          <View className="flex-row justify-center mb-8">
            <Text className="text-gray-600 text-sm">Didn't receive code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              <Text className="text-blue-500 text-sm font-semibold">
                {isResending ? "Sending..." : "Resend"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={isLoading}
            className="bg-blue-500 rounded-xl py-4 items-center"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-bold">Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
