// ProfileImages.tsx
import ActionButton from "@/components/ActionButton"; // Adapt or recreate for RN
import PageHeader from "@/components/PageHeader"; // Adapt or recreate for RN
import { useToast } from "@/hooks/useToast"; // Custom hook
import { useProfileStore } from "@/store/useProfileStore"; // Custom store
import {
  compressImage,
  convertToBase64,
  validateImageType,
} from "@/utils/imageUtils"; // Updated image utility functions
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import { launchImageLibrary } from "react-native-image-picker"; // REMOVE THIS IMPORT
import * as ImagePicker from "expo-image-picker"; // ADD THIS IMPORT

const IMAGE_TYPES = [
  { id: "face", label: "Your face", description: "A clear headshot" },
  {
    id: "skill",
    label: "Flex ur skill",
    description: "Show off your expertise",
  },
  {
    id: "professional",
    label: "Anything but professional",
    description: "Something that represents you",
  },
];

const ProfileImages: React.FC = () => {
  const navigation = useNavigation();
  const { toast } = useToast();
  const { profile, addProfileImage, completeStep } = useProfileStore();

  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const handleImageUpload = async (type: string) => {
    // Request media library permissions first
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Permission to access the media library is required to upload photos."
      );
      return;
    }

    // Launch image library to select a photo using Expo ImagePicker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // Only allow images
      allowsEditing: false, // Set to true if you want to allow cropping/editing
      quality: 0.7, // Image quality (0 to 1)
      // base64: true, // We'll handle base64 conversion manually for consistency with compression
    });

    if (result.canceled) {
      console.log("Image selection cancelled by user.");
      return; // User cancelled image selection
    }

    const asset = result.assets?.[0]; // Get the first selected asset (Expo also returns an assets array)
    if (!asset || !asset.uri) {
      toast({
        title: "No image selected",
        variant: "destructive",
      });
      return;
    }

    // Validate image type using the utility function
    // Expo ImagePicker usually provides `type` for iOS (e.g., 'image'), but `mimeType` is more reliable for Android.
    // Let's use `asset.mimeType` if available, otherwise fallback or derive.
    // For `validateImageType`, providing `asset.uri` is often enough to infer type from extension.
    if (
      !validateImageType({
        type: asset.mimeType || asset.type,
        name: asset.fileName,
      })
    ) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingType(type); // Set uploading state for the specific image type

      // Compress the image using its URI
      console.log(asset.uri, "asdfds");
      const compressedImageUri = await compressImage(asset.uri);
      console.log(
        "Compressed image URI (after ImageResizer):",
        compressedImageUri
      ); // <-- ADD THIS LOG

      // Convert the compressed image URI to a base64 string
      const base64 = await convertToBase64(compressedImageUri);

      // Determine the correct MIME type for the data URI prefix.
      // `asset.type` can be generic ('image'). `asset.mimeType` (if available) is better.
      // If not available, you might infer from `asset.fileName` or default.
      const imageMimeType = asset.mimeType || "image/jpeg"; // Fallback if mimeType is not provided consistently

      // Add the image to the profile store with the data URI prefix for display
      addProfileImage({
        url: `data:${imageMimeType};base64,${base64}` as string,
        type: type as any,
      });

      toast({
        description: "Image successfully uploaded.",
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingType(null); // Reset uploading state
    }
  };

  const router = useRouter(); // Expo Router hook for navigation
  const handleContinue = () => {
    // You might want to add validation here to ensure at least one image is uploaded
    // before allowing navigation.
    completeStep(7); // Mark step 7 as complete in your store
    router.push("/(registration)/misc"); // Navigate to the next screen
  };

  const handleBack = () => {
    navigation.goBack(); // Go back to the previous screen in the navigation stack
  };

  // Helper to get the image URL for a given type from the profile store
  const getImageForType = (type: string) => {
    return profile.profileImages.find((img) => img.type === type)?.url;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PageHeader
        title="Profile Images"
        subtitle="Upload three professional photos that represent you best"
        currentStep={6}
        totalSteps={6}
        onBack={handleBack}
      />

      <View style={styles.grid}>
        {IMAGE_TYPES.map((type) => {
          const imageUrl = getImageForType(type.id);

          return (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.imageBox,
                imageUrl ? styles.imageBoxFilled : styles.imageBoxEmpty,
              ]}
              onPress={() => handleImageUpload(type.id)}
              disabled={!!uploadingType} // Disable if any upload is in progress
            >
              {uploadingType === type.id ? (
                <ActivityIndicator size="small" color="#666" />
              ) : imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} />
              ) : (
                <Text style={styles.label}>{type.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.uploadButton}
        // This button specifically uploads a "face" photo, you might want to modify this
        onPress={() => handleImageUpload("face")}
        disabled={!!uploadingType}
      >
        <Text style={styles.uploadButtonText}>+ Upload photo</Text>
      </TouchableOpacity>

      <ActionButton onPress={handleContinue} fullWidth>
        Continue
      </ActionButton>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    flexWrap: "wrap",
  },
  imageBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  imageBoxEmpty: {
    borderColor: "#ccc",
  },
  imageBoxFilled: {
    borderColor: "transparent",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },
  label: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  uploadButton: {
    backgroundColor: "#eee",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  uploadButtonText: {
    color: "#444",
    fontWeight: "600",
  },
});

export default ProfileImages;
