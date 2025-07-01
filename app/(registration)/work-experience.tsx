import ActionButton from "@/components/ActionButton";
import AddItemButton from "@/components/AddItemButton";
import ItemCard from "@/components/ItemCard"; // Assuming this component exists
import PageHeader from "@/components/PageHeader"; // Top header bar
import { useToast } from "@/hooks/useToast"; // Assuming this hook exists
import { useProfileStore } from "@/store/useProfileStore"; // Assuming correct path
import { formatDate, formatDateForDisplay } from "@/utils/dateUtils"; // Assuming these utilities exist
import { useNavigation } from "@react-navigation/native"; // Assuming this is used for goBack
import { useRouter } from "expo-router";
import React, { use, useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform, // Import Platform for styles
  Alert, // Import Alert
} from "react-native";
import { API_BASE_URL } from "@/env"; // Assuming this exists
import QuestionHeader from "@/components/PageHeader/QuestionHeader"; // Assuming this exists
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT: MAKE SURE API_BASE_URL IS CORRECTLY SET IN YOUR env FILE.
// Ngrok free tunnels change frequently.

// --- Inline Custom Modal Button Component (Copied from Certificate Screen) ---
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
        // Choose spinner color based on button background
        <ActivityIndicator
          color={style?.backgroundColor === "black" ? "white" : "black"}
        />
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

