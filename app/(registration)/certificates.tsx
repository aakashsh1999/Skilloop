import ActionButton from "@/components/ActionButton"; // Custom button (for bottom of screen)
import PageHeader from "@/components/PageHeader"; // Top header bar
import QuestionHeader from "@/components/PageHeader/QuestionHeader";
import { useProfileStore } from "../../store/useProfileStore"; // Assuming correct path
import { formatDate } from "@/utils/dateUtils"; // Assuming this utility exists
import { useNavigation } from "@react-navigation/native"; // Assuming this is used for goBack
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  // Button, // REMOVE standard Button import
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, // Needed for upload indicator in modal if added
} from "react-native";

// Assuming your useProfileStore.ts is set up with 'id' for certificates
// and has addCertificate, removeCertificate, completeStep, setCurrentStep actions.
// And formatDate utility exists.

// --- Inline Custom Modal Button Component ---
// Reusing the Button component logic from the AuthPage example,
// but tailored for the modal's button styles.
interface ModalButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  isLoading?: boolean; // Added loading prop for modal buttons
}

const ModalButton: React.FC<ModalButtonProps> = ({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
  isLoading = false,
}) => {
  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isButtonDisabled}
      style={[
        modalButtonStyles.base,
        style,
        isButtonDisabled && modalButtonStyles.disabled,
      ]}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color="white" /> // Assuming white spinner on dark buttons
      ) : (
        <Text style={[modalButtonStyles.textBase, textStyle]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const modalButtonStyles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999, // Fully rounded
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    // Flex or fixed width will be applied by the specific style
  },
  textBase: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});
