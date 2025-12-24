import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  MapPin,
  MoreVertical,
  Share2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileDetailScreen() {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white py-10">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2"
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Profile</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center -mr-2">
          <MoreVertical size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View className="relative">
          <Image
            source={{
              uri: "https://res.cloudinary.com/dkqdwcguu/image/upload/v1766617857/SSA_hpyhkb.jpg",
            }}
            className="w-full h-48"
            resizeMode="cover"
          />

          {/* Profile Avatar */}
          <View className="absolute -bottom-12 left-1/2 -ml-16">
            <View className="relative">
              <Image
                source={{
                  uri: "https://res.cloudinary.com/dkqdwcguu/image/upload/c_crop,w_512,h_512,g_auto/v1754275277/joy_img_3_ony3do.jpg",
                }}
                className="w-32 h-32 rounded-full border-4 border-white"
              />
              <View className="absolute bottom-2 right-2 w-6 h-6 bg-blue-500 rounded-full items-center justify-center border-2 border-white">
                <CheckCircle2 size={14} color="#fff" />
              </View>
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View className="mt-16 px-5">
          {/* Name & Username */}
          <View className="items-center mb-4">
            <View className="flex-row items-center">
              <Text className="text-2xl font-bold text-gray-900">
                @ss-joy43
              </Text>
              <View className="w-2 h-2 bg-green-500 rounded-full ml-2" />
            </View>
            <View className="flex-row items-center mt-1">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text className="text-gray-600 text-sm">Content Creator</Text>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-around mb-6 py-4 border-y border-gray-100">
            <View className="items-center">
              <Text className="text-xl font-bold text-gray-900">6</Text>
              <Text className="text-gray-500 text-sm mt-1">Following</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-xl font-bold text-gray-900">245</Text>
              <Text className="text-gray-500 text-sm mt-1">Followers</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-xl font-bold text-gray-900">1.4k</Text>
              <Text className="text-gray-500 text-sm mt-1">Likes</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-4 gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setIsFollowing(!isFollowing)}
              className={`flex-1 py-3 rounded-xl items-center ${
                isFollowing ? "bg-gray-100" : "bg-blue-500"
              }`}
            >
              <Text
                className={`font-semibold ${
                  isFollowing ? "text-gray-700" : "text-white"
                }`}
              >
                {isFollowing ? "Following" : "Edit Profile"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
              <Share2 size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Details Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">Details</Text>
              <TouchableOpacity>
                <Text className="text-blue-500 text-sm font-semibold">Now</Text>
              </TouchableOpacity>
            </View>

            {/* About */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                About
              </Text>
              <Text className="text-gray-600 text-sm leading-5">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                vulputate libero id velit interd...{" "}
                <Text className="text-blue-500 font-semibold">See more</Text>
              </Text>
            </View>

            {/* Location */}
            <View className="flex-row items-start mb-3">
              <MapPin size={18} color="#6B7280" className="mt-0.5" />
              <Text className="text-gray-700 text-sm ml-3 flex-1">
                8391 Elgin St. Celina, Delaware 10299
              </Text>
            </View>

            {/* Date */}
            <View className="flex-row items-center mb-3">
              <Calendar size={18} color="#6B7280" />
              <Text className="text-gray-700 text-sm ml-3">24 May, 2020</Text>
            </View>

            {/* Job */}
            <View className="flex-row items-center mb-3">
              <Briefcase size={18} color="#6B7280" />
              <Text className="text-gray-700 text-sm ml-3">
                Marketing Coordinator at SpectraSyng
              </Text>
            </View>

            <TouchableOpacity className="mt-2">
              <Text className="text-blue-500 text-sm font-semibold">
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Community Links */}
          <View className="mb-6">
            <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-700 text-sm">View community</Text>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <Text className="text-gray-700 text-sm">View NDO</Text>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Verified Badges */}
          <View className="flex-row items-center space-x-4 pb-6">
            <View className="flex-row items-center bg-gray-50 px-4 py-3 rounded-xl flex-1">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Ubuntu_logo.svg/240px-Ubuntu_logo.svg.png",
                  }}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-semibold text-gray-900">
                  Ubuntu
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <CheckCircle2 size={12} color="#3B82F6" />
                  <Text className="text-xs text-blue-500 ml-1">Verified</Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center bg-gray-50 px-4 py-3 rounded-xl flex-1">
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Ubuntu_logo.svg/240px-Ubuntu_logo.svg.png",
                  }}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-semibold text-gray-900">
                  Ubuntu
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <CheckCircle2 size={12} color="#3B82F6" />
                  <Text className="text-xs text-blue-500 ml-1">Verified</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