const WorkExperienceScreen = () => {
  const navigation = useNavigation();
  const { toast } = useToast();
  const {
    profile,
    addWorkExperience,
    removeWorkExperience,
    setCurrentStep,
    completeStep,
    resetProfile, // Assuming you have this action
  } = useProfileStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setIsLoading] = useState(false); // Changed to 'loading' for clarity
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    startDate: "", // Format: MM/YYYY
    endDate: "", // Format: MM/YYYY
    currentlyWorking: false,
  });
  const [email, setEmail] = useState("");
  const [isGoogle, setIsGoogle] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getEmail = async () => {
      const mail = await AsyncStorage.getItem("gmail_user");
      if (mail) {
        const user = JSON.parse(mail);
        setEmail(user.email);
      }
    };
    getEmail();
  }, []);
  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCurrentlyWorkingChange = (value: boolean) => {
    setFormData({
      ...formData,
      currentlyWorking: value,
      endDate: value ? "" : formData.endDate, // Clear end date if currently working
    });
  };

  // Reused date handling logic from Certificate screen
  const handleDateChange = (field: "startDate" | "endDate", text: string) => {
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

    setFormData({
      ...formData,
      [field]: cleanedText,
    });
  };

  useEffect(() => {
    async function getGoogleUser() {
      const data = await AsyncStorage.getItem("gmail_user");
      if (data) {
        const user = JSON.parse(data);
        setIsGoogle(user);
      }
    }
    getGoogleUser();
  }, []);

  const handleAddExperience = () => {
    // Basic validation for required fields
    if (!formData.company || !formData.position || !formData.startDate) {
      Alert.alert(
        "Missing Information",
        "Company, Position, and Start Date are required."
      );
      return;
    }

    // Basic date format validation (MM/YYYY)
    const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dateRegex.test(formData.startDate)) {
      Alert.alert(
        "Invalid Start Date",
        "Please use MM/YYYY format (e.g., 01/2023)."
      );
      return;
    }
    if (
      !formData.currentlyWorking &&
      formData.endDate && // Only validate if end date is provided
      !dateRegex.test(formData.endDate)
    ) {
      Alert.alert(
        "Invalid End Date",
        "Please use MM/YYYY format for End Date (e.g., 12/2024)."
      );
      return;
    }

    // Check if end date is required but missing
    if (!formData.currentlyWorking && !formData.endDate) {
      Alert.alert(
        "End Date Required",
        'Please provide an end date or select "I currently work here".'
      );
      return;
    }

    addWorkExperience({
      // Generate a unique ID for the experience (simple timestamp + random for uniqueness)
      id: `${Date.now()}-${Math.random()}`,
      company: formData.company,
      position: formData.position,
      startDate: formData.startDate, // Store as MM/YYYY string
      endDate: formData.currentlyWorking ? undefined : formData.endDate, // Store as MM/YYYY string or undefined
      currentlyWorking: formData.currentlyWorking,
      // Note: logo field is in ItemCard but not collected in this form.
      // You'd need to add image upload logic similar to certificates if needed.
      logo: undefined, // Or collect logo if required
    });

    // Reset form state
    setFormData({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
    });
    setIsDialogOpen(false);

    toast({
      title: "Experience added",
      description: "Your work experience has been successfully added.",
    });
  };

  const handleRemoveExperience = (id: string) => {
    Alert.alert(
      "Remove Experience",
      "Are you sure you want to remove this work experience entry?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => removeWorkExperience(id),
          style: "destructive",
        },
      ]
    );
  };

  let mobileNumber;
  if (profile.basicInfo && profile.basicInfo.mobile) {
    mobileNumber = profile.basicInfo.mobile;
  } else {
    // WARNING: This is for temporary testing only!
    // It is not suitable for a production database due to collision risk.
    // It violates the `unique` constraint in your Prisma schema.
    mobileNumber = "9" + Math.floor(Math.random() * 9000000000) + ""; // Generates a random 10-digit number starting with '9'
    console.warn(
      "Using a random number as a fallback for mobile_number. This is not recommended for production."
    );
  }

  const sendProfileDataToBackend = async (data: any) => {
    // console.log("Attempting to send data:", data?.mobile_number || data?.name);
    setIsLoading(true); // Start loading for the API call

    // console.log(data);
    try {
      const fullUrl = `${API_BASE_URL}/api/auth/register`; // Confirm this is the correct endpoint
      console.log("Sending profile data to URL:", fullUrl);

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json(); // Always try to parse JSON for both success and error

      if (!response.ok) {
        // Handle non-200 responses
        // console.error("Backend error:", response.status, responseData);
        const errorMessage =
          responseData.error ||
          responseData.message ||
          "Failed to save profile on backend.";
        throw new Error(errorMessage); // Throw to be caught by catch block
      }

      // Success case
      await AsyncStorage.removeItem("gmail_user");
      console.log("Backend Success Response Data:", responseData);

      toast({
        title: "Profile Saved!",
        description: "Your full profile has been successfully registered.",
        // @ts-ignore
        variant: "success",
      });

      // Reset profile store to initial state *after* successful submission
      // Ensure resetProfile exists and does what you expect
      // resetProfile(); // Call this if you want to clear the form/store after submission

      resetProfile();
      // Navigate to the next screen after successful API call
      router.replace("/(registration)/profile-complete"); // Navigate to confirmation/success screen
    } catch (error: any) {
      console.error("API call failed:", error);
      resetProfile();
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        // @ts-ignore
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleContinue = async () => {
    // Before completing step and navigating, send the collected profile data
    // This assumes work experience is the final step before submitting the full profile.
    // Adjust this logic based on your actual registration flow steps.

    // Ensure mandatory info exists before sending
    // This check might be redundant if previous steps enforced it, but good failsafe
    const basicInfo = profile.basicInfo;
    if (!basicInfo || (!basicInfo.mobile && !isGoogle.isGoogle)) {
      Alert.alert("Missing Info", "Basic information is incomplete.");
      return;
    }

    console.log(profile.basicInfo, "sdfsdfsdf");
    const dataToSend = {
      // Ensure these keys match your backend's expected structure and your Prisma schema
      mobile_number: mobileNumber, // Use mobile from basicInfo
      user_type: profile.userType || "Unknown",
      name: basicInfo.fullName || "Unknown Name", // Use fullName from basicInfo
      gender: basicInfo.gender || "Not Specified",
      email: email || "",
      age: basicInfo.age ? parseInt(basicInfo.age, 10) : 0,
      location: basicInfo.location || "Unknown Location",

      // Location coordinates might be nested or optional
      latitude: profile.basicInfo?.latitude
        ? parseFloat(profile.basicInfo.latitude)
        : null,
      longitude: profile.basicInfo?.longitude
        ? parseFloat(profile.basicInfo.longitude)
        : null,

      // Profile images (check if they exist and extract URLs)
      // Assuming profileImages in store are Data URIs or temporary URLs
      // You will likely need to upload these to Supabase Storage *before* sending to backend
      // and send the *Storage URLs* instead of Data URIs.
      // For now, sending Data URIs as placeholders, but backend must handle large strings or reject.
      profile_image:
        profile.profileImages?.find((img) => img.type === "face")?.url || "",
      face:
        profile.profileImages?.find((img) => img.type === "face")?.url || null,
      anything_but_professional:
        profile.profileImages?.find((img) => img.type === "professional")
          ?.url || null,
      // Assuming this is the 'skill' type image
      skill_image:
        profile.profileImages?.find((img) => img.type === "skill")?.url || null,

      skills: profile.skills || [], // Assuming skills are stored as an array/JSON

      skill_type: profile.skillType || "Unknown", // Matches prisma schema

      short_bio: profile.shortBio || "No bio provided.",

      // Business Card/Social Profiles (ensure structure matches backend/prisma)
      business_card: {
        role: profile.businessCard?.role || null,
        company: profile.businessCard?.company || null,
        portfolio: profile.businessCard?.portfolio || null,
        socialProfiles: profile.businessCard?.socialProfiles || [], // Array of { id: string, value: string }
      },

      // Certificates (ensure structure matches backend/prisma)
      // Certificates in store likely have { id, title, organization, issueDate, imageUrl, certificateUrl }
      // Backend might expect a different structure. If imageUrl is Data URI, backend might reject.
      certificates:
        profile.certificates?.map((cert) => ({
          // Map to potentially match backend schema
          title: cert.title,
          organization: cert.organization,
          issueDate: cert.issueDate, // MM/YYYY string
          imageUrl: cert.imageUrl, // Data URI (needs backend handling or prior upload)
          certificateUrl: cert.certificateUrl,
          // id might not be needed by backend for creating the profile
        })) || [],

      // Work Experience (ensure structure matches backend/prisma)
      // Work experience in store likely has { id, company, position, startDate, endDate, currentlyWorking }
      work_experience:
        profile.workExperience?.map((exp) => ({
          // Map to potentially match backend schema
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate, // MM/YYYY string
          endDate: exp.currentlyWorking ? null : exp.endDate, // MM/YYYY string or null
          currentlyWorking: exp.currentlyWorking,
          // id not needed by backend for creating the profile
        })) || [],

      // Add other fields from your Prisma schema if they are collected elsewhere
      avatar: profile.avatar || null, // Assuming you collect this
      status: profile.status || null, // Assuming you collect this
      expoPushToken: profile.expoPushToken || null, // Assuming you collect this
    };

    // console.log(
    //   "Sending final profile data structure:",
    //   JSON.stringify(dataToSend, null, 2)
    // );

    await sendProfileDataToBackend(dataToSend);

    // Navigation happens after the API call is successful inside sendProfileDataToBackend
    // completeStep(5); // Only complete step if the API call is successful
    // setCurrentStep(6); // Only set step if API call is successful
  };

  const handleBack = () => {
    router.back(); // Use router.back() for more dynamic navigation
  };

  const handleSkip = async () => {
    // This also completes the step and sends the data, just with potentially empty work_experience
    // Need to send all *other* collected data even if work experience is skipped.
    const basicInfo = profile.basicInfo;
    if (!basicInfo || (!basicInfo.mobile && !isGoogle.isGoogle)) {
      Alert.alert("Missing Info", "Basic information is incomplete.");
      return;
    }

    const dataToSend = {
      mobile_number: mobileNumber, // Use mobile from basicInfo
      user_type: profile.userType || "Unknown",
      email: email || "",
      name: basicInfo.fullName || "Unknown Name",
      gender: basicInfo.gender || "Not Specified",
      age: basicInfo.age ? parseInt(basicInfo.age, 10) : 0,
      location: basicInfo.location || "Unknown Location",

      // Location coordinates might be nested or optional
      latitude: profile.basicInfo?.latitude
        ? parseFloat(profile.basicInfo.latitude)
        : null,
      longitude: profile.basicInfo?.longitude
        ? parseFloat(profile.basicInfo.longitude)
        : null,

      profile_image:
        profile.profileImages?.find((img) => img.type === "face")?.url || "",
      face:
        profile.profileImages?.find((img) => img.type === "face")?.url || null,
      anything_but_professional:
        profile.profileImages?.find((img) => img.type === "professional")
          ?.url || null,
      skill_image:
        profile.profileImages?.find((img) => img.type === "skill")?.url || null,

      skills: profile.skills || [],

      skill_type: profile.skillType || "Unknown",

      short_bio: profile.shortBio || "No bio provided.",

      business_card: {
        role: profile.businessCard?.role || null,
        company: profile.businessCard?.company || null,
        portfolio: profile.businessCard?.portfolio || null,
        socialProfiles: profile.businessCard?.socialProfiles || [],
      },

      certificates:
        profile.certificates?.map((cert) => ({
          // Map to potentially match backend schema
          title: cert.title,
          organization: cert.organization,
          issueDate: cert.issueDate,
          imageUrl: cert.imageUrl,
          certificateUrl: cert.certificateUrl,
        })) || [],

      work_experience: [], // Empty array as work experience is skipped

      avatar: profile.avatar || null,
      status: profile.status || null,
      expoPushToken: profile.expoPushToken || null,
    };

    // console.log(
    //   "Sending profile data structure after Skip:",
    //   JSON.stringify(dataToSend, null, 2)
    // );

    await sendProfileDataToBackend(dataToSend);

    // Navigation happens after successful API call
    // completeStep(5); // Only complete step if API call is successful
    // setCurrentStep(6); // Only set step if API call is successful
  };

  // Determine if Save button in dialog should be disabled
  const isDialogSaveDisabled =
    !formData.company.trim() ||
    !formData.position.trim() ||
    !formData.startDate.trim();

  return (
    <ScrollView contentContainerStyle={appStyles.fullScreenContainer}>
      {" "}
      {/* Use appStyles.fullScreenContainer */}
      <PageHeader
        // title="Work Experience" // Title handled by QuestionHeader
        // subtitle="Add your professional experience to highlight your career path" // Subtitle handled by QuestionHeader
        currentStep={6} // Assuming step 6
        totalSteps={6} // Assuming total 6 steps
        onBack={handleBack}
      />
      {/* QuestionHeader might be inside the ScrollView if it scrolls with content */}
      <View style={styles.contentContainer}>
        {" "}
        {/* Inner container for padding */}
        <QuestionHeader
          title="Work Experience"
          subtitle="Add your professional experience to highlight your career path"
        />
        {profile.workExperience.length > 0 && (
          <View style={styles.listContainer}>
            {profile.workExperience.map((experience) => (
              <ItemCard
                key={experience.id} // Use the generated unique ID
                // logo={experience.logo || undefined} // Needs to be added to form data if used
                // logoPlaceholder={experience.company ? experience.company[0] : ""} // Placeholder if no logo
                title={experience.position}
                subtitle={`${experience.company} • ${formatDateForDisplay(
                  experience.startDate
                )} - ${
                  experience.currentlyWorking
                    ? "Present"
                    : formatDateForDisplay(experience.endDate || "")
                }`}
                onRemove={() => handleRemoveExperience(experience.id)}
              />
            ))}
          </View>
        )}
        <AddItemButton
          onPress={() => setIsDialogOpen(true)}
          label="Add Experience"
          style={styles.addButton}
        />
      </View>{" "}
      {/* End contentContainer */}
      {/* Action buttons at the bottom - they should probably be outside the ScrollView */}
      <View style={appStyles.actionButtonContainer}>
        {" "}
        {/* Container for action buttons */}
        {profile.workExperience.length > 0 ? (
          <ActionButton onPress={handleContinue} fullWidth disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : "Continue"}
          </ActionButton>
        ) : (
          <ActionButton
            onPress={handleSkip}
            variant="outline" // Use outline variant for Skip
            fullWidth
            style={styles.skipButton} // Apply custom skip button style
            textStyle={styles.skipButtonText} // Apply custom skip text style
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : "Skip for now"}
          </ActionButton>
        )}
      </View>{" "}
      {/* End actionButtonContainer */}
      {/* Modal for Add Experience */}
      <Modal
        visible={isDialogOpen}
        animationType="fade" // Use fade or slide as preferred
        transparent={true} // Make background transparent
        onRequestClose={() => setIsDialogOpen(false)}
      >
        {/* Dialog Overlay */}
        <View style={styles.dialogOverlay}>
          {/* Dialog Container */}
          <View style={styles.dialogContainer}>
            {/* ScrollView for dialog content */}
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <Text style={styles.dialogTitle}>Add Experience</Text>
              {/* Company Input */}
              <Text style={styles.inputLabel}>Company</Text> {/* Label */}
              <TextInput
                placeholder="Company Name" // Placeholder
                style={styles.dialogInput} // Use dialogInput style
                value={formData.company}
                onChangeText={(text) => handleChange("company", text)}
                autoCapitalize="words"
                placeholderTextColor="#9CA3AF"
              />
              {/* Position Input */}
              <Text style={styles.inputLabel}>Position</Text> {/* Label */}
              <TextInput
                placeholder="Position Title" // Placeholder
                style={styles.dialogInput} // Use dialogInput style
                value={formData.position}
                onChangeText={(text) => handleChange("position", text)}
                autoCapitalize="words"
                placeholderTextColor="#9CA3AF"
              />
              {/* Start Date Input */}
              <Text style={styles.inputLabel}>Start Date</Text> {/* Label */}
              <TextInput
                placeholder="MM/YYYY" // Placeholder
                style={styles.dialogInput} // Use dialogInput style
                value={formData.startDate}
                onChangeText={(text) => handleDateChange("startDate", text)} // Use date handler
                keyboardType="numbers-and-punctuation" // Allow numbers and slash
                maxLength={7}
                placeholderTextColor="#9CA3AF"
              />
              {/* Currently Working Switch */}
              {/* Styled to match the modal form layout */}
              <View style={styles.switchRowModal}>
                <Switch
                  value={formData.currentlyWorking}
                  onValueChange={handleCurrentlyWorkingChange}
                  trackColor={{ false: "#767577", true: "#F5D0B5" }} // Custom colors
                  thumbColor={formData.currentlyWorking ? "#f4f3f4" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                />
                <Text style={styles.switchLabel}>I currently work here</Text>{" "}
                {/* Label for the switch */}
              </View>
              {/* End Date Input (Conditional) */}
              {!formData.currentlyWorking && (
                <>
                  <Text style={styles.inputLabel}>End Date</Text> {/* Label */}
                  <TextInput
                    placeholder="MM/YYYY" // Placeholder
                    style={styles.dialogInput} // Use dialogInput style
                    value={formData.endDate}
                    onChangeText={(text) => handleDateChange("endDate", text)} // Use date handler
                    keyboardType="numbers-and-punctuation" // Allow numbers and slash
                    maxLength={7}
                    placeholderTextColor="#9CA3AF"
                  />
                </>
              )}
              {/* Hint text (not needed for this modal, but keep the style if reused) */}
              {/* <Text style={styles.hintText}>Optional hint text here</Text> */}
              {/* Dialog Buttons (Cancel and Save) */}
              <View style={styles.dialogButtons}>
                {" "}
                {/* Use dialogButtons style */}
                {/* Cancel Button */}
                <ModalButton
                  onPress={() => setIsDialogOpen(false)}
                  style={styles.cancelButton} // Use cancel button style
                  textStyle={styles.cancelButtonText} // Use cancel button text style
                  disabled={loading}
                >
                  Cancel
                </ModalButton>
                {/* Save Button */}
                <ModalButton
                  onPress={handleAddExperience}
                  style={styles.saveButton} // Use save button style
                  textStyle={styles.saveButtonText} // Use save button text style
                  disabled={isDialogSaveDisabled || loading} // Disable if form invalid OR overall loading
                >
                  Save
                </ModalButton>
              </View>
            </ScrollView>{" "}
            {/* End ScrollView */}
          </View>{" "}
          {/* End dialogContainer */}
        </View>{" "}
        {/* End dialogOverlay */}
      </Modal>
    </ScrollView>
  );
};

