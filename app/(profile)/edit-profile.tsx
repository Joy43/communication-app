import FileUpload from "@/src/components/upload/Upload";
import {
  useGetUserQuery,
  useUpdateProfileUserMutation,
} from "@/src/redux/features/profile/user.api";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Briefcase,
  Calendar,
  Heart,
  MapPin,
  Save,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface EditProfileFormData {
  username: string;
  title: string;
  bio: string;
  location: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  experience: string;
  isToggleNotification: boolean;
  avatarUrl?: string;
  coverUrl?: string;
}

const EditProfileScreen = () => {
  const router = useRouter();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateProfileUserMutation();
  const { data: userProfile } = useGetUserQuery(null);

  const [formData, setFormData] = useState<EditProfileFormData>({
    username: "",
    title: "",
    bio: "",
    location: "",
    gender: "MALE",
    dateOfBirth: "",
    experience: "",
    isToggleNotification: true,
    avatarUrl: "",
    coverUrl: "",
  });

  // Initialize form with existing user data
  useEffect(() => {
    if (userProfile?.data) {
      setFormData({
        username: userProfile.data.name || "",
        title: userProfile.data.title || "",
        bio: userProfile.data.bio || "",
        location: userProfile.data.location || "",
        gender: userProfile.data.gender || "MALE",
        dateOfBirth: userProfile.data.dateOfBirth || "",
        experience: userProfile.data.experience || "",
        isToggleNotification: userProfile.data.isToggleNotification ?? true,
        avatarUrl: userProfile.data.profilePictureUrl || "",
        coverUrl: userProfile.data.coverUrl || "",
      });
    }
  }, [userProfile]);

  const handleInputChange = (
    field: keyof EditProfileFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    if (!formData.username.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Username is required",
      });
      return;
    }

    try {
      await updateProfile(formData).unwrap();
      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your profile has been updated successfully",
      });
      router.back();
    } catch (error) {
      console.error("Update error:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Failed to update profile. Please try again.",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Edit Profile</Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Cover Photo Upload */}
        <View className="px-4 pt-4">
          <FileUpload
            uploadType="cover"
            onUploadSuccess={(url) =>
              setFormData((prev) => ({ ...prev, coverUrl: url }))
            }
            onUploadError={(error) => {
              Toast.show({
                type: "error",
                text1: "Upload Failed",
                text2: error,
              });
            }}
            customLabel="Cover Photo"
            showPreview={true}
          />
        </View>

        {/* Avatar Section */}
        <View className="px-4 py-6">
          {/* Avatar Upload */}
          <FileUpload
            uploadType="avatar"
            onUploadSuccess={(url) =>
              setFormData((prev) => ({ ...prev, avatarUrl: url }))
            }
            onUploadError={(error) => {
              Toast.show({
                type: "error",
                text1: "Upload Failed",
                text2: error,
              });
            }}
            customLabel="Profile Picture"
            showPreview={true}
          />

          <View className="mt-4 mb-6 ml-2">
            <Text className="text-xs text-gray-500 mb-1">
              Profile Information
            </Text>
            <Text className="text-sm font-semibold text-gray-700">
              {formData.username || "Your Name"}
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-5">
            {/* Username */}
            <View>
              <View className="flex-row items-center mb-2">
                <User size={16} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Username
                </Text>
              </View>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="Enter username"
                value={formData.username}
                onChangeText={(text) => handleInputChange("username", text)}
              />
            </View>

            {/* Title */}
            <View>
              <View className="flex-row items-center mb-2">
                <Briefcase size={16} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Title
                </Text>
              </View>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="e.g., Software Engineer"
                value={formData.title}
                onChangeText={(text) => handleInputChange("title", text)}
              />
            </View>

            {/* Bio */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Bio
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 min-h-[100px]"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChangeText={(text) => handleInputChange("bio", text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Location */}
            <View>
              <View className="flex-row items-center mb-2">
                <MapPin size={16} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Location
                </Text>
              </View>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="e.g., New York, USA"
                value={formData.location}
                onChangeText={(text) => handleInputChange("location", text)}
              />
            </View>

            {/* Gender */}
            <View>
              <View className="flex-row items-center mb-2">
                <Heart size={16} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Gender
                </Text>
              </View>
              <View className="flex-row gap-3">
                {(["MALE", "FEMALE", "OTHER"] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleInputChange("gender", option)}
                    className={`flex-1 py-3 rounded-lg items-center border-2 ${
                      formData.gender === option
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        formData.gender === option
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date of Birth */}
            <View>
              <View className="flex-row items-center mb-2">
                <Calendar size={16} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Date of Birth
                </Text>
              </View>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="YYYY-MM-DD"
                value={formData.dateOfBirth}
                onChangeText={(text) => handleInputChange("dateOfBirth", text)}
              />
            </View>

            {/* Experience */}
            <View>
              <View className="flex-row items-center mb-2">
                <Briefcase size={16} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Experience
                </Text>
              </View>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="e.g., 5 years at Google"
                value={formData.experience}
                onChangeText={(text) => handleInputChange("experience", text)}
              />
            </View>

            {/* Notification Toggle */}
            <View className="flex-row items-center justify-between py-4 border-t border-gray-100">
              <View className="flex-row items-center flex-1">
                <Bell size={16} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Enable Notifications
                </Text>
              </View>
              <Switch
                value={formData.isToggleNotification}
                onValueChange={(value) =>
                  handleInputChange("isToggleNotification", value)
                }
                trackColor={{ false: "#D1D5DB", true: "#A7F3D0" }}
                thumbColor={
                  formData.isToggleNotification ? "#10B981" : "#6B7280"
                }
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-8 mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 py-4 rounded-lg border-2 border-gray-300 items-center"
            >
              <Text className="font-semibold text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUpdateProfile}
              disabled={isUpdating}
              className={`flex-1 py-4 rounded-lg items-center flex-row justify-center gap-2 ${
                isUpdating ? "bg-gray-400" : "bg-blue-500"
              }`}
            >
              {isUpdating ? (
                <ActivityIndicator size={20} color="#fff" />
              ) : (
                <>
                  <Save size={20} color="#fff" />
                  <Text className="font-semibold text-white">Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
