# Reusable FileUpload Component Documentation

## Overview

A professional, feature-rich file upload component built with React Native and Expo that can be easily integrated into any component in your application.

## Features

### ✨ Core Features

- **Multiple Upload Methods**
  - Camera capture
  - Gallery/Image picker
  - Direct URL input
- **Real-time Upload Progress**
  - Progress percentage display
  - Visual progress bar
  - Upload status indicators

- **Image Validation**
  - File size checking
  - Image type validation
  - URL validation

- **User Feedback**
  - Success/error toast notifications
  - Loading states
  - Progress feedback

- **Flexible Configuration**
  - Customizable for different use cases (avatar, cover, post, document)
  - Adjustable aspect ratios
  - Custom labels
  - Max file size limits

## Installation

The component requires the following dependencies:

```bash
# Already installed in your project
npm i expo-image-picker
npm i react-native-toast-message
npm i lucide-react-native
```

## Props Interface

```typescript
interface FileUploadProps {
  onUploadSuccess: (imageUrl: string) => void; // Required: Called when upload succeeds
  onUploadError?: (error: string) => void; // Optional: Called when upload fails
  uploadType: "avatar" | "cover" | "post" | "document"; // Required: Type of upload
  aspectRatio?: [number, number]; // Optional: Image aspect ratio
  maxSize?: number; // Optional: Max file size in MB (default: 10)
  allowMultiple?: boolean; // Optional: Allow multiple files (default: false)
  customLabel?: string; // Optional: Custom label text
  containerClassName?: string; // Optional: Tailwind classes for container
  showPreview?: boolean; // Optional: Show image preview (default: true)
}
```

## Basic Usage

### Simple Avatar Upload

```typescript
import FileUpload from '@/src/components/upload/Upload';

function ProfileScreen() {
  const handleUploadSuccess = (imageUrl: string) => {
    console.log('Avatar uploaded:', imageUrl);
    // Update your state or API with the image URL
  };

  return (
    <FileUpload
      uploadType="avatar"
      onUploadSuccess={handleUploadSuccess}
      customLabel="Upload Your Profile Picture"
    />
  );
}
```

### Cover Photo Upload

```typescript
<FileUpload
  uploadType="cover"
  onUploadSuccess={(url) => setFormData(prev => ({ ...prev, coverUrl: url }))}
  onUploadError={(error) => console.error(error)}
  customLabel="Cover Photo"
  showPreview={true}
/>
```

### Post Image Upload

```typescript
<FileUpload
  uploadType="post"
  onUploadSuccess={(url) => addPostImage(url)}
  aspectRatio={[4, 3]}
  maxSize={20}
  customLabel="Select Post Image"
/>
```

### Document Upload

```typescript
<FileUpload
  uploadType="document"
  onUploadSuccess={(url) => handleDocumentUpload(url)}
  customLabel="Upload Document"
  maxSize={50}
/>
```

## Upload Types

Each upload type has predefined configurations:

| Type       | Aspect Ratio | Default Size | Container Size | Use Case            |
| ---------- | ------------ | ------------ | -------------- | ------------------- |
| `avatar`   | 1:1          | 10MB         | w-32 h-32      | Profile pictures    |
| `cover`    | 16:9         | 10MB         | w-full h-40    | Cover/banner images |
| `post`     | 4:3          | 10MB         | w-full h-64    | Post images         |
| `document` | 16:9         | 10MB         | w-full h-32    | Document thumbnails |

## Advanced Examples

### With Error Handling

```typescript
<FileUpload
  uploadType="avatar"
  onUploadSuccess={(url) => {
    updateUserProfile({ avatarUrl: url });
    Toast.show({
      type: 'success',
      text1: 'Profile Updated',
      text2: 'Your avatar has been updated',
    });
  }}
  onUploadError={(error) => {
    Toast.show({
      type: 'error',
      text1: 'Upload Failed',
      text2: error,
    });
  }}
/>
```

### With Custom Styling

```typescript
<FileUpload
  uploadType="post"
  onUploadSuccess={handleImageUpload}
  customLabel="Add Image to Your Post"
  containerClassName="mt-4 mb-6 px-4"
  maxSize={15}
  aspectRatio={[3, 2]}
/>
```

