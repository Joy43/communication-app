import { router } from 'expo-router';
import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // Add your OTP verification logic here
    router.push('/(root)/(tabs)/chat');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              We've sent a code to your email{'\n'}
              <Text className="font-semibold text-gray-700">
                example@email.com
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
            <TouchableOpacity>
              <Text className="text-blue-500 text-sm font-semibold">Resend</Text>
            </TouchableOpacity>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            className="bg-blue-500 rounded-xl py-4 items-center"
          >
            <Text className="text-white text-base font-bold">Verify</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
