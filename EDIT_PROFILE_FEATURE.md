# Edit Profile Feature - Complete Implementation Guide

## Overview

Professional edit profile screen with file upload functionality, form validation, and real-time data updates.

## Features Implemented

### 1. **File Upload with Image URLs**

- Upload profile picture and cover photo
- Support for direct image URL input
- Image validation and preview
- Cloudinary integration for actual file uploads (ready to use)

### 2. **Professional Form Fields**

- **Username**: User's display name
- **Title**: Job title or profession
- **Bio**: Multi-line biography
- **Location**: Geographic location
- **Gender**: Selection (MALE, FEMALE, OTHER)
- **Date of Birth**: Date input
- **Experience**: Work experience details
- **Notifications**: Toggle notification settings

### 3. **User Experience Features**

- Loading states for uploads and saves
- Toast notifications for success/error feedback
- Form validation
- Back button navigation
- Image preview with edit overlays
- Responsive design with Tailwind CSS

## Data Structure

```typescript
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

## API Integration

### Update Profile Mutation

```typescript
const [updateProfile, { isLoading: isUpdating }] =
  useUpdateProfileUserMutation();

// Usage
await updateProfile({
  username: "john_doe",
  title: "Software Engineer",
  bio: "Passionate about coding",
  avatarUrl: "https://...",
  // ... other fields
}).unwrap();
```

### Upload File Mutation

```typescript
const [uploadFile, { isLoading: isUploading }] =
  useCloudinaryUploadSingleMutation();

// FormData for file upload
const formData = new FormData();
formData.append("file", { uri, type: "image/jpeg", name });

const response = await uploadFile(formData).unwrap();
// Response: { urls: ["https://..."] }
```

## File Structure

```
app/(profile)/
├── edit-profile.tsx          # Main edit profile screen
├── my-profile.tsx           # View profile (linked)
└── _layout.tsx             # Layout configuration

src/components/Profile/
└── my-profile.tsx          # Profile detail component

src/redux/features/profile/
└── user.api.ts             # API hooks

src/types/
└── user.type.ts            # Extended user type
```

## Usage Flow

```
Profile Screen
    ↓
Click "Edit Profile" button
    ↓
Navigate to /(profile)/edit-profile
    ↓
User can:
  - Edit text fields
  - Upload images via URL
  - Toggle notifications
    ↓
Click "Save Changes"
    ↓
updateProfile() called
    ↓
Success → Navigate back with toast
Error → Show error toast
```

## Image Upload Process

### Current Implementation (URL Input)

1. User taps camera icon
2. Alert shows options
3. User selects "From URL"
4. Prompt appears to enter URL
5. App validates URL is valid image
6. Image preview updates immediately
7. URL saved to form data

### Ready for Implementation (File Upload)

When expo-image-picker is installed:

```typescript
import * as ImagePicker from "expo-image-picker";

// Can be uncommented to enable native image picker
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  quality: 0.8,
});
```

## Component Props & State

### State Management

```typescript
const [formData, setFormData] = useState<EditProfileFormData>({...});
const [avatarImage, setAvatarImage] = useState<string | null>(null);
const [coverImage, setCoverImage] = useState<string | null>(null);
```

### Redux Integration

```typescript
const { data: userProfile } = useGetUserQuery(null);
const [updateProfile, { isLoading: isUpdating }] =
  useUpdateProfileUserMutation();
const [uploadFile, { isLoading: isUploading }] =
  useCloudinaryUploadSingleMutation();
```

## Styling

All components use Tailwind CSS with these key classes:

- `bg-blue-500` - Primary action buttons
- `border-gray-300` - Input borders
- `rounded-lg` - Border radius for inputs
- `text-sm font-semibold` - Labels
- `flex-row` - Horizontal layouts
- `gap-3` - Spacing between elements

## Validation

### Form Validation

```typescript
if (!formData.username.trim()) {
  Toast.show({
    type: "error",
    text1: "Validation Error",
    text2: "Username is required",
  });
}
```

### Image URL Validation

```typescript
const response = await fetch(url, { method: "HEAD" });
if (!response.ok || !response.headers.get("content-type")?.includes("image")) {
  throw new Error("Invalid image URL");
}
```

## Error Handling

```typescript
// Try-catch in async operations
try {
  const uploadResponse = await uploadFile(formData).unwrap();
  // Handle success
} catch (error) {
  Toast.show({
    type: "error",
    text1: "Upload Failed",
    text2: "Failed to upload image. Please try again.",
  });
}
```

## Toast Notifications

Success states:

- Profile picture/cover updated
- Profile changes saved

Error states:

- Upload failed
- Invalid image URL
- Update failed
- Validation errors

## Future Enhancements

1. **Image Picker Integration**
   - Install: `expo install expo-image-picker`
   - Enable native file picker
   - Camera access for direct photo capture

2. **Advanced Validation**
   - Email validation
   - Phone number formatting
   - Date validation

3. **Profile Completeness**
   - Show completion percentage
   - Suggest missing fields
   - Progress tracking

4. **File Upload Progress**
   - Progress bar for uploads
   - Cancel upload option
   - Retry on failure

## Example API Response

```json
{
  "urls": [
    "https://res.cloudinary.com/daudqg8x1/image/upload/v1775515987/communication-app/profile_pic.png"
  ]
}
```

## User Data Example (Stored)

```json
{
  "username": "john_doe",
  "title": "Software Engineer",
  "bio": "Passionate about coding and technology.",
  "avatarUrl": "https://example.com/avatar.png",
  "coverUrl": "https://example.com/cover.png",
  "location": "New York, USA",
  "gender": "MALE",
  "dateOfBirth": "1990-01-01",
  "experience": "5 years at Google",
  "isToggleNotification": true
}
```

## Dependencies

Required:

- `react-native`
- `expo-router`
- `lucide-react-native`
- `nativewind` (Tailwind CSS)
- `react-redux`
- `react-native-toast-message`

Optional (for native image picker):

- `expo-image-picker`

## Testing Checklist

- [ ] Form fields accept and display input
- [ ] Image URL upload works
- [ ] Image validation prevents invalid URLs
- [ ] Save button sends correct data to API
- [ ] Loading states show during operations
- [ ] Toast notifications appear for success/error
- [ ] Back button navigates correctly
- [ ] Notification toggle works
- [ ] Gender selection updates properly
- [ ] All form fields populate on edit screen load