### Multiple File Uploads (Sequential)

```typescript
const [images, setImages] = useState<string[]>([]);

const handleMultipleUploads = (imageUrl: string) => {
  setImages(prev => [...prev, imageUrl]);
};

// Use multiple FileUpload components
{images.map((img, idx) => (
  <View key={idx}>
    <Image source={{ uri: img }} />
  </View>
))}

<FileUpload
  uploadType="post"
  onUploadSuccess={handleMultipleUploads}
/>
```

## Component Structure

```
FileUpload Component
├── Upload Methods Section
│   ├── Camera Button
│   ├── Gallery Button
│   └── Paste URL Button
├── Image Preview Section (if selected)
│   ├── Image Display
│   ├── Success Badge
│   ├── Clear Button
│   └── Progress Overlay
└── Status Section
    ├── Upload Progress Bar
    └── Status Message
```

## Upload Flow

```
User Interaction
    ↓
[Camera] [Gallery] [URL]
    ↓
Pick/Enter Image
    ↓
Validate (size, type)
    ↓
Upload to Cloudinary
    ↓
Progress Updates (30%, 60%, 90%, 100%)
    ↓
onUploadSuccess(imageUrl)
    ↓
Update Component State/API
    ↓
Toast Notification
```

## Permissions

The component automatically handles permissions for:

- **Camera**: Required for camera capture
- **Photo Library**: Required for image picker

Users will be prompted if permissions are not granted.

## Error Handling

The component handles various error scenarios:

| Error             | Handling                       |
| ----------------- | ------------------------------ |
| Permission denied | Toast + console error          |
| Invalid file size | Toast with size info           |
| Invalid image URL | Toast + validation feedback    |
| Upload failure    | onUploadError callback + toast |
| Camera error      | Toast message                  |

## Styling

All styling uses Tailwind CSS classes. You can override styling with:

```typescript
<FileUpload
  uploadType="avatar"
  onUploadSuccess={handleSuccess}
  containerClassName="bg-gray-100 p-4 rounded-lg"
/>
```

## Color Scheme

| Element          | Color  | Tailwind          |
| ---------------- | ------ | ----------------- |
| Primary Button   | Blue   | `bg-blue-500`     |
| Secondary Button | Purple | `bg-purple-500`   |
| Tertiary Button  | Orange | `bg-orange-500`   |
| Success Badge    | Green  | `bg-green-500`    |
| Clear Button     | Red    | `bg-red-500`      |
| Preview Border   | Gray   | `border-gray-300` |
| Upload Progress  | Gray   | `bg-gray-50`      |

## Integration with Edit Profile

### Example Integration

```typescript
// app/(profile)/edit-profile.tsx
import FileUpload from '@/src/components/upload/Upload';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    avatarUrl: '',
    coverUrl: '',
    // ... other fields
  });

  return (
    <View>
      {/* Cover Photo */}
      <FileUpload
        uploadType="cover"
        onUploadSuccess={(url) =>
          setFormData(prev => ({ ...prev, coverUrl: url }))
        }
        onUploadError={(error) =>
          Toast.show({ type: 'error', text1: 'Error', text2: error })
        }
      />

      {/* Profile Picture */}
      <FileUpload
        uploadType="avatar"
        onUploadSuccess={(url) =>
          setFormData(prev => ({ ...prev, avatarUrl: url }))
        }
        onUploadError={(error) =>
          Toast.show({ type: 'error', text1: 'Error', text2: error })
        }
      />

      {/* Save button uses formData.avatarUrl and formData.coverUrl */}
    </View>
  );
};
```

## Usage in Other Components

### In Post Creation

```typescript
import FileUpload from '@/src/components/upload/Upload';

const CreatePostScreen = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <View>
      <TextInput placeholder="Write your post..." />

      <FileUpload
        uploadType="post"
        onUploadSuccess={(url) => setImageUrl(url)}
        maxSize={20}
      />

      {imageUrl && <Image source={{ uri: imageUrl }} />}

      <Button
        onPress={() => submitPost({ imageUrl })}
        title="Post"
      />
    </View>
  );
};
```

### In Settings/Avatar Change

