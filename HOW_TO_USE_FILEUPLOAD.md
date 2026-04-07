# How to Use FileUpload Component in Your Components

## Complete Usage Guide with Real-World Examples

---

## 🚀 Quick Start (30 seconds)

### Step 1: Import

```typescript
import FileUpload from "@/src/components/upload/Upload";
```

### Step 2: Add Component

```typescript
<FileUpload
  uploadType="avatar"
  onUploadSuccess={(url) => setProfilePic(url)}
/>
```

### Step 3: Use the URL

```typescript
await updateProfile({ profilePictureUrl: url });
```

Done! ✅

---

## 📚 Real-World Examples

### Example 1: Edit Profile (Complete)

```typescript
// app/(profile)/edit-profile.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import FileUpload from '@/src/components/upload/Upload';
import { useUpdateProfileUserMutation, useGetUserQuery } from '@/src/redux/features/profile/user.api';
import Toast from 'react-native-toast-message';

const EditProfileScreen = () => {
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatarUrl: '',
    coverUrl: '',
  });

  const [updateProfile] = useUpdateProfileUserMutation();
  const { data: userProfile } = useGetUserQuery(null);

  // Load existing data
  useEffect(() => {
    if (userProfile?.data) {
      setFormData({
        username: userProfile.data.name || '',
        bio: userProfile.data.bio || '',
        avatarUrl: userProfile.data.profilePictureUrl || '',
        coverUrl: userProfile.data.coverUrl || '',
      });
    }
  }, [userProfile]);

  // Save profile
  const handleSave = async () => {
    try {
      await updateProfile(formData).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update profile',
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Edit Profile</Text>

      {/* Cover Photo Upload */}
      <FileUpload
        uploadType="cover"
        onUploadSuccess={(url) =>
          setFormData(prev => ({ ...prev, coverUrl: url }))
        }
        onUploadError={(error) =>
          Toast.show({ type: 'error', text1: 'Cover Upload Failed', text2: error })
        }
        customLabel="Update Cover Photo"
      />

      {/* Avatar Upload */}
      <FileUpload
        uploadType="avatar"
        onUploadSuccess={(url) =>
          setFormData(prev => ({ ...prev, avatarUrl: url }))
        }
        onUploadError={(error) =>
          Toast.show({ type: 'error', text1: 'Avatar Upload Failed', text2: error })
        }
        customLabel="Update Profile Picture"
      />

      {/* Username Input */}
      <View className="mt-6">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Username</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="Enter username"
          value={formData.username}
          onChangeText={(text) =>
            setFormData(prev => ({ ...prev, username: text }))
          }
        />
      </View>

      {/* Bio Input */}
      <View className="mt-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Bio</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 min-h-[100px]"
          placeholder="Tell us about yourself"
          value={formData.bio}
          onChangeText={(text) =>
            setFormData(prev => ({ ...prev, bio: text }))
          }
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleSave}
        className="mt-8 bg-blue-500 py-4 rounded-lg items-center"
      >
        <Text className="text-white font-bold text-lg">Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfileScreen;
```

---

### Example 2: Create Post Screen

```typescript
// app/(posts)/create-post.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import FileUpload from '@/src/components/upload/Upload';
import { useCreatePostMutation } from '@/src/redux/features/post/post.api';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

const CreatePostScreen = () => {
  const router = useRouter();
  const [createPost] = useCreatePostMutation();

  const [formData, setFormData] = useState({
    caption: '',
    image: '',
    hashtags: '',
  });

  const handleCreatePost = async () => {
    if (!formData.caption.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Caption Required',
        text2: 'Please write something for your post',
      });
      return;
    }

    try {
      const postData = {
        content: formData.caption,
        image: formData.image,
        tags: formData.hashtags.split('#').filter(tag => tag.trim()),
      };

      await createPost(postData).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Post Created',
        text2: 'Your post has been shared',
      });

      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create post',
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Create Post</Text>

      {/* Caption Input */}
      <View className="mb-6">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          What's on your mind?
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 min-h-[120px]"
          placeholder="Write something interesting..."
          value={formData.caption}
          onChangeText={(text) =>
            setFormData(prev => ({ ...prev, caption: text }))
          }
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      {/* Image Upload */}
      <FileUpload
        uploadType="post"
        onUploadSuccess={(url) =>
          setFormData(prev => ({ ...prev, image: url }))
        }
        onUploadError={(error) =>
          Toast.show({ type: 'error', text1: 'Upload Failed', text2: error })
        }
        customLabel="Add Image to Your Post"
        maxSize={20}
      />

      {/* Image Preview */}
      {formData.image && (
        <View className="mt-6 relative">
          <Image
            source={{ uri: formData.image }}
            className="w-full h-80 rounded-lg"
          />
        </View>
      )}

      {/* Hashtags Input */}
      <View className="mt-6">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Hashtags (optional)
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="e.g., #photography #travel #nature"
          value={formData.hashtags}
          onChangeText={(text) =>
            setFormData(prev => ({ ...prev, hashtags: text }))
          }
        />
      </View>

      {/* Post Button */}
      <TouchableOpacity
        onPress={handleCreatePost}
        className="mt-8 bg-blue-500 py-4 rounded-lg items-center mb-6"
      >
        <Text className="text-white font-bold text-lg">Share Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreatePostScreen;
```