// --- End Inline Custom Modal Button Component ---

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
    issueDate: "", // Format: MM/YYYY
    imageUrl: "", // Base64 string for image display
    certificateUrl: "",
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false); // State for image upload loader

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

    setIsUploadingImage(true); // Start image upload loader
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true, // Request base64 data directly
        allowsEditing: true, // Allows user to crop/edit
        quality: 0.7, // Compress image quality
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
        selectionLimit: 1, // Limit to a single image
      });

      if (!result.canceled) {
        const selectedAsset =
          result.assets && result.assets.length > 0 ? result.assets[0] : null;

        if (selectedAsset && selectedAsset.base64) {
          // Determine MIME type (Expo provides it)
          const mimeType = selectedAsset.mimeType || "image/jpeg"; // Fallback

          setFormData({
            ...formData,
            imageUrl: `data:${mimeType};base64,${selectedAsset.base64}`, // Correct base64 Data URI
          });
          // No need for separate convertToBase64 if base64 is requested directly
        } else {
          Alert.alert("Image Error", "Failed to get image data.");
        }
      }
    } catch (error) {
      console.error("Image selection/processing error:", error);
      Alert.alert("Error", "Failed to select or process image.");
    } finally {
      setIsUploadingImage(false); // Stop image upload loader
    }
  };

  // Function to handle "Issue Date" input format (MM/YYYY)
  const handleDateChange = (text: string) => {
    // Remove non-digit characters
    let cleanedText = text.replace(/[^0-9]/g, "");

    // Add slash automatically
    if (cleanedText.length > 2 && cleanedText.indexOf("/") === -1) {
      cleanedText =
        cleanedText.substring(0, 2) + "/" + cleanedText.substring(2);
    }

    // Limit length to MM/YYYY format (7 characters)
    if (cleanedText.length > 7) {
      cleanedText = cleanedText.substring(0, 7);
    }

    // Optional: Basic validation (MM must be 01-12)
    const parts = cleanedText.split("/");
    if (parts.length > 1 && parts[0].length === 2) {
      const month = parseInt(parts[0], 10);
      if (month < 1 || month > 12) {
        // Invalid month, maybe show a hint or prevent input?
        // For now, just allow typing, validation can be done on save.
      }
    }

    setFormData({
      ...formData,
      issueDate: cleanedText,
    });
  };

  const handleAddCertificate = () => {
    if (!isDialogFormValid) {
      // This check is also on the button disabled state, but good to double-check
      Alert.alert(
        "Required Fields",
        "Please provide a certificate title and issuing organization."
      );
      return;
    }

    // Basic date format validation (optional, but good)
    const datePattern = /^(0[1-9]|1[0-2])\/(\d{4})$/; // MM/YYYY format
    if (formData.issueDate && !datePattern.test(formData.issueDate)) {
      Alert.alert(
        "Invalid Date",
        "Please enter the issue date in MM/YYYY format."
      );
      return;
    }

    addCertificate(formData); // `id` should be generated in the store's addCertificate
    // Reset form state
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
    setCurrentStep(5); // Move to step 5 (This step numbering seems off from the image upload step, double-check your flow)
    router.push("/(registration)/work-experience"); // Navigate to the next registration step
  };

  const handleBack = () => {
    // This custom onBack handler could navigate to the previous registration step
    router.back(); // Use router.back() for more dynamic navigation
  };

  const handleSkip = () => {
    completeStep(4); // Mark step 4 as complete even if skipped
    setCurrentStep(5); // Move to step 5
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
            {/* Use formatDate utility if it handles MM/YYYY */}
            {item.issueDate ? ` • ${item.issueDate}` : ""}{" "}
            {/* Display as is or use formatDate if needed */}
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
      {/* Assuming PageHeader handles step display logic */}
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

        {/* List of added certificates */}
        {profile.certificates && profile.certificates.length > 0 && (
          <FlatList
            data={profile.certificates}
            keyExtractor={(item) => item.id.toString()} // Use id as key
            renderItem={renderCertificateItem}
            contentContainerStyle={styles.certificatesList}
            scrollEnabled={false} // FlatList inside ScrollView should generally not scroll
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
            {/* Use ScrollView inside dialog for content if it might overflow */}
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <Text style={styles.dialogTitle}>Add certificate</Text>
              {/* Certificate Title Input */}
              <Text style={styles.inputLabel}>Certificate Title</Text>{" "}
              {/* Label */}
              <TextInput
                placeholder="Eg., AWS Certified Developer" // Placeholder
                value={formData.title}
                onChangeText={(text) => handleChange("title", text)}
                style={styles.dialogInput}
                placeholderTextColor="#9CA3AF" // Match image placeholder color
              />
              {/* Issuing Organization Input */}
              <Text style={styles.inputLabel}>Issuing Organization</Text>{" "}
              {/* Label */}
              <TextInput
                placeholder="Eg., Amazon Web Services" // Placeholder
                value={formData.organization}
                onChangeText={(text) => handleChange("organization", text)}
                style={styles.dialogInput}
                placeholderTextColor="#9CA3AF" // Match image placeholder color
              />
              {/* Issue Date Input */}
              <Text style={styles.inputLabel}>Issuing Date</Text> {/* Label */}
              <TextInput
                placeholder="MM/YYYY" // Placeholder from image
                value={formData.issueDate}
                onChangeText={handleDateChange} // Use the custom date handler
                style={styles.dialogInput}
                keyboardType="numbers-and-punctuation" // Allows numbers and slash
                maxLength={7} // Limit to MM/YYYY
                placeholderTextColor="#9CA3AF" // Match image placeholder color
              />
              {/* Upload Image Button */}
              <Text style={styles.inputLabel}>Upload Image</Text> {/* Label */}
              <TouchableOpacity
                onPress={handleImageChange}
                style={styles.uploadImageButton} // Styled button
                disabled={isUploadingImage} // Disable while uploading
              >
                {isUploadingImage ? (
                  <ActivityIndicator color="#6B7280" /> // Spinner matching text color
                ) : (
                  <Text style={styles.uploadImageButtonText}>
                    + upload from device
                  </Text> // Styled text from image
                )}
              </TouchableOpacity>
              {/* Image Preview */}
              {formData.imageUrl ? (
                <Image
                  source={{ uri: formData.imageUrl }}
                  style={styles.uploadedImagePreview}
                />
              ) : null}
              {/* Certificate URL Input */}
              <Text style={styles.inputLabel}>Certificate url</Text>{" "}
              {/* Label */}
              <TextInput
                placeholder="www.url.com" // Placeholder
                value={formData.certificateUrl}
                onChangeText={(text) => handleChange("certificateUrl", text)}
                style={styles.dialogInput}
                keyboardType="url" // Appropriate keyboard
                autoCapitalize="none" // URLs are case-insensitive
                placeholderTextColor="#9CA3AF" // Match image placeholder color
              />
              {/* Hint text below URL input */}
              <Text style={styles.hintText}>to cross verify certificate</Text>
              {/* Dialog Buttons (Cancel and Save) */}
              <View style={styles.dialogButtons}>
                {/* Cancel Button */}
                <ModalButton
                  onPress={() => setIsDialogOpen(false)}
                  style={styles.cancelButton}
                  textStyle={styles.cancelButtonText}
                >
                  Cancel
                </ModalButton>
                {/* Save Button */}
                <ModalButton
                  onPress={handleAddCertificate}
                  style={styles.saveButton}
                  textStyle={styles.saveButtonText}
                  disabled={!isDialogFormValid} // Disabled state based on required fields
                  // isLoading state could be added here if saving certificate takes time
                >
                  Save
                </ModalButton>
              </View>
            </ScrollView>
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
    flexGrow: 1, // Allows content to expand
    paddingHorizontal: 20,
    backgroundColor: "white",
    paddingBottom: 40, // Ensure space for action button at bottom
  },
  addCertificateButton: {
    marginVertical: 20, // Adjusted vertical margin
    alignSelf: "center",
    width: "90%",
    borderColor: "#D1D5DB", // Match input border color
    borderWidth: 1, // Solid border, image shows dashed, but dashed might be hard to match exactly
    borderStyle: "dashed", // Keeping dashed as in image
    borderRadius: 8, // Rounded corners from image
    padding: 20, // Adjusted padding
    alignItems: "center",
    backgroundColor: "#F9FAFB", // Light background from inputs
  },
  addCertificateButtonText: {
    color: "#6B7280", // Gray color
    fontSize: 16,
    fontWeight: "500",
  },
  certificatesList: {
    paddingBottom: 20,
  },
  certificateItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  certificateDetails: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginRight: 10,
  },
  certificateImage: {
    width: 50,
    height: 50,
    borderRadius: 4, // Slightly less rounded than circle
    marginRight: 10,
    backgroundColor: "#DCDCDC",
    resizeMode: "cover", // Ensure image covers the area
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
    backgroundColor: "#FF6347",
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  skipButton: {
    backgroundColor: "#E5E7EB", // Light gray from image
    borderColor: "#D1D5DB", // Border color
    marginTop: 30, // Space above Skip button
    // textStyle should be black for this button
  },
  skipButtonText: {
    color: "black", // Black text for skip button
  },

  // Dialog (Modal) Styles
  dialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, // Padding on the sides of the overlay
    zIndex: 1000,
  },
  dialogContainer: {
    backgroundColor: "white",
    padding: 20, // Inner padding inside the dialog container
    borderRadius: 12,
    width: "100%", // Take full width minus overlay padding
    // maxHeight: "85%", // Allow ScrollView inside to manage height
    // Added a fixed height or calculated height might be needed depending on screen size
    // Let's add a maxHeight to prevent it from taking up the whole screen
    maxHeight: "80%", // Adjust as needed
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 }, // Reduced shadow
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5, // Reduced elevation
      },
    }),
  },
  dialogContent: {
    // Padding inside the ScrollView if needed
    paddingBottom: 20, // Space at the bottom of scrollable content
  },
  dialogTitle: {
    fontSize: 20, // Adjusted font size to match image
    fontWeight: "bold",
    marginBottom: 15, // Adjusted space
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14, // Smaller font size for labels
    fontWeight: "500", // Medium weight
    color: "#4B5563", // Gray-600 color
    marginBottom: 8, // Space below label
    marginTop: 5, // Space above label from previous element
  },
  dialogInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB", // Border color
    borderRadius: 8, // Rounded input corners
    paddingHorizontal: 12, // Inner horizontal padding
    paddingVertical: Platform.OS === "ios" ? 12 : 10, // Inner vertical padding
    fontSize: 16,
    backgroundColor: "#F9FAFB", // Light gray background
    color: "#1F2937", // Dark text color
    marginBottom: 15, // Space below input field
  },
  uploadImageButton: {
    marginVertical: 10, // Space around
    paddingVertical: 12, // Inner vertical padding
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white", // White background as in image
    borderRadius: 8, // Rounded corners
    borderWidth: 1,
    borderStyle: "dashed", // Dashed border
    borderColor: "#D1D5DB", // Border color
  },
  uploadImageButtonText: {
    color: "#6B7280", // Gray text color from image
    fontWeight: "600",
    fontSize: 16, // Match input font size
  },
  uploadedImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8, // Match input/button border radius
    marginVertical: 15,
    alignSelf: "center",
    resizeMode: "cover",
  },
  hintText: {
    fontSize: 11, // Smaller font for hint
    color: "#6B7280", // Gray text
    textAlign: "right", // Align to the right as in image
    marginTop: -12, // Pull up slightly closer to the input field
    marginBottom: 15, // Space before buttons
    paddingRight: 5, // Small padding for alignment
  },
  dialogButtons: {
    flexDirection: "row",
    justifyContent: "flex-end", // Align buttons to the right
    marginTop: 10, // Space above buttons
    // Use margin or gap between buttons below
  },
  // Custom styles for the specific modal buttons
  cancelButton: {
    // Override base styles
    width: 100, // Example fixed width based on image appearance
    marginRight: 8, // Space between buttons
    backgroundColor: "#E5E7EB", // Light gray background from image (matches skip button)
    borderColor: "#D1D5DB", // Matches border color
    borderRadius: 999, // Keep fully rounded
  },
  cancelButtonText: {
    color: "black", // Black text
    fontSize: 16, // Match size
  },
  saveButton: {
    // Override base styles
    width: 100, // Example fixed width
    backgroundColor: "black", // Black background from image
    borderColor: "black", // Black border
    borderRadius: 999, // Keep fully rounded
  },
  saveButtonText: {
    color: "white", // White text
    fontSize: 16, // Match size
  },
});
