# Edit Profile - Complete Code Structure

## 1. Edit Profile Screen (`app/(profile)/edit-profile.tsx`)

### Imports & Types

```typescript
import {
  useGetUserQuery,
  useUpdateProfileUserMutation,
} from "@/src/redux/features/profile/user.api";
import { useCloudinaryUploadSingleMutation } from "@/src/redux/features/upload/upload.api";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Briefcase,
  Heart,
  Bell,
  Camera,
  Save,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Switch,
  Alert,
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
```

### Component Structure

```typescript
const EditProfile = () => {
  // ========== HOOKS ==========
  const router = useRouter();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileUserMutation();
  const [uploadFile, { isLoading: isUploading }] = useCloudinaryUploadSingleMutation();
  const { data: userProfile } = useGetUserQuery(null);

  // ========== STATE ==========
  const [formData, setFormData] = useState<EditProfileFormData>({
    username: '',
    title: '',
    bio: '',
    location: '',
    gender: 'MALE',
    dateOfBirth: '',
    experience: '',
    isToggleNotification: true,
    avatarUrl: '',
    coverUrl: '',
  });
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // ========== EFFECTS ==========
  useEffect(() => {
    if (userProfile?.data) {
      setFormData({
        username: userProfile.data.name || '',
        title: userProfile.data.title || '',
        bio: userProfile.data.bio || '',
        location: userProfile.data.location || '',
        gender: userProfile.data.gender || 'MALE',
        dateOfBirth: userProfile.data.dateOfBirth || '',
        experience: userProfile.data.experience || '',
        isToggleNotification: userProfile.data.isToggleNotification ?? true,
        avatarUrl: userProfile.data.profilePictureUrl || '',
        coverUrl: userProfile.data.coverUrl || '',
      });
      if (userProfile.data.profilePictureUrl) {
        setAvatarImage(userProfile.data.profilePictureUrl);
      }
      if (userProfile.data.coverUrl) {
        setCoverImage(userProfile.data.coverUrl);
      }
    }
  }, [userProfile]);

  // ========== HANDLERS ==========
  const pickImage = async (type: 'avatar' | 'cover') => {
    Alert.alert(
      'Upload Photo',
      `Choose a method to upload your ${type === 'avatar' ? 'profile picture' : 'cover photo'}`,
      [
        { text: 'Cancel', onPress: () => {} },
        { text: 'From URL', onPress: () => promptImageUrl(type) },
      ]
    );
  };

  const promptImageUrl = (type: 'avatar' | 'cover') => {
    Alert.prompt(
      `Enter ${type === 'avatar' ? 'Profile Picture' : 'Cover Photo'} URL`,
      'Enter the image URL',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Upload',
          onPress: async (url: string | undefined) => {
            if (!url || !url.trim()) {
              Toast.show({
                type: 'error',
                text1: 'Invalid URL',
                text2: 'Please enter a valid image URL',
              });
              return;
            }

            try {
              const response = await fetch(url, { method: 'HEAD' });
              if (!response.ok || !response.headers.get('content-type')?.includes('image')) {
                throw new Error('Invalid image URL');
              }

              if (type === 'avatar') {
                setAvatarImage(url);
                setFormData(prev => ({ ...prev, avatarUrl: url }));
              } else {
                setCoverImage(url);
                setFormData(prev => ({ ...prev, coverUrl: url }));
              }

              Toast.show({
                type: 'success',
                text1: `${type === 'avatar' ? 'Profile Picture' : 'Cover Photo'} Updated`,
                text2: 'Image URL added successfully',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Invalid Image',
                text2: 'Please enter a valid image URL',
              });
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleInputChange = (field: keyof EditProfileFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    if (!formData.username.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Username is required',
      });
      return;
    }

    try {
      await updateProfile(formData).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
      });
      router.back();
    } catch (error) {
      console.error('Update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update profile. Please try again.',
      });
    }
  };

  // ========== RENDER ==========
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Edit Profile</Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Cover Photo */}
        <View className="relative">
          <Image
            source={{ uri: coverImage || 'https://res.cloudinary.com/dkqdwcguu/image/upload/v1766617857/SSA_hpyhkb.jpg' }}
            className="w-full h-40"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => pickImage('cover')}
            className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-md"
          >
            {isUploading ? (
              <ActivityIndicator size={20} color="#0084FF" />
            ) : (
              <Camera size={20} color="#0084FF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View className="px-4 py-6">
          <View className="flex-row items-end mb-6">
            <View className="relative">
              <Image
                source={{ uri: avatarImage || 'https://via.placeholder.com/120?text=No+Image' }}
                className="w-32 h-32 rounded-full border-4 border-white"
              />
              <TouchableOpacity
                onPress={() => pickImage('avatar')}
                className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2"
              >
                {isUploading ? (
                  <ActivityIndicator size={16} color="#fff" />
                ) : (
                  <Camera size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xs text-gray-500 mb-1">Profile Picture</Text>
              <Text className="text-sm font-semibold text-gray-700">
                {formData.username || 'Your Name'}
              </Text>
            </View>
          </View>

          {/* Form Fields - Username */}
          <View>
            <View className="flex-row items-center mb-2">
              <User size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">Username</Text>
            </View>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter username"
              value={formData.username}
              onChangeText={(text) => handleInputChange('username', text)}
            />
          </View>

          {/* Form Fields - Title */}
          <View>
            <View className="flex-row items-center mb-2">
              <Briefcase size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">Title</Text>
            </View>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="e.g., Software Engineer"
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
          </View>

          {/* Form Fields - Bio */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Bio</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 min-h-[100px]"
              placeholder="Tell us about yourself"
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Form Fields - Location */}
          <View>
            <View className="flex-row items-center mb-2">
              <MapPin size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">Location</Text>
            </View>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="e.g., New York, USA"
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
            />
          </View>

          {/* Form Fields - Gender */}
          <View>
            <View className="flex-row items-center mb-2">
              <Heart size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">Gender</Text>
            </View>
            <View className="flex-row gap-3">
              {(['MALE', 'FEMALE', 'OTHER'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleInputChange('gender', option)}
                  className={`flex-1 py-3 rounded-lg items-center border-2 ${
                    formData.gender === option
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      formData.gender === option ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Form Fields - Date of Birth */}
          <View>
            <View className="flex-row items-center mb-2">
              <Calendar size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">Date of Birth</Text>
            </View>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="YYYY-MM-DD"
              value={formData.dateOfBirth}
              onChangeText={(text) => handleInputChange('dateOfBirth', text)}
            />
          </View>

          {/* Form Fields - Experience */}
          <View>
            <View className="flex-row items-center mb-2">
              <Briefcase size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">Experience</Text>
            </View>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="e.g., 5 years at Google"
              value={formData.experience}
              onChangeText={(text) => handleInputChange('experience', text)}
            />
          </View>

          {/* Form Fields - Notification Toggle */}
          <View className="flex-row items-center justify-between py-4 border-t border-gray-100">
            <View className="flex-row items-center flex-1">
              <Bell size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">
                Enable Notifications
              </Text>
            </View>
            <Switch
              value={formData.isToggleNotification}
              onValueChange={(value) => handleInputChange('isToggleNotification', value)}
              trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
              thumbColor={formData.isToggleNotification ? '#10B981' : '#6B7280'}
            />
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
              disabled={isUpdating || isUploading}
              className={`flex-1 py-4 rounded-lg items-center flex-row justify-center gap-2 ${
                isUpdating || isUploading ? 'bg-gray-400' : 'bg-blue-500'
              }`}
            >
              {isUpdating || isUploading ? (
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

export default EditProfile;
```

---

## 2. User Type Extension (`src/types/user.type.ts`)

```typescript
export type TUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  isVerified: boolean;
  lastLoginAt: string;
  lastActiveAt: string;
  profilePictureId: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // Extended profile fields
  username?: string;
  title?: string;
  bio?: string;
  location?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  experience?: string;
  coverUrl?: string;
  isToggleNotification?: boolean;
};
```

---

## 3. Profile Detail Update (`src/components/Profile/my-profile.tsx`)

### Updated Edit Button Section

```typescript
{/* Action Buttons */}
<View className="flex-row space-x-4 gap-3 mb-6">
  <TouchableOpacity
    onPress={() => router.navigate('/(profile)/edit-profile')}
    className="flex-1 py-3 rounded-xl items-center bg-blue-500"
  >
    <Text className="font-semibold text-white">
      Edit Profile
    </Text>
  </TouchableOpacity>

  <TouchableOpacity className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
    <Share2 size={20} color="#374151" />
  </TouchableOpacity>
</View>
```

---

## 4. Data Models

### Form Data Interface

```typescript
interface EditProfileFormData {
  username: string; // User's display name
  title: string; // Job title
  bio: string; // Biography
  location: string; // City/Country
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string; // YYYY-MM-DD format
  experience: string; // Work experience
  isToggleNotification: boolean;
  avatarUrl?: string; // Profile picture URL
  coverUrl?: string; // Cover photo URL
}
```

### API Response Structure

```typescript
{
  data: {
    id: string;
    name: string;
    email: string;
    profilePictureUrl: string;
    coverUrl: string;
    title: string;
    bio: string;
    location: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string;
    experience: string;
    isToggleNotification: boolean;
    // ... other fields
  },
  message: string;
  success: boolean;
}
```

### Upload Response Structure

```typescript
{
  urls: [
    "https://res.cloudinary.com/daudqg8x1/image/upload/v1775515987/communication-app/profile_pic.png",
  ];
}
```

---

## 5. CSS Classes Used

### Layout

```
flex-1, flex-row, flex-col, items-center, items-start, items-end
justify-center, justify-between, justify-around
gap-3, gap-2
mb-6, mb-4, mb-3, mb-2, mb-1
mt-8, mt-6, mt-4, mt-2
px-4, py-3, py-4, py-6
```

### Colors

```
bg-white, bg-blue-500, bg-gray-100, bg-gray-400
text-white, text-gray-700, text-gray-900, text-gray-500, text-gray-600
border-gray-100, border-gray-300, border-blue-500
```

### Styling

```
rounded-lg, rounded-full
border, border-2, border-4
shadow-md
min-h-[100px]
w-full, w-32, w-10, w-px
h-40, h-32, h-10
```

---

## Complete Integration Checklist

- ✅ EditProfile component created
- ✅ Form fields implemented
- ✅ Image upload handlers created
- ✅ Form validation added
- ✅ API integration complete
- ✅ Loading states implemented
- ✅ Error handling added
- ✅ Toast notifications configured
- ✅ Navigation setup
- ✅ User type extended
- ✅ Profile button linked

Ready for use! 🚀