---

### Example 3: Settings - Change Avatar

```typescript
// app/(settings)/change-avatar.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import FileUpload from '@/src/components/upload/Upload';
import { useUpdateProfileUserMutation, useGetUserQuery } from '@/src/redux/features/profile/user.api';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

const ChangeAvatarScreen = () => {
  const router = useRouter();
  const [updateProfile] = useUpdateProfileUserMutation();
  const { data: userProfile } = useGetUserQuery(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.data?.profilePictureUrl) {
      setSelectedImage(userProfile.data.profilePictureUrl);
    }
  }, [userProfile]);

  const handleAvatarChange = async (imageUrl: string) => {
    try {
      setSelectedImage(imageUrl);

      // Auto-save to API
      await updateProfile({
        username: userProfile?.data?.name || '',
        avatarUrl: imageUrl,
      }).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Avatar Updated',
        text2: 'Your profile picture has been changed',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update avatar',
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold mb-4">Change Avatar</Text>
        <Text className="text-gray-600 text-sm mb-6">
          Update your profile picture to a new image
        </Text>

        {/* Current Avatar */}
        {selectedImage && (
          <View className="mb-8 items-center">
            <Text className="text-sm text-gray-500 mb-3">Current Avatar</Text>
            <Image
              source={{ uri: selectedImage }}
              className="w-32 h-32 rounded-full border-4 border-gray-200"
            />
          </View>
        )}

        {/* Upload Component */}
        <FileUpload
          uploadType="avatar"
          onUploadSuccess={handleAvatarChange}
          onUploadError={(error) =>
            Toast.show({ type: 'error', text1: 'Upload Failed', text2: error })
          }
          customLabel="Upload New Avatar"
          maxSize={5}
        />

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 py-4 rounded-lg border-2 border-gray-300 items-center"
        >
          <Text className="text-gray-700 font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChangeAvatarScreen;
```

---

### Example 4: Document Upload

```typescript
// app/(files)/upload-document.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import FileUpload from '@/src/components/upload/Upload';
import Toast from 'react-native-toast-message';

const UploadDocumentScreen = () => {
  const [documents, setDocuments] = useState<Array<{ name: string; url: string }>>([]);
  const [docName, setDocName] = useState('');

  const handleDocumentUpload = (imageUrl: string) => {
    if (!docName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Name Required',
        text2: 'Please enter a document name',
      });
      return;
    }

    setDocuments(prev => [
      ...prev,
      { name: docName, url: imageUrl }
    ]);
    setDocName('');

    Toast.show({
      type: 'success',
      text1: 'Document Added',
      text2: `"${docName}" has been uploaded`,
    });
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Upload Documents</Text>

      {/* Document Name Input */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Document Name
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="e.g., Invoice, Contract, Report"
          value={docName}
          onChangeText={setDocName}
        />
      </View>

      {/* Upload Component */}
      <FileUpload
        uploadType="document"
        onUploadSuccess={handleDocumentUpload}
        onUploadError={(error) =>
          Toast.show({ type: 'error', text1: 'Upload Failed', text2: error })
        }
        customLabel="Upload Document"
        maxSize={50}
      />

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <View className="mt-8">
          <Text className="text-lg font-bold mb-4">
            Uploaded Documents ({documents.length})
          </Text>
          <FlatList
            data={documents}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View className="bg-gray-100 rounded-lg p-4 mb-3 flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">{item.name}</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {item.url.substring(0, 50)}...
                  </Text>
                </View>
                <TouchableOpacity className="bg-red-500 px-3 py-2 rounded">
                  <Text className="text-white text-xs font-semibold">Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
};

export default UploadDocumentScreen;
```

