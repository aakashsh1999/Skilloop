import ActionButton from "@/components/ActionButton"; // Custom button
import PageHeader from "@/components/PageHeader"; // Top header bar
import { useProfileStore } from "../../store/useProfileStore";
import { formatDate } from "@/utils/dateUtils";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import QuestionHeader from "@/components/PageHeader/QuestionHeader";
import React, { useState } from "react";
import {
  Alert,
  Button, // Keeping standard Button for dialog, but will replace main ones with ActionButton
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Assuming your useProfileStore.ts file is in the same directory as this component's parent
// and has an addCertificate function that generates unique IDs (e.g., using uuid)
// For example, in useProfileStore.ts:
/*
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid'; // Requires 'react-native-get-random-values' import at app entry

interface Certificate {
  id: string; // Add ID for FlatList keyExtractor and removal
  title: string;
  organization: string;
  issueDate?: string;
  imageUrl?: string;
  certificateUrl?: string;
}

interface ProfileState {
  profile: {
    certificates: Certificate[];
    // ... other profile info
  };
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  removeCertificate: (id: string) => void;
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: {
    certificates: [],
    // ... initial profile values
  },
  addCertificate: (newCertData) =>
    set((state) => ({
      profile: {
        ...state.profile,
        certificates: [...state.profile.certificates, { id: uuidv4(), ...newCertData }],
      },
    })),
  removeCertificate: (id) =>
    set((state) => ({
      profile: {
        ...state.profile,
        certificates: state.profile.certificates.filter((cert) => cert.id !== id),
      },
    })),
  setCurrentStep: (step) => {
    // ... update step logic
  },
  completeStep: (step) => {
    // ... complete step logic
  },
}));
*/

const CertificatesScreen = () => {
  const navigation = useNavigation(); // Not directly used in JSX, but useful for generic navigation
  const {
    profile,
    addCertificate,
    removeCertificate,
    setCurrentStep,
    completeStep,
  } = useProfileStore();
  const router = useRouter(); // For expo-router navigation

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    issueDate: "",
    imageUrl: "", // Base64 string for image display
    certificateUrl: "",
  });

  // State to determine if "Save" button in dialog is enabled
  const isDialogFormValid =
    formData.title.trim() !== "" && formData.organization.trim() !== "";

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "Permission to access camera roll is required to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      allowsEditing: true, // Allows user to crop/edit
      quality: 0.7, // Compress image quality
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
    });

    if (!result.canceled) {
      const selectedAsset =
        result.assets && result.assets.length > 0 ? result.assets[0] : null;

      if (selectedAsset && selectedAsset.base64) {
        setFormData({
          ...formData,
          imageUrl: `data:image/jpeg;base64,${selectedAsset.base64}`, // Correct base64 URI
        });
      } else {
        Alert.alert("Image Error", "Failed to get image data.");
      }
    }
  };

  const handleAddCertificate = () => {
    if (!isDialogFormValid) {
      Alert.alert(
        "Required Fields",
        "Please provide a certificate title and issuing organization."
      );
      return;
    }

    addCertificate(formData); // `id` should be generated in the store's addCertificate
    setFormData({
      title: "",
      organization: "",
      issueDate: "",
      imageUrl: "",
      certificateUrl: "",
    });
    setIsDialogOpen(false);
  };

  const handleRemoveCertificate = (id: string) => {
    Alert.alert(
      "Remove Certificate",
      "Are you sure you want to remove this certificate?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => removeCertificate(id),
          style: "destructive",
        },
      ]
    );
  };

  const handleContinue = () => {
    completeStep(4); // Mark step 4 as complete
    setCurrentStep(5); // Move to step 5
    router.push("/(registration)/work-experience"); // Navigate to the next registration step
  };

  const handleBack = () => {
    // This custom onBack handler could navigate to the previous registration step
    router.push("/(registration)/basic-information"); // Example: go back to basic info
  };

  const handleSkip = () => {
    completeStep(4);
    setCurrentStep(5);
    router.push("/(registration)/work-experience");
  };

  // Helper function to render each certificate item for FlatList
  const renderCertificateItem = ({ item }: { item: any }) => (
    <View style={styles.certificateItem}>
      <View style={styles.certificateDetails}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.certificateImage}
          />
        ) : null}
        <View style={styles.certificateTextContainer}>
          <Text style={styles.certificateTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.certificateOrgDate} numberOfLines={1}>
            {item.organization}
            {item.issueDate ? ` • ${formatDate(item.issueDate)}` : ""}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveCertificate(item.id)}
        style={styles.removeButton}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={appStyles.fullScreenContainer}>
      <PageHeader currentStep={5} totalSteps={6} onBack={handleBack} />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <QuestionHeader
          title="Certificates"
          subtitle="Add your certificates and certifications to showcase your skills"
        />

        <TouchableOpacity
          onPress={() => setIsDialogOpen(true)}
          style={styles.addCertificateButton}
        >
          <Text style={styles.addCertificateButtonText}>+ Add Certificate</Text>
        </TouchableOpacity>

        {profile.certificates && profile.certificates.length > 0 && (
          <FlatList
            data={profile.certificates}
            keyExtractor={(item) => item.id.toString()} // Ensure 'id' is a string or number
            renderItem={renderCertificateItem}
            contentContainerStyle={styles.certificatesList}
            scrollEnabled={false} // FlatList inside ScrollView generally shouldn't scroll
          />
        )}

        {/* Conditional rendering for "Continue" or "Skip" */}
        {profile.certificates && profile.certificates.length > 0 ? (
          <ActionButton onPress={handleContinue} fullWidth>
            Continue
          </ActionButton>
        ) : (
          <ActionButton
            onPress={handleSkip}
            fullWidth
            style={styles.skipButton}
            textStyle={styles.skipButtonText}
          >
            Skip for now
          </ActionButton>
        )}
      </ScrollView>

      {/* Modal/Dialog for Add Certificate */}
      {isDialogOpen && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>Add certificate</Text>

            <TextInput
              placeholder="Certificate Title *"
              value={formData.title}
              onChangeText={(text) => handleChange("title", text)}
              style={styles.dialogInput}
            />

            <TextInput
              placeholder="Issuing Organization *"
              value={formData.organization}
              onChangeText={(text) => handleChange("organization", text)}
              style={styles.dialogInput}
            />

            <TextInput
              placeholder="Issue Date (e.g., 01/2023)"
              value={formData.issueDate}
              onChangeText={(text) => handleChange("issueDate", text)}
              style={styles.dialogInput}
              keyboardType="numbers-and-punctuation"
            />

            <TouchableOpacity
              onPress={handleImageChange}
              style={styles.uploadImageButton}
            >
              <Text style={styles.uploadImageButtonText}>
                Upload Certificate Image
              </Text>
            </TouchableOpacity>

            {formData.imageUrl ? (
              <Image
                source={{ uri: formData.imageUrl }}
                style={styles.uploadedImagePreview}
              />
            ) : null}

            <TextInput
              placeholder="Certificate URL (Optional)"
              value={formData.certificateUrl}
              onChangeText={(text) => handleChange("certificateUrl", text)}
              style={styles.dialogInput}
              keyboardType="url"
            />

            <View style={styles.dialogButtons}>
              <Button
                title="Cancel"
                onPress={() => setIsDialogOpen(false)}
                color="grey"
              />
              <View style={{ width: 8 }} />
              <Button
                title="Save"
                onPress={handleAddCertificate}
                disabled={!isDialogFormValid}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CertificatesScreen;

const appStyles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "white",
  },
});

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    backgroundColor: "white",
    paddingBottom: 40, // Ensure space for action button at bottom
  },
  // Reusing styles from BasicInformation for consistency with QuestionHeader
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 24, // Space below header
  },
  pageSubtitle: {
    fontSize: 16,
    color: "#6b7280", // gray-500
    marginBottom: 24, // Space before first input
  },
  addCertificateButton: {
    marginVertical: 12,
    // Removed width: "80%" and marginHorizontal: "auto" as they don't work for alignSelf
    alignSelf: "center", // Center the button horizontally
    width: "90%", // Adjust width as needed
    borderColor: "#ccc",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
  },
  addCertificateButtonText: {
    color: "#4B5563", // Gray color
    fontSize: 16,
    fontFamily: "Montserrat",
    fontWeight: "500",
  },
  certificatesList: {
    paddingBottom: 20, // Add padding below the list itself
  },
  certificateItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#F8F8F8", // Light gray background
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0", // Subtle border
  },
  certificateDetails: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1, // Allow text to shrink
    marginRight: 10, // Space before remove button
  },
  certificateImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#DCDCDC", // Placeholder background for image
  },
  certificateTextContainer: {
    flexShrink: 1,
  },
  certificateTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  certificateOrgDate: {
    fontSize: 13,
    color: "#666",
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: "#FF6347", // Tomato red for clear "remove"
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  skipButton: {
    // Custom style for the skip button, making it distinct from "Continue"
    backgroundColor: "#A9A9A9", // Darker gray
    borderColor: "#696969", // Even darker gray border
    marginTop: 40,
  },
  skipButtonText: {
    // If you want different text style for skip
    color: "white",
  },

  // Dialog (Modal) Styles
  dialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", // Darker overlay
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },
  dialogContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12, // More rounded corners
    width: "95%",
    maxHeight: "85%", // Increased max height
    // Optional: Add shadow to dialog
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  dialogTitle: {
    fontSize: 22, // Slightly larger title
    fontWeight: "bold",
    marginBottom: 20, // More space
    textAlign: "center", // Center dialog title
  },
  dialogInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB", // Lighter border
    borderRadius: 8, // Slightly rounded input
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    marginBottom: 15,
    fontSize: 16,
  },
  uploadImageButton: {
    marginVertical: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#EBF5FF", // Light blue background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB", // Matches input border
  },
  uploadImageButtonText: {
    color: "#007AFF", // Standard blue
    fontWeight: "600",
  },
  uploadedImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginVertical: 15,
    alignSelf: "center",
    resizeMode: "cover", // Cover the area
  },
  dialogButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  // Old styles that are not used or superseded:
  inputGroup: {},
  label: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 6,
    // fontFamily: "Montserrat", // Removed here as QuestionHeader uses it, not this specific input
  },
  input: {
    // Defined specific input styles above
  },
  help: {},
  socialContainer: {},
  socialLabel: {},
  iconRow: {},
  iconCircle: {},
  iconCircleActive: {},
});