```typescript
import FileUpload from '@/src/components/upload/Upload';

const SettingsScreen = () => {
  const updateAvatar = async (imageUrl: string) => {
    try {
      await updateUserProfile({ profilePictureUrl: imageUrl }).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Avatar Updated',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
      });
    }
  };

  return (
    <FileUpload
      uploadType="avatar"
      onUploadSuccess={updateAvatar}
      customLabel="Change Your Avatar"
    />
  );
};
```

## Best Practices

### 1. Always Handle Success

```typescript
onUploadSuccess={(url) => {
  // Always update your state or API
  updateProfileData({ imageUrl: url });
}}
```

### 2. Always Handle Errors

```typescript
onUploadError={(error) => {
  console.error('Upload failed:', error);
  Toast.show({ type: 'error', text1: error });
}}
```

### 3. Set Appropriate Max Sizes

```typescript
// For avatars
maxSize={5}  // 5MB is usually enough

// For posts
maxSize={15} // 15MB for HD images

// For documents
maxSize={50} // 50MB for large files
```

### 4. Use Appropriate Aspect Ratios

```typescript
// Circular avatars
aspectRatio={[1, 1]}

// Landscape images
aspectRatio={[16, 9]}

// Square thumbnails
aspectRatio={[1, 1]}
```

## Performance Tips

1. **Load Only When Needed**
   - Import only in components that need it
   - Use lazy loading for non-critical screens

2. **Limit Concurrent Uploads**
   - Upload one file at a time
   - Disable buttons during upload

3. **Optimize Image Quality**
   - Use `quality: 0.8` (default)
   - Adjust based on use case

4. **Handle Memory**
   - Clear preview after successful upload
   - Don't keep large base64 strings in state

## Troubleshooting

### Permission Issues

```typescript
// Make sure permissions are requested
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
if (status !== "granted") {
  // Handle permission denied
}
```

### Upload Fails

- Check internet connection
- Verify Cloudinary API key
- Check file size limits
- Verify image format

### Progress Not Showing

- Check if upload service returns progress updates
- Verify state updates are not throttled

## API Reference

### Methods

#### `pickImage()`

Launches image picker from gallery

```typescript
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({...});
  // Handles file size check and upload
};
```

#### `handleCamera()`

Launches camera for image capture

```typescript
const handleCamera = async () => {
  const result = await ImagePicker.launchCameraAsync({...});
  // Handles file size check and upload
};
```

#### `handleImageUrl()`

Prompts for image URL input

```typescript
const handleImageUrl = () => {
  Alert.prompt("Enter image URL", (url) => {
    // Validates and uses URL
  });
};
```

#### `uploadImageToCloudinary()`

Uploads image to Cloudinary

```typescript
const uploadImageToCloudinary = async (imageUri: string) => {
  // Sends to API, updates progress, calls callback
};
```

#### `clearImage()`

Clears the current image selection

```typescript
const clearImage = () => {
  setSelectedImage(null);
  setUploadProgress(0);
};
```

## Full Example Component

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FileUpload from '@/src/components/upload/Upload';
import Toast from 'react-native-toast-message';

const CompleteExample = () => {
  const [profileData, setProfileData] = useState({
    avatarUrl: '',
    coverUrl: '',
  });

  const handleAvatarUpload = (url: string) => {
    setProfileData(prev => ({ ...prev, avatarUrl: url }));
  };

  const handleCoverUpload = (url: string) => {
    setProfileData(prev => ({ ...prev, coverUrl: url }));
  };

  const handleUploadError = (error: string) => {
    Toast.show({
      type: 'error',
      text1: 'Upload Failed',
      text2: error,
    });
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Edit Profile</Text>

      <FileUpload
        uploadType="cover"
        onUploadSuccess={handleCoverUpload}
        onUploadError={handleUploadError}
        customLabel="Cover Photo"
      />

      <FileUpload
        uploadType="avatar"
        onUploadSuccess={handleAvatarUpload}
        onUploadError={handleUploadError}
        customLabel="Profile Picture"
      />

      <TouchableOpacity
        onPress={() => saveProfile(profileData)}
        className="mt-6 bg-blue-500 py-3 rounded-lg"
      >
        <Text className="text-white font-bold text-center">Save Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CompleteExample;
```

## License & Support

This component is part of the Communication App and is available for use across all modules.

For issues or feature requests, contact the development team.