---

## 🎯 Common Patterns

### Pattern 1: Update State on Success

```typescript
<FileUpload
  uploadType="avatar"
  onUploadSuccess={(url) => {
    setUserState(prev => ({ ...prev, avatar: url }));
  }}
/>
```

### Pattern 2: Call API on Success

```typescript
<FileUpload
  uploadType="cover"
  onUploadSuccess={async (url) => {
    await updateUser({ coverUrl: url }).unwrap();
  }}
/>
```

### Pattern 3: Multiple Uploads

```typescript
const [images, setImages] = useState<string[]>([]);

<FileUpload
  uploadType="post"
  onUploadSuccess={(url) => {
    setImages(prev => [...prev, url]);
  }}
/>
```

### Pattern 4: Conditional Rendering

```typescript
{imageUrl && (
  <Image source={{ uri: imageUrl }} className="w-full h-64" />
)}

<FileUpload
  uploadType="post"
  onUploadSuccess={(url) => setImageUrl(url)}
/>
```

### Pattern 5: Error with Custom Toast

```typescript
<FileUpload
  uploadType="avatar"
  onUploadSuccess={(url) => {
    Toast.show({ type: 'success', text1: 'Success!' });
  }}
  onUploadError={(error) => {
    Toast.show({
      type: 'error',
      text1: 'Upload Failed',
      text2: error
    });
  }}
/>
```

---

## ✅ Best Practices

### 1. Always Validate Input

```typescript
const handleUpload = async (url: string) => {
  if (!url) {
    Toast.show({ type: "error", text1: "No image selected" });
    return;
  }
  // Process...
};
```

### 2. Handle Errors Gracefully

```typescript
onUploadError={(error) => {
  console.error('Upload failed:', error);
  Toast.show({ type: 'error', text1: error });
}}
```

### 3. Use Appropriate File Sizes

```typescript
// Avatar - Small file
maxSize={3}

// Posts - Medium file
maxSize={15}

// Documents - Large file
maxSize={50}
```

### 4. Provide User Feedback

```typescript
<FileUpload
  uploadType="avatar"
  onUploadSuccess={(url) => {
    // 1. Update state
    setImageUrl(url);

    // 2. Show success
    Toast.show({
      type: 'success',
      text1: 'Avatar Updated!'
    });

    // 3. Navigate if needed
    // router.back();
  }}
/>
```

### 5. Disable Actions During Upload

```typescript
const [isUploading, setIsUploading] = useState(false);

<FileUpload
  onUploadSuccess={(url) => {
    setIsUploading(false);
    handleSuccess(url);
  }}
/>

<Button
  disabled={isUploading}
  title="Save"
/>
```

---

## 🔍 Debugging Tips

### Check Upload Success

```typescript
onUploadSuccess={(url) => {
  console.log('Upload successful:', url);
  console.log('URL type:', typeof url);
  console.log('URL valid:', !!url);
}}
```

### Check Errors

```typescript
onUploadError={(error) => {
  console.error('Upload error:', error);
  console.error('Error type:', typeof error);
}}
```

### Monitor State Changes

```typescript
useEffect(() => {
  console.log("Form data updated:", formData);
}, [formData]);
```

---

## 📋 Checklist Before Using

- [ ] Component is imported correctly
- [ ] uploadType is valid (avatar/cover/post/document)
- [ ] onUploadSuccess callback is defined
- [ ] onUploadError callback is optional but recommended
- [ ] maxSize is set appropriately
- [ ] customLabel is provided (optional)
- [ ] Toast library is available
- [ ] Network connection is available
- [ ] Permissions are granted

---

## 🚨 Troubleshooting

### Image Not Uploading?

```
✓ Check internet connection
✓ Check Cloudinary API key
✓ Check file size limits
✓ Check image format
```

### Success Callback Not Firing?

```
✓ Check upload is completing
✓ Check onUploadSuccess is defined
✓ Check console for errors
✓ Check network response
```

### Permission Errors?

```
✓ User rejected permission
✓ Check app settings
✓ Re-request permission
✓ Show explanation dialog
```

---

## 📚 Additional Resources

- Full Documentation: `REUSABLE_FILE_UPLOAD_COMPONENT.md`
- Quick Reference: `FILEUPLOAD_QUICK_REFERENCE.md`
- Summary: `FILEUPLOAD_IMPLEMENTATION_SUMMARY.md`

---

Start using FileUpload in your components today! 🚀
