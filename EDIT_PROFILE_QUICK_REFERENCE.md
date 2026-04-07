# Quick Reference - Edit Profile Feature

## Files Modified/Created

| File                                     | Purpose                       | Status     |
| ---------------------------------------- | ----------------------------- | ---------- |
| `app/(profile)/edit-profile.tsx`         | Main edit profile screen      | ✅ Created |
| `src/components/Profile/my-profile.tsx`  | Profile view with edit button | ✅ Updated |
| `src/types/user.type.ts`                 | Extended user type definition | ✅ Updated |
| `src/redux/features/profile/user.api.ts` | API hooks (no changes needed) | ✅ Ready   |

## UI Components

### Header

```tsx
<View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
  <TouchableOpacity onPress={() => router.back()}>
    <ArrowLeft size={24} color="#000" />
  </TouchableOpacity>
  <Text className="text-lg font-semibold">Edit Profile</Text>
</View>
```

### Image Upload Section

```tsx
// Profile Picture
<Image
  source={{ uri: avatarImage || 'placeholder' }}
  className="w-32 h-32 rounded-full border-4 border-white"
/>
<TouchableOpacity onPress={() => pickImage('avatar')}>
  <Camera size={16} color="#fff" />
</TouchableOpacity>

// Cover Photo
<Image
  source={{ uri: coverImage || 'placeholder' }}
  className="w-full h-40"
/>
<TouchableOpacity onPress={() => pickImage('cover')}>
  <Camera size={20} color="#0084FF" />
</TouchableOpacity>
```

### Form Input Fields

```tsx
// Text Input Example
<View>
  <View className="flex-row items-center mb-2">
    <User size={16} color="#6B7280" />
    <Text className="text-sm font-semibold text-gray-700 ml-2">Username</Text>
  </View>
  <TextInput
    className="border border-gray-300 rounded-lg px-4 py-3"
    placeholder="Enter username"
    value={formData.username}
    onChangeText={(text) => handleInputChange('username', text)}
  />
</View>

// Gender Selection
<View className="flex-row gap-3">
  {['MALE', 'FEMALE', 'OTHER'].map((option) => (
    <TouchableOpacity
      onPress={() => handleInputChange('gender', option)}
      className={`flex-1 py-3 rounded-lg ${
        formData.gender === option
          ? 'bg-blue-500 border-blue-500'
          : 'border-gray-300 bg-white'
      }`}
    >
      <Text className={formData.gender === option ? 'text-white' : 'text-gray-700'}>
        {option}
      </Text>
    </TouchableOpacity>
  ))}
</View>

// Notification Toggle
<Switch
  value={formData.isToggleNotification}
  onValueChange={(value) => handleInputChange('isToggleNotification', value)}
  trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
  thumbColor={formData.isToggleNotification ? '#10B981' : '#6B7280'}
/>
```

### Action Buttons

```tsx
{
  /* Cancel Button */
}
<TouchableOpacity
  onPress={() => router.back()}
  className="flex-1 py-4 rounded-lg border-2 border-gray-300"
>
  <Text className="font-semibold text-gray-700">Cancel</Text>
</TouchableOpacity>;

{
  /* Save Button */
}
<TouchableOpacity
  onPress={handleUpdateProfile}
  disabled={isUpdating || isUploading}
  className={`flex-1 py-4 rounded-lg flex-row justify-center gap-2 ${
    isUpdating || isUploading ? "bg-gray-400" : "bg-blue-500"
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
</TouchableOpacity>;
```

## Key Functions

### Initialize Form with User Data

```typescript
useEffect(() => {
  if (userProfile?.data) {
    setFormData({
      username: userProfile.data.name || "",
      title: userProfile.data.title || "",
      bio: userProfile.data.bio || "",
      // ... other fields
    });
  }
}, [userProfile]);
```

### Handle Input Changes

```typescript
const handleInputChange = (
  field: keyof EditProfileFormData,
  value: string | boolean,
) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));
};
```

### Pick Image (URL Method)

```typescript
const pickImage = async (type: "avatar" | "cover") => {
  Alert.alert(
    "Upload Photo",
    `Choose a method to upload your ${type === "avatar" ? "profile picture" : "cover photo"}`,
    [
      {
        text: "From URL",
        onPress: () => promptImageUrl(type),
      },
    ],
  );
};
```

### Validate and Save Profile

```typescript
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
    Toast.show({
      type: "error",
      text1: "Update Failed",
      text2: "Failed to update profile. Please try again.",
    });
  }
};
```

## Form Fields Reference

| Field                | Type    | Icon      | Validation                   |
| -------------------- | ------- | --------- | ---------------------------- |
| username             | string  | User      | Required                     |
| title                | string  | Briefcase | Optional                     |
| bio                  | string  | Text      | Optional, multiline          |
| location             | string  | MapPin    | Optional                     |
| gender               | enum    | Heart     | Optional (MALE/FEMALE/OTHER) |
| dateOfBirth          | string  | Calendar  | Optional (YYYY-MM-DD)        |
| experience           | string  | Briefcase | Optional                     |
| isToggleNotification | boolean | Bell      | Default true                 |
| avatarUrl            | string  | Camera    | Optional                     |
| coverUrl             | string  | Camera    | Optional                     |

## Navigation Flow

```
Profile Tab
    ↓
