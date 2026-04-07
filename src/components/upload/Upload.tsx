import { useCloudinaryUploadSingleMutation } from "@/src/redux/features/upload/upload.api";
import * as ImagePicker from "expo-image-picker";
import { Camera, CheckCircle, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface FileUploadProps {
  onUploadSuccess: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  uploadType: "avatar" | "cover" | "post" | "document";
  aspectRatio?: [number, number];
  maxSize?: number; 
  allowMultiple?: boolean;
  customLabel?: string;
  containerClassName?: string;
  showPreview?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  uploadType,
  aspectRatio = uploadType === "avatar" ? [1, 1] : [16, 9],
  maxSize = 10,
  allowMultiple = false,
  customLabel,
  containerClassName = "",
  showPreview = true,
}) => {
  const [uploadFile, { isLoading: isUploading }] =
    useCloudinaryUploadSingleMutation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Get label based on upload type
  const getDefaultLabel = () => {
    switch (uploadType) {
      case "avatar":
        return "Upload Profile Picture";
      case "cover":
        return "Upload Cover Photo";
      case "post":
        return "Upload Post Image";
      case "document":
        return "Upload Document";
      default:
        return "Upload File";
    }
  };

  const label = customLabel || getDefaultLabel();

  // Get container dimensions based on type
  const getContainerSize = () => {
    switch (uploadType) {
      case "avatar":
        return "w-32 h-32";
      case "cover":
        return "w-full h-40";
      case "post":
        return "w-full h-64";
      case "document":
        return "w-full h-32";
      default:
        return "w-full h-40";
    }
  };

  // Check file size
  const checkFileSize = (fileSize: number): boolean => {
    const fileSizeMB = fileSize / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      Toast.show({
        type: "error",
        text1: "File Too Large",
        text2: `Maximum file size is ${maxSize}MB. Your file is ${fileSizeMB.toFixed(2)}MB`,
      });
      return false;
    }
    return true;
  };

  // Handle image picker
  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Camera roll permission is required",
        });
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size
        if (asset.fileSize && !checkFileSize(asset.fileSize)) {
          return;
        }

        // Set selected image
        setSelectedImage(asset.uri);

        // Upload to Cloudinary
        await uploadImageToCloudinary(asset.uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      onUploadError?.(errorMessage);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick image. Please try again.",
      });
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (imageUri: string) => {
    try {
      setUploadProgress(30);

      // Create FormData
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: `${uploadType}-${Date.now()}.jpg`,
      } as any);

      setUploadProgress(60);

      // Upload to API
      const response = await uploadFile(formData).unwrap();

      setUploadProgress(90);

      if (response?.urls?.[0]) {
        const imageUrl = response.urls[0];
        setUploadProgress(100);

        // Reset progress after delay
        setTimeout(() => setUploadProgress(0), 1000);

        // Call success callback
        onUploadSuccess(imageUrl);

        Toast.show({
          type: "success",
          text1: "Upload Successful",
          text2: `${label} has been uploaded successfully`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      onUploadError?.(errorMessage);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: "Failed to upload image. Please try again.",
      });
    }
  };

  // Handle URL input
  const handleImageUrl = () => {
    Alert.prompt(
      `Enter ${label}`,
      "Paste the image URL",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Add",
          onPress: async (url: string | undefined) => {
            if (!url || !url.trim()) {
              Toast.show({
                type: "error",
                text1: "Invalid URL",
                text2: "Please enter a valid image URL",
              });
              return;
            }

            try {
              // Validate URL is an image
              const response = await fetch(url, { method: "HEAD" });
              if (
                !response.ok ||
                !response.headers.get("content-type")?.includes("image")
              ) {
                throw new Error("Invalid image URL");
              }

              setSelectedImage(url);
              onUploadSuccess(url);

              Toast.show({
                type: "success",
                text1: "Image Added",
                text2: "Image URL has been added successfully",
              });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Invalid Image",
                text2: "Please enter a valid image URL",
              });
            }
          },
        },
      ],
      "plain-text",
    );
  };

  // Handle camera capture
  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Camera permission is required",
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size
        if (asset.fileSize && !checkFileSize(asset.fileSize)) {
          return;
        }

        setSelectedImage(asset.uri);
        await uploadImageToCloudinary(asset.uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Toast.show({
        type: "error",
        text1: "Camera Error",
        text2: "Failed to access camera. Please try again.",
      });
    }
  };

  // Clear image
  const clearImage = () => {
    setSelectedImage(null);
    setUploadProgress(0);
  };

  const containerSize = getContainerSize();
  const isCircular = uploadType === "avatar";

  return (
    <ScrollView className={containerClassName}>
      <View className="mb-4">
        {/* Label */}
        <Text className="text-sm font-semibold text-gray-700 mb-3">
          {label}
        </Text>

        {/* Image Preview or Upload Area */}
        {selectedImage ? (
          <View className={`relative ${containerSize}`}>
            <Image
              source={{ uri: selectedImage }}
              className={`w-full h-full ${isCircular ? "rounded-full" : "rounded-lg"}`}
              resizeMode="cover"
            />

            {/* Success Badge */}
            <View className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <CheckCircle size={20} color="#fff" />
            </View>

            {/* Clear Button */}
            <TouchableOpacity
              onPress={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2"
            >
              <X size={16} color="#fff" />
            </TouchableOpacity>

            {/* Progress Overlay */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <View className="absolute inset-0 bg-black/40 items-center justify-center rounded-lg">
                <ActivityIndicator size={40} color="#fff" />
                <Text className="text-white font-semibold mt-2">
                  {uploadProgress}%
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View
            className={`border-2 border-dashed border-gray-300 rounded-lg items-center justify-center bg-gray-50 ${containerSize}`}
          >
            <View className="items-center">
              <Camera size={40} color="#9CA3AF" />
              <Text className="text-gray-600 text-sm font-medium mt-2">
                Add {uploadType === "avatar" ? "Profile Picture" : "Image"}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-3 mt-4">
          {/* Camera Button */}
          <TouchableOpacity
            onPress={handleCamera}
            disabled={isUploading}
            className="flex-1 py-3 rounded-lg bg-blue-500 items-center justify-center flex-row gap-2"
          >
            {isUploading ? (
              <ActivityIndicator size={20} color="#fff" />
            ) : (
              <>
                <Camera size={18} color="#fff" />
                <Text className="text-white font-semibold">Camera</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Gallery Button */}
          <TouchableOpacity
            onPress={pickImage}
            disabled={isUploading}
            className="flex-1 py-3 rounded-lg bg-purple-500 items-center justify-center flex-row gap-2"
          >
            {isUploading ? (
              <ActivityIndicator size={20} color="#fff" />
            ) : (
              <>
                <Camera size={18} color="#fff" />
                <Text className="text-white font-semibold">Gallery</Text>
              </>
            )}
          </TouchableOpacity>

          {/* URL Button */}
          <TouchableOpacity
            onPress={handleImageUrl}
            disabled={isUploading}
            className="flex-1 py-3 rounded-lg bg-orange-500 items-center justify-center"
          >
            {isUploading ? (
              <ActivityIndicator size={20} color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-sm">
                Paste URL
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Upload Status */}
        {isUploading && (
          <View className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold text-blue-900">
                Uploading...
              </Text>
              <Text className="text-sm font-bold text-blue-600">
                {uploadProgress}%
              </Text>
            </View>
            <View className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default FileUpload;
