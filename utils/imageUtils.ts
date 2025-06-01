// utils/imageUtils.ts (KEEP THIS FILE EXACTLY AS BEFORE)
import * as FileSystem from "expo-file-system";

// utils/imageUtils.ts
import * as ImageManipulator from "expo-image-manipulator";

interface ImageTypeValidationProps {
  type?: string | null; // MIME type from image picker (e.g., 'image/jpeg')
  name?: string | null; // File name, useful for checking extensions (e.g., 'photo.jpg')
}

export const validateImageType = ({
  type,
  name,
}: ImageTypeValidationProps): boolean => {
  if (!type && !name) return false;

  const validMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  if (type && validMimeTypes.includes(type)) {
    return true;
  }
  if (name) {
    const lowerCaseName = name.toLowerCase();
    return validExtensions.some((ext) => lowerCaseName.endsWith(ext));
  }
  return false;
};

export const compressImage = async (uri: string): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // only resize width, height auto-scaled
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false,
      }
    );
    return result.uri;
  } catch (err) {
    console.error("Image compression failed:", err);
    throw new Error("Failed to compress image.");
  }
};

export const convertToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error("Error converting to base64:", error);
    throw new Error("Failed to convert image to base64.");
  }
};
