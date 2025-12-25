import { router } from "expo-router";
import { Chrome, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useLoginMutation } from "../redux/auth/auth.api";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loginUserWithEmail, { isLoading }] = useLoginMutation();

  const handleSignIn = async () => {
    // Validation
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter both email and password",
        position: "bottom",
      });
      return;
    }

    if (!email.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid email address",
        position: "bottom",
      });
      return;
    }

    try {
      const result = await loginUserWithEmail({
        email: email.trim(),
        password,
      }).unwrap();

      // Login successful
      console.log("Login successful:", result.data.user);
      Toast.show({
        type: "success",
        text1: "Login Successful",
        position: "bottom",
      });

      // Navigate to main app
      router.replace("/(root)/(tabs)/chat");
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage =
        error?.data?.message || "Login failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Login Failed",
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-6 pt-8">
            {/* Logo/Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-3xl font-bold">M</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900">
                Welcome Back
              </Text>
              <Text className="text-gray-500 text-base mt-2">
                Sign in to continue
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Email
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Mail size={20} color="#9CA3AF" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  className="flex-1 ml-3 text-base text-gray-900"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-2">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Lock size={20} color="#9CA3AF" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  className="flex-1 ml-3 text-base text-gray-900"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push("/forgot-password")}
              className="self-end mb-6"
            >
              <Text className="text-blue-500 text-sm font-semibold">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isLoading}
              className={`rounded-xl py-4 items-center mb-6 ${
                isLoading ? "bg-blue-300" : "bg-blue-500"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-bold">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-500 text-sm">OR</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Sign In */}
            <View className="flex-row justify-center gap-4 space-x-4 mb-8">
              <TouchableOpacity className="w-14 h-14 bg-gray-50 rounded-full items-center justify-center border border-gray-200">
                <Chrome size={20} />
              </TouchableOpacity>
              <TouchableOpacity className="w-14 h-14 bg-gray-50 rounded-full items-center justify-center border border-gray-200">
                <Text className="text-2xl">f</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-600 text-sm">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/sign-up")}>
                <Text className="text-blue-500 text-sm font-semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