const appStyles = StyleSheet.create({
  fullScreenContainer: {
    flexGrow: 1, // Use flexGrow for ScrollView content container
    backgroundColor: "white",
  },
  actionButtonContainer: {
    paddingHorizontal: 16, // Add padding
    paddingVertical: 10, // Add padding
    backgroundColor: "white", // Ensure background is white
    borderTopWidth: 1, // Optional: add a border top
    borderColor: "#eee", // Border color
  },
});

const styles = StyleSheet.create({
  container: {
    // This container is no longer needed as padding is on contentContainer
    // padding: 16,
    // flex: 1, // This would conflict with ScrollView flexGrow
    // backgroundColor: "#fff", // Background handled by appStyles
  },
  contentContainer: {
    paddingHorizontal: 20, // Match certificate screen padding
    paddingVertical: 24, // Match certificate screen padding
    backgroundColor: "white",
    // paddingBottom added by actionButtonContainer margin/padding
  },
  listContainer: {
    marginBottom: 24,
  },
  addButton: {
    marginBottom: 24,
  },
  // --- Modal Styles (Copied/Adapted from Certificate Screen) ---
  dialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", // Dark overlay
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
    maxHeight: "80%", // Max height for scrollable content
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  dialogContent: {
    // Padding inside the ScrollView if needed
    paddingBottom: 10, // Small padding at the bottom of scrollable content
  },
  dialogTitle: {
    fontSize: 20, // Adjusted font size to match certificate modal
    fontWeight: "bold",
    marginBottom: 15, // Adjusted space
    textAlign: "center",
  },
  inputLabel: {
    // Label style for inputs
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
    marginTop: 5,
  },
  dialogInput: {
    // Input field style
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 16,
    backgroundColor: "#F9FAFB", // Light gray background
    color: "#1F2937", // Dark text color
    marginBottom: 15,
  },
  hintText: {
    // Style for hint text
    fontSize: 11,
    color: "#6B7280",
    textAlign: "right",
    marginTop: -12,
    marginBottom: 15,
    paddingRight: 5,
  },
  dialogButtons: {
    // Container for modal action buttons
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 8, // Space between buttons using gap (RN 0.71+) or margin
  },
  // Custom styles for the specific modal buttons
  cancelButton: {
    width: 100, // Example fixed width
    backgroundColor: "#E5E7EB", // Light gray
    borderColor: "#D1D5DB", // Border color
    borderRadius: 999, // Fully rounded
  },
  cancelButtonText: {
    color: "black", // Black text
    fontSize: 16,
  },
  saveButton: {
    width: 100, // Example fixed width
    backgroundColor: "black", // Black
    borderColor: "black", // Black border
    borderRadius: 999, // Fully rounded
  },
  saveButtonText: {
    color: "white", // White text
    fontSize: 16,
  },
  // --- End Modal Styles ---

  // Styles specifically for the Switch row within the modal form
  switchRowModal: {
    flexDirection: "row",
    alignItems: "center",
    // gap: 8, // Use gap if RN version supports it, otherwise margin
    marginBottom: 15, // Space below switch row
    marginTop: 5, // Space above switch row
  },
  switchLabel: {
    fontSize: 16, // Match input font size
    color: "#1F2937", // Match input text color
    marginLeft: 8, // Space between switch and text if gap isn't used
  },

  skipButton: {
    // Custom style for the skip button, making it distinct from "Continue"
    backgroundColor: "#E5E7EB", // Light gray from image
    borderColor: "#D1D5DB", // Border color
    marginTop: 30, // Space above Skip button
    // textStyle should be black for this button
  },
  skipButtonText: {
    color: "black", // Black text for skip button
  },
});

export default WorkExperienceScreen;
