// // ProfileImages.tsx
// import ActionButton from "@/components/ActionButton";
// import PageHeader from "@/components/PageHeader";
// import QuestionHeader from "@/components/PageHeader/QuestionHeader";
// import { useToast } from "@/hooks/useToast";
// import { useProfileStore } from "@/store/useProfileStore";
// import {
//   compressImage,
//   convertToBase64,
//   validateImageType,
// } from "@/utils/imageUtils";
// import { useNavigation } from "@react-navigation/native";
// import { useRouter } from "expo-router";
// import React, { useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import * as DocumentPicker from "expo-document-picker"; // ✅ New import

// const IMAGE_TYPES = [
//   { id: "face", label: "Your face", description: "A clear headshot" },
//   { id: "skill", label: "Flex ur skill", description: "Show off your expertise" },
//   { id: "professional", label: "Anything but professional", description: "Something that represents you" },
// ];

// const ProfileImages: React.FC = () => {
//   const navigation = useNavigation();
//   const { toast } = useToast();
//   const { profile, addProfileImage, completeStep } = useProfileStore();
//   const [uploadingType, setUploadingType] = useState<string | null>(null);
//   const router = useRouter();

//   const handleImageUpload = async (type: string) => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: ["image/jpeg", "image/png", "image/webp", "image/gif"],
//         copyToCacheDirectory: true,
//         multiple: false,
//       });

//       if (result.canceled || !result.assets || !result.assets.length) {
//         console.log("User canceled or no file selected.");
//         return;
//       }

//       const file = result.assets[0];

//       if (
//         !validateImageType({
//           type: file.mimeType,
//           name: file.name,
//         })
//       ) {
//         toast({
//           title: "Invalid file type",
//           description: "Please upload a JPEG, PNG, GIF, or WebP image.",
//           variant: "destructive",
//         });
//         return;
//       }

//       setUploadingType(type);

//       const compressedUri = await compressImage(file.uri);
//       const base64 = await convertToBase64(compressedUri);
//       const mimeType = file.mimeType || "image/jpeg";

//       addProfileImage({
//         url: `data:${mimeType};base64,${base64}`,
//         type,
//       });

//       toast({
//         description: "Image successfully uploaded.",
//       });
//     } catch (error) {
//       console.error("Error selecting image:", error);
//       toast({
//         title: "Upload failed",
//         description: "Failed to process the image. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setUploadingType(null);
//     }
//   };

//   const handleContinue = () => {
//     const hasFaceImage = profile.profileImages.some((img) => img.type === "face");

//     if (!hasFaceImage) {
//       toast({
//         title: "Upload Required",
//         description: "Please upload a clear headshot (your face) before continuing.",
//         variant: "destructive",
//       });
//       return;
//     }

//     completeStep(7);
//     router.push("/(registration)/misc");
//   };

//   const handleBack = () => {
//     navigation.goBack();
//   };

//   const getImageForType = (type: string) => {
//     return profile.profileImages.find((img) => img.type === type)?.url;
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <PageHeader currentStep={3} totalSteps={6} onBack={handleBack} />
//       <QuestionHeader
//         title="Profile Images"
//         subtitle="Upload three professional photos that represent you best"
//       />

//       <View style={styles.grid}>
//         {IMAGE_TYPES.map((type) => {
//           const imageUrl = getImageForType(type.id);

//           return (
//             <TouchableOpacity
//               key={type.id}
//               style={[
//                 styles.imageBox,
//                 imageUrl ? styles.imageBoxFilled : styles.imageBoxEmpty,
//               ]}
//               onPress={() => handleImageUpload(type.id)}
//               disabled={!!uploadingType}
//             >
//               {uploadingType === type.id ? (
//                 <ActivityIndicator size="small" color="#666" />
//               ) : imageUrl ? (
//                 <Image source={{ uri: imageUrl }} style={styles.image} />
//               ) : (
//                 <Text style={styles.label}>{type.label}</Text>
//               )}
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       <TouchableOpacity
//         style={styles.uploadButton}
//         onPress={() => handleImageUpload("face")}
//         disabled={!!uploadingType}
//       >
//         <Text style={styles.uploadButtonText}>+ Upload photo</Text>
//       </TouchableOpacity>

//       <ActionButton onPress={handleContinue} fullWidth>
//         Continue
//       </ActionButton>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 24,
//     paddingVertical: 24,
//     backgroundColor: "#fff",
//   },
//   grid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 24,
//     flexWrap: "wrap",
//   },
//   imageBox: {
//     width: 100,
//     height: 100,
//     borderRadius: 24,
//     borderWidth: 2,
//     borderStyle: "dashed",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 16,
//     padding: 10,
//   },
//   imageBoxEmpty: {
//     borderColor: "#ccc",
//   },
//   imageBoxFilled: {
//     borderColor: "transparent",
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 12,
//     resizeMode: "cover",
//   },
//   label: {
//     fontSize: 12,
//     color: "#888",
//     paddingHorizontal: 4,
//     textAlign: "center",
//   },
//   uploadButton: {
//     backgroundColor: "#eee",
//     paddingVertical: 12,
//     borderRadius: 16,
//     height: 56,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 24,
//     alignSelf: "center",
//     width: 250,
//   },
//   uploadButtonText: {
//     color: "#444",
//     fontWeight: "600",
//   },
// });

// export default ProfileImages;

// ProfileImages.tsx
import ActionButton from "@/components/ActionButton";
import PageHeader from "@/components/PageHeader";
import QuestionHeader from "@/components/PageHeader/QuestionHeader";
import { useToast } from "@/hooks/useToast";
import { useProfileStore } from "@/store/useProfileStore";
import {
  compressImage,
  convertToBase64,
  validateImageType,
} from "@/utils/imageUtils";
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
import * as DocumentPicker from "expo-document-picker"; // ✅ New import

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
  const router = useRouter();

  const handleImageUpload = async (type: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || !result.assets.length) {
        console.log("User canceled or no file selected.");
        return;
      }

      const file = result.assets[0];

      if (
        !validateImageType({
          type: file.mimeType,
          name: file.name,
        })
      ) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, GIF, or WebP image.",
          variant: "destructive",
        });
        return;
      }

      setUploadingType(type);

      const compressedUri = await compressImage(file.uri);
      const base64 = await convertToBase64(compressedUri);
      const mimeType = file.mimeType || "image/jpeg";

      addProfileImage({
        url: `data:${mimeType};base64,${base64}`,
        type,
      });

      toast({
        description: "Image successfully uploaded.",
      });
    } catch (error) {
      console.error("Error selecting image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingType(null);
    }
  };

  const handleContinue = () => {
    const hasFaceImage = profile.profileImages.some(
      (img) => img.type === "face"
    );

    if (!hasFaceImage) {
      toast({
        title: "Upload Required",
        description:
          "Please upload a clear headshot (your face) before continuing.",
        variant: "destructive",
      });
      return;
    }

    completeStep(7);
    router.push("/(registration)/misc");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getImageForType = (type: string) => {
    return profile.profileImages.find((img) => img.type === type)?.url;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PageHeader currentStep={3} totalSteps={6} onBack={handleBack} />
      <QuestionHeader
        title="Profile Images"
        subtitle="Upload three professional photos that represent you best"
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
              disabled={!!uploadingType}
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
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#fff",
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
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    padding: 10,
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
    paddingHorizontal: 4,
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: "#eee",
    paddingVertical: 12,
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    alignSelf: "center",
    width: 250,
  },
  uploadButtonText: {
    color: "#444",
    fontWeight: "600",
  },
});

export default ProfileImages;
