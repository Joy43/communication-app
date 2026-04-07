# FileUpload Component - Quick Reference

## Import

```typescript
import FileUpload from "@/src/components/upload/Upload";
```

## Basic Usage

```typescript
<FileUpload
  uploadType="avatar"
  onUploadSuccess={(url) => setImageUrl(url)}
/>
```

## All Upload Types

### Avatar (1:1 ratio)

```typescript
<FileUpload
  uploadType="avatar"
  onUploadSuccess={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
  customLabel="Profile Picture"
  maxSize={5}
/>
```

### Cover Photo (16:9 ratio)

```typescript
<FileUpload
  uploadType="cover"
  onUploadSuccess={(url) => setFormData(prev => ({ ...prev, coverUrl: url }))}
  customLabel="Cover Photo"
  maxSize={10}
/>
```

### Post Image (4:3 ratio)

```typescript
<FileUpload
  uploadType="post"
  onUploadSuccess={(url) => addPostImage(url)}
  customLabel="Add Image"
  maxSize={20}
/>
```

### Document

```typescript
<FileUpload
  uploadType="document"
  onUploadSuccess={(url) => handleDocumentUpload(url)}
  customLabel="Upload Document"
  maxSize={50}
/>
```

## With Error Handling

```typescript
<FileUpload
  uploadType="avatar"
  onUploadSuccess={(url) => {
    console.log('Upload success:', url);
    updateProfile({ avatarUrl: url });
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
    Toast.show({ type: 'error', text1: 'Error', text2: error });
  }}
/>
```

## Props Quick Reference

| Prop                 | Type             | Required | Default   | Notes                                       |
| -------------------- | ---------------- | -------- | --------- | ------------------------------------------- |
| `uploadType`         | string           | ✅       | -         | 'avatar' \| 'cover' \| 'post' \| 'document' |
| `onUploadSuccess`    | function         | ✅       | -         | Called with image URL                       |
| `onUploadError`      | function         | ❌       | undefined | Called with error message                   |
| `customLabel`        | string           | ❌       | auto      | Custom upload label                         |
| `maxSize`            | number           | ❌       | 10        | Max file size in MB                         |
| `aspectRatio`        | [number, number] | ❌       | auto      | Image aspect ratio                          |
| `containerClassName` | string           | ❌       | ''        | Tailwind CSS classes                        |
| `showPreview`        | boolean          | ❌       | true      | Show image preview                          |
| `allowMultiple`      | boolean          | ❌       | false     | Allow multiple files                        |

## Features at a Glance

✅ **3 Upload Methods**

- Camera
- Gallery
- URL input

✅ **Real-time Progress**

- Progress percentage
- Visual progress bar

✅ **Smart Validation**

- File size checking
- Image type validation
- URL validation

✅ **Great UX**

- Success/error notifications
- Loading states
- Image preview with clear button

✅ **Flexible**

- 4 preset types
- Customizable aspect ratios
- Adjustable file size limits

## Common Patterns

### In Edit Profile Screen

```typescript
// Cover photo
<FileUpload
  uploadType="cover"
  onUploadSuccess={(url) => setFormData(prev => ({ ...prev, coverUrl: url }))}
/>

// Avatar
<FileUpload
  uploadType="avatar"
  onUploadSuccess={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
/>

// Save all data
<Button onPress={() => saveProfile(formData)} title="Save" />
```

### In Post Creation

```typescript
const [imageUrl, setImageUrl] = useState('');

<FileUpload
  uploadType="post"
  onUploadSuccess={(url) => setImageUrl(url)}
/>

<Button
  onPress={() => createPost({ image: imageUrl, text })}
  title="Post"
/>
```

### In Settings

```typescript
const updateAvatar = async (url: string) => {
  await updateUser({ profilePictureUrl: url }).unwrap();
  Toast.show({ type: 'success', text1: 'Updated!' });
};

<FileUpload
  uploadType="avatar"
  onUploadSuccess={updateAvatar}
  customLabel="Change Avatar"
/>
```

## File Size Recommendations

```typescript
// Avatar/Profile Picture
maxSize={3}   // 3MB (usually sufficient)

// Cover Photo
maxSize={5}   // 5MB (medium quality)

// Post Images
maxSize={15}  // 15MB (HD quality)

// Documents
maxSize={50}  // 50MB (large files)
```

## Aspect Ratio Quick Ref

```typescript
// Square (Avatar, Thumbnails)
aspectRatio={[1, 1]}

// Landscape (Cover, Posts)
aspectRatio={[16, 9]}

// Wide
aspectRatio={[3, 1]}

// Portrait
aspectRatio={[9, 16]}

// Standard Photo
aspectRatio={[4, 3]}
```

## Upload Methods

```typescript
// Camera Icon - Opens Camera
// Gallery Icon - Opens Photo Library
// Paste URL - Input Text Prompt
```

## Success Callback

```typescript
onUploadSuccess={(imageUrl: string) => {
  // imageUrl is the uploaded image URL from Cloudinary
  // Use it to update your state or API
  // Toast will show automatically
}}
```

## Error Callback

```typescript
onUploadError={(errorMessage: string) => {
  // errorMessage contains details about the error
  // Toast will show automatically
  // You can add custom handling here
}}
```

## Colors Used

| Element          | Color  | Hex     |
| ---------------- | ------ | ------- |
| Primary Button   | Blue   | #0084FF |
| Secondary Button | Purple | #8B5CF6 |
| Tertiary Button  | Orange | #F97316 |
| Success          | Green  | #22C55E |
| Error            | Red    | #EF4444 |

## Loading States

- Camera button: Shows spinner while uploading
- Gallery button: Shows spinner while uploading
- Paste URL button: Shows spinner while uploading
- Progress bar: Shows upload percentage (30% → 60% → 90% → 100%)

## Permissions Required

```typescript
// iOS & Android
- Photo Library Access
- Camera Access
```

Users will be prompted if not granted.

## Troubleshooting

**Upload not working?**

- Check internet connection
- Verify Cloudinary credentials
- Check file size

**Image not showing?**

- Check image URL is valid
- Verify CORS settings
- Check image format support

**Permission denied?**

- User rejected permission
- Check app settings
- Request permission again

## Export Location

```
src/components/upload/Upload.tsx
```

## Dependencies

```json
{
  "expo-image-picker": "^15.0.0",
  "react-native-toast-message": "^2.3.3",
  "lucide-react-native": "^0.562.0"
}
```

## Performance Tips

1. Limit file size for avatars (3-5MB)
2. Disable buttons during upload
3. Clear preview after successful upload
4. Handle errors gracefully
5. Don't upload on every keystroke

## Real-World Examples

### Edit Profile

```typescript
import FileUpload from '@/src/components/upload/Upload';

<View>
  <FileUpload uploadType="cover" onUploadSuccess={...} />
  <FileUpload uploadType="avatar" onUploadSuccess={...} />
  <TextInput placeholder="Bio" />
  <Button onPress={saveProfile} title="Save" />
</View>
```

### Post Creation

```typescript
<View>
  <TextInput placeholder="Write something..." />
  <FileUpload uploadType="post" onUploadSuccess={setImage} />
  {image && <Image source={{ uri: image }} />}
  <Button onPress={submitPost} title="Post" />
</View>
```

### Avatar Changer

```typescript
<FileUpload
  uploadType="avatar"
  onUploadSuccess={(url) => updateProfile({ avatar: url })}
  customLabel="Change Your Avatar"
/>
```

## Next Steps

1. Import in your component
2. Add required props
3. Handle success callback
4. (Optional) Handle error callback
5. Test upload functionality

That's it! The component handles everything else! 🚀
