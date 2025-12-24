import { router } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    // Add your password reset logic here
    router.push("/verify-otp");
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
              Forgot Password?
            </Text>
            <Text className="text-gray-500 text-base mt-2">
              Don't worry! Enter your email and we'll send you a reset link
            </Text>
          </View>

          {/* Illustration */}
          <View className="items-center mb-12">
            <View className="w-32 h-32 bg-blue-50 rounded-full items-center justify-center">
              <Mail size={64} color="#3B82F6" />
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-8">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Email Address
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
                className="flex-1 ml-3 text-base text-gray-900"
              />
            </View>
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            onPress={handleResetPassword}
            className="bg-blue-500 rounded-xl py-4 items-center mb-6"
          >
            <Text className="text-white text-base font-bold">
              Send Reset Link
            </Text>
          </TouchableOpacity>

          {/* Back to Sign In */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600 text-sm">Remember password? </Text>
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text className="text-blue-500 text-sm font-semibold">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