ProfileDetailScreen (my-profile.tsx)
    ↓
Click "Edit Profile"
    ↓
router.navigate('/(profile)/edit-profile')
    ↓
EditProfile Component Loads
    ↓
useGetUserQuery initializes form data
    ↓
User edits fields
    ↓
Click Save
    ↓
updateProfile() executes
    ↓
Success: Toast + router.back()
Error: Error Toast
```

## Toast Message Examples

```typescript
// Success Upload
Toast.show({
  type: "success",
  text1: "Profile Picture Uploaded",
  text2: "Image uploaded successfully",
});

// Success Save
Toast.show({
  type: "success",
  text1: "Profile Updated",
  text2: "Your profile has been updated successfully",
});

// Error Upload
Toast.show({
  type: "error",
  text1: "Upload Failed",
  text2: "Failed to upload image. Please try again.",
});

// Error Save
Toast.show({
  type: "error",
  text1: "Update Failed",
  text2: "Failed to update profile. Please try again.",
});

// Validation Error
Toast.show({
  type: "error",
  text1: "Validation Error",
  text2: "Username is required",
});
```

## Importing the Component

```typescript
// In app/(root)/(tabs)/profile.tsx
import ProfileDetailScreen from "@/src/components/Profile/my-profile";

// In navigation
router.navigate("/(profile)/edit-profile");
```

## Hooks Used

```typescript
// User Profile Data
const { data: userProfile } = useGetUserQuery(null);

// Update Profile Mutation
const [updateProfile, { isLoading: isUpdating }] =
  useUpdateProfileUserMutation();

// Upload File Mutation (ready for implementation)
const [uploadFile, { isLoading: isUploading }] =
  useCloudinaryUploadSingleMutation();

// Router Navigation
const router = useRouter();

// Dispatch Actions (if needed)
const dispatch = useDispatch<AppDispatch>();
```

## Color Scheme

| Element          | Light Mode        | Dark Mode         |
| ---------------- | ----------------- | ----------------- |
| Primary Button   | `bg-blue-500`     | `bg-blue-600`     |
| Secondary Button | `bg-gray-100`     | `bg-gray-800`     |
| Input Border     | `border-gray-300` | `border-gray-600` |
| Text Primary     | `text-gray-900`   | `text-white`      |
| Text Secondary   | `text-gray-600`   | `text-gray-400`   |
| Background       | `bg-white`        | `bg-black`        |

## Testing Scenarios

1. **New User Edit**
   - Empty form fields
   - All validations should pass when username provided
   - Should save with empty optional fields

2. **Existing User Edit**
   - Form should populate with existing data
   - User can modify any field
   - Should save updated data

3. **Image Upload**
   - Valid image URL should update preview
   - Invalid URL should show error
   - Both avatar and cover should work independently

4. **Navigation**
   - Back button should navigate to profile
   - Cancel button should navigate back
   - Save button should save then navigate back

5. **Error States**
   - Missing username should prevent save
   - Network error should show error toast
   - Upload error should show error toast
