import {
  useGetUserQuery,
  useUpdateProfileUserMutation,
} from "@/src/redux/features/profile/user.api";
import { useCloudinaryUploadMultipleMutation } from "@/src/redux/features/upload/upload.api";
import {
  getErrorMessage,
  pickImageFromLibrary,
  validateImage,
} from "@/src/utils";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
  const [image, setImage] = useState<string | null>(null);

  const router = useRouter();

  const { data: userProfile } = useGetUserQuery(null);
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateProfileUserMutation();

  const [uploadFile, { isLoading: isUploading }] =
    useCloudinaryUploadMultipleMutation();

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

  // ------------  Load user data into form when profile is fetched -------------
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

  // Image Pick + Upload
  const handlePickAndUpload = async (type: "avatar" | "cover") => {
    try {
      // -------- Pick image using utility  --------
      const pickedImage = await pickImageFromLibrary({
        aspect: type === "avatar" ? [1, 1] : [16, 9],
        quality: 0.7,
      });

      if (!pickedImage) {
        return; 
      }

      // Validate image
      const validation = validateImage(pickedImage);
      if (!validation.valid) {
        Toast.show({
          type: "error",
          text1: "Invalid Image",
          text2: validation.error || "Please select a valid image",
        });
        return;
      }

      setImage(pickedImage.uri);

      // Prepare FormData for upload
      const formDataUpload = new FormData();
      formDataUpload.append("files", {
        uri: pickedImage.uri,
        name: pickedImage.name,
        type: pickedImage.type,
      } as any);

      // Upload file
      const res = await uploadFile(formDataUpload).unwrap();

      if (!res || !res.urls || res.urls.length === 0) {
        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: "No URL returned from server",
        });
        return;
      }

      const uploadedUrl = res.urls[0];

      // Update form data
      setFormData((prev) => ({
        ...prev,
        ...(type === "avatar"
          ? { avatarUrl: uploadedUrl }
          : { coverUrl: uploadedUrl }),
      }));

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `${type === "avatar" ? "Profile" : "Cover"} image uploaded`,
      });
    } catch (error: any) {
      console.error("Image upload error:", error);
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: errorMessage,
      });
    }
  };

  //  --------- Handle Submit profile update -----------
  const handleUpdateProfile = async () => {

    if (!formData.username.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Username is required",
      });
      return;
    }

    if (formData.username.length < 3) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Username must be at least 3 characters",
      });
      return;
    }

    try {
 
      const dataToSubmit: any = {
        username: formData.username.trim(),
        title: formData.title.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        gender: formData.gender,
        experience: formData.experience.trim(),
        isToggleNotification: formData.isToggleNotification,
      };

    
      if (formData.dateOfBirth?.trim()) {
        dataToSubmit.dateOfBirth = new Date(formData.dateOfBirth).toISOString();
      }

      if (formData.avatarUrl?.trim()) {
        dataToSubmit.profilePictureUrl = formData.avatarUrl;
      }

      if (formData.coverUrl?.trim()) {
        dataToSubmit.coverUrl = formData.coverUrl;
      }

      // Call mutation
      const response = await updateProfile(dataToSubmit).unwrap();

      console.log("Profile updated successfully:", response);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully",
      });
 
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error: any) {
      console.error("Profile update error:", error);

      const errorMessage =
        error?.data?.message || error?.message || "Failed to update profile";

      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: errorMessage,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Edit Profile</Text>
        <View />
      </View>

      <ScrollView>
        {/*  Cover Upload */}
        <View className="px-4 pt-4">
          <TouchableOpacity onPress={() => handlePickAndUpload("cover")}>
            <View className="h-40 rounded-2xl overflow-hidden bg-gray-200 justify-center items-center">
              {formData.coverUrl ? (
                <Image
                  source={{ uri: formData.coverUrl }}
                  className="w-full h-full"
                />
              ) : (
                <Text>Upload Cover</Text>
              )}

              <View className="absolute bottom-3 right-3 bg-black/60 p-2 rounded-full">
                {isUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Camera size={18} color="#fff" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View className="items-center -mt-12">
          <TouchableOpacity onPress={() => handlePickAndUpload("avatar")}>
            <View>
              <Image
                source={{
                  uri:
                    formData.avatarUrl || "https://i.ibb.co/2kR5zqR/user.png",
                }}
                className="w-24 h-24 rounded-full border-4 border-white"
              />

              <View className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full">
                {isUploading ? (
                  <ActivityIndicator size={12} color="#fff" />
                ) : (
                  <Camera size={12} color="#fff" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View className="px-4 py-6">
          <Text className="text-sm font-semibold">
            {formData.username || "Your Name"}
          </Text>
          <Text className="text-xs text-gray-500">
            {formData.title || "Your Title"}
          </Text>

          {/* FORM */}
          <View className="space-y-4 mt-4">
            {/* Username Field */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                Username *
              </Text>
              <TextInput
                placeholder="Enter username"
                value={formData.username}
                onChangeText={(t) => handleInputChange("username", t)}
                className="border border-gray-300 p-3 rounded-lg"
                editable={!isUpdating}
              />
            </View>

            {/* Title Field */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                Title
              </Text>
              <TextInput
                placeholder="e.g., Software Engineer"
                value={formData.title}
                onChangeText={(t) => handleInputChange("title", t)}
                className="border border-gray-300 p-3 rounded-lg"
                editable={!isUpdating}
              />
            </View>

            {/* Bio Field */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                Bio
              </Text>
              <TextInput
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={4}
                value={formData.bio}
                onChangeText={(t) => handleInputChange("bio", t)}
                className="border border-gray-300 p-3 rounded-lg"
                editable={!isUpdating}
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* Location Field */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                Location
              </Text>
              <TextInput
                placeholder="e.g., New York, USA"
                value={formData.location}
                onChangeText={(t) => handleInputChange("location", t)}
                className="border border-gray-300 p-3 rounded-lg"
                editable={!isUpdating}
              />
            </View>

            {/* Gender Selection */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-2">
                Gender
              </Text>
              <View className="flex-row gap-2">
                {["MALE", "FEMALE", "OTHER"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => handleInputChange("gender", g as any)}
                    className={`flex-1 p-3 rounded-lg border ${
                      formData.gender === g
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                    disabled={isUpdating}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        formData.gender === g ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience Field */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                Experience
              </Text>
              <TextInput
                placeholder="e.g., 5 years"
                value={formData.experience}
                onChangeText={(t) => handleInputChange("experience", t)}
                className="border border-gray-300 p-3 rounded-lg"
                editable={!isUpdating}
              />
            </View>

            {/* Date of Birth Field */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                Date of Birth
              </Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={formData.dateOfBirth}
                onChangeText={(t) => handleInputChange("dateOfBirth", t)}
                className="border border-gray-300 p-3 rounded-lg"
                editable={!isUpdating}
              />
            </View>

            {/* Notification Toggle */}
            <View className="flex-row items-center justify-between border border-gray-300 p-3 rounded-lg">
              <Text className="text-sm font-semibold text-gray-700">
                Enable Notifications
              </Text>
              <Switch
                value={formData.isToggleNotification}
                onValueChange={(value) =>
                  handleInputChange("isToggleNotification", value)
                }
                disabled={isUpdating}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleUpdateProfile}
              disabled={isUpdating}
              className={`p-4 rounded-lg mt-6 items-center ${
                isUpdating ? "bg-blue-300" : "bg-blue-500"
              }`}
            >
              {isUpdating ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="#fff" />
                  <Text className="text-white font-semibold">Saving...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-base">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
