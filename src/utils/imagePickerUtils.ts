import * as ImagePicker from "expo-image-picker";

export interface PickedImageResult {
  uri: string;
  name: string;
  type: "image/jpeg" | "image/png" | "image/webp";
  size?: number;
}

export const pickImageFromLibrary = async (options?: {
  aspect?: [number, number];
  allowsEditing?: boolean;
  quality?: number;
}): Promise<PickedImageResult | null> => {
  try {

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.warn("Media library permission denied");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], 
      allowsEditing: options?.allowsEditing ?? true,
      quality: options?.quality ?? 0.7,
      aspect: options?.aspect,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const image = result.assets[0];

    //  ------- Detect actual mime type from uri extension--------
    const uri = image.uri;
    const extension = uri.split(".").pop()?.toLowerCase();
    const mimeType: PickedImageResult["type"] =
      extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg";

    const fileName = `image-${Date.now()}.${extension ?? "jpg"}`;

    return {
      uri,
      name: fileName,
      type: mimeType,
      size: image.fileSize,
    };
  } catch (error) {
    console.error("Image picker error:", error);
    throw error;
  }
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
};

/**
 * Format image for FormData upload
 */
export const formatImageForUpload = (image: PickedImageResult) => {
  return {
    uri: image.uri,
    name: image.name,
    type: image.type,
  };
};

/**
 * Validate image before upload
 */
export const validateImage = (
  image: PickedImageResult,
  maxSizeMB: number = 5,
): { valid: boolean; error?: string } => {
  if (image.size) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (image.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Image size must be less than ${maxSizeMB}MB`,
      };
    }
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(image.type)) {
    return {
      valid: false,
      error: "Please select a valid image format (JPEG, PNG, or WebP)",
    };
  }

  return { valid: true };
};