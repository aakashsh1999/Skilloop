// ProfileImages.tsx (This is the file name from your previous context, assuming you're editing the same file)
import React, { useState, useCallback } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import ActionButton from "@/components/ActionButton";
import PageHeader from "@/components/PageHeader";
import QuestionHeader from "@/components/PageHeader/QuestionHeader";
import { useProfileStore } from "@/store/useProfileStore"; // Assuming correct path and updated store
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location"; // Import expo-location

const BasicInformation: React.FC = () => {
  // Assuming your useProfileStore has a structure like:
  // profile: { basicInfo: { fullName, age, gender, location, mobile } }
  // and updateBasicInfo takes an object like { fullName, age, gender, location, mobile }
  // Note: We will *not* be storing latitude/longitude in the profile.basicInfo state now.
  const { profile, updateBasicInfo, setCurrentStep, completeStep } =
    useProfileStore();
  const { mobile } = useLocalSearchParams(); // Assuming mobile might come from route params during initial signup flow
  const [coords, setCoords] = useState<any>(null); // State to store coordinates if needed elsewhere

  // Get mobile from store if available, otherwise use route param
  const initialMobile =
    profile.basicInfo?.mobile || (typeof mobile === "string" ? mobile : "");

  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: profile.basicInfo?.fullName || "", // Use optional chaining for safety
    age: profile.basicInfo?.age || "",
    gender: profile.basicInfo?.gender || "",
    location: profile.basicInfo?.location || "", // Store the address string here
    mobile: initialMobile, // Keep mobile in local state initially if needed elsewhere, but won't display/save it in this form flow
  });

  const [showGenderModal, setShowGenderModal] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false); // State for location loading

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Non-binary", value: "non-binary" },
    { label: "Other", value: "other" },
    { label: "Prefer not to say", value: "prefer-not-to-say" },
  ];

  // Check if mandatory fields are filled
  // Note: Mobile is NOT included in validation as it's not part of this form's required inputs
  const isFormValid =
    formData.fullName.trim() !== "" &&
    formData.age.trim() !== "" &&
    formData.gender.trim() !== "" &&
    formData.location.trim() !== ""; // Location *name* is still mandatory per your validation

  const handleChange = useCallback((name: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  // --- Modified function to get current location and geocode to address string ---
  const handleGetLocation = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingLocation) return;
    setIsFetchingLocation(true);
    try {
      // 1. Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied. Please enable it in your device settings."
        );
        return;
      }

      // 2. Get current position
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // High or Balanced depending on need
        timeout: 15000, // Increased timeout slightly
      });
      setCoords(location?.coords);

      console.log("Fetched location coordinates:", location.coords);

      // 3. Perform Reverse Geocoding
      const geocodeResult = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      console.log("Reverse geocode result:", geocodeResult);

      // 4. Extract and format the address string
      let addressString = "";
      if (geocodeResult && geocodeResult.length > 0) {
        const address = geocodeResult[0]; // Get the first result
        // Build a location string, prioritize city/district, then region/state, then country
        const parts = [];
        if (address.city) parts.push(address.city);
        else if (address.district) parts.push(address.district);

        if (
          address.region &&
          address.region !== address.city &&
          address.region !== address.district
        )
          parts.push(address.region); // Avoid repeating city/district if they are also the region

        if (address.country) parts.push(address.country);

        // Fallback to state/county/subregion if more common location info is missing
        if (parts.length === 0) {
          if (address.subregion) parts.push(address.subregion);
          if (address.county) parts.push(address.county);
          if (address.country) parts.push(address.country); // Ensure country is included if others are used
        }

        addressString = parts.join(", ");

        // If no address parts were found, use raw coordinates as a fallback display
        if (!addressString) {
          addressString = `Lat: ${location.coords.latitude.toFixed(
            4
          )}, Lon: ${location.coords.longitude.toFixed(4)}`;
          console.warn(
            "Could not geocode to a standard address string, using coordinates."
          );
        }
      } else {
        // If geocoding returns no results
        addressString = `Lat: ${location.coords.latitude.toFixed(
          4
        )}, Lon: ${location.coords.longitude.toFixed(4)}`; // Fallback to coordinates display
        console.warn("Reverse geocode returned no results, using coordinates.");
      }

      // 5. Update form data with the address string in the 'location' field
      setFormData((prevData) => ({
        ...prevData,
        location: addressString,
      }));

      // Optional: Provide feedback to the user
      Alert.alert("Location Captured", `Location set to: ${addressString}`);
    } catch (error: any) {
      console.error("Error fetching or geocoding location:", error);
      const errorMessage = error.message || "Failed to get location.";
      Alert.alert("Location Error", errorMessage);
      // Optionally clear location text if fetching fails after it was previously set
      // setFormData(prevData => ({ ...prevData, location: '' }));
    } finally {
      setIsFetchingLocation(false); // Stop loading
    }
  };
  // --- End handleGetLocation ---

  const handleContinue = () => {
    if (!isFormValid) {
      Alert.alert("Missing Information", "Please fill all mandatory fields.");
      return;
    }

    // Prepare data to update the store
    const dataToSave = {
      fullName: formData.fullName,
      age: formData.age,
      gender: formData.gender,
      location: formData.location, // Only save the address string
      // If you need to save coords, you'll need to adjust the store's updateBasicInfo signature
      // For now, we assume only the address string is stored in basicInfo.location
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      mobile: formData.mobile, // Pass mobile from state (initially from route param or store)
    };

    // Update the store with the formData
    updateBasicInfo(dataToSave);
    completeStep(2); // Mark this step complete
    setCurrentStep(3); // Move to the next step
    router.push("/(registration)/profile-images"); // Navigate to the next screen
  };

  const handleBack = () => {
    router.back(); // Use router.back() for dynamic back navigation
  };

  return (
    <View style={appStyles.fullScreenContainer}>
      <PageHeader currentStep={2} totalSteps={6} onBack={handleBack} />{" "}
      {/* Update totalSteps if needed */}
      <QuestionHeader
        title="Basic Information"
        subtitle="Tell us a bit about yourself"
      />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Full Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Full name<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Elon Musk"
            value={formData.fullName}
            onChangeText={(text) => handleChange("fullName", text)}
            returnKeyType="next"
            autoCapitalize="words"
          />
        </View>

        {/* Age */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Age<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="21"
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9]/g, "");
              handleChange("age", numericText);
            }}
            maxLength={3}
            returnKeyType="next"
          />
        </View>

        {/* Gender Input & Modal */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Gender<Text style={styles.required}>*</Text>
          </Text>
          <Pressable
            style={[styles.input, { justifyContent: "center" }]} // Added justifyContent
            onPress={() => setShowGenderModal(true)}
          >
            {/* Ensure the display text is also wrapped in Text */}
            <Text style={{ color: formData.gender ? "#000" : "#9CA3AF" }}>
              {formData.gender
                ? genderOptions.find((g) => g.value === formData.gender)?.label
                : "Choose your gender"}
            </Text>
          </Pressable>

          <Modal
            visible={showGenderModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowGenderModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <FlatList
                  data={genderOptions}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        handleChange("gender", item.value);
                        setShowGenderModal(false);
                      }}
                      style={styles.modalItem}
                    >
                      {/* Ensure the modal item text is also wrapped in Text */}
                      <Text style={styles.modalItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.modalSeparator} />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowGenderModal(false)}
                  style={styles.modalCancelButton}
                >
                  {/* Ensure the cancel button text is also wrapped in Text */}
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* Location Name & Get Location Text Link */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Location<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formData.location === "" && styles.placeholderText,
            ]} // Style placeholder if empty
            placeholder="e.g., New York, NY"
            value={formData.location}
            onChangeText={(text) => handleChange("location", text)}
            returnKeyType="done"
            // Option: Make this input readOnly if location was auto-filled and you don't want manual edits
            // editable={!isFetchingLocation} // Option: Disable while fetching
          />
          {/* Text component styled to look like a tappable link */}
          <TouchableOpacity
            onPress={handleGetLocation}
            style={styles.getLocationTextContainer} // New container for styling the text
            disabled={isFetchingLocation}
          >
            {isFetchingLocation ? (
              <View style={styles.getLocationLoading}>
                <ActivityIndicator color="#007AFF" size="small" />{" "}
                {/* Blue spinner */}
                <Text style={styles.getLocationLoadingText}>
                  {" "}
                  Fetching location...
                </Text>
              </View>
            ) : (
              <Text style={styles.getLocationText}>
                {formData.location ? "Change Location" : "Use Current Location"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ActionButton
          onPress={handleContinue}
          fullWidth
          disabled={!isFormValid || isFetchingLocation} // Disable if form invalid OR fetching location
        >
          Continue
        </ActionButton>
      </ScrollView>
    </View>
  );
};

const appStyles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
});

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1, // Allows content to expand
    paddingHorizontal: 10, // Padding for the scrollable content
    paddingBottom: 30, // Add some bottom padding for the last button
    backgroundColor: "#fff",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#4B5563", // Tailwind grey-700
    marginBottom: 8,
    fontFamily: "Inter-Medium", // Assuming you have custom fonts
  },
  required: {
    color: "#EF4444", // Tailwind red-500
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB", // Tailwind grey-200
    borderRadius: 8, // Rounded corners
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 16,
    backgroundColor: "#F9FAFB", // Tailwind grey-50
    color: "#1F2937", // Tailwind grey-900
    fontFamily: "Inter-Regular", // Assuming you have custom fonts
    minHeight: 48, // Consistent height
  },
  placeholderText: {
    color: "#9CA3AF", // Tailwind grey-400 for placeholder text
  },
  // --- Styles for the "Use Current Location" / "Change Location" Text Link ---
  getLocationTextContainer: {
    marginTop: 10, // Space above the text link
    alignItems: "flex-start", // Align text to the left
  },
  getLocationText: {
    fontSize: 14, // Slightly smaller font size
    color: "#007AFF", // Standard blue for links (iOS blue)
    fontFamily: "Inter-SemiBold", // Slightly bolder than regular text
    textDecorationLine: "underline", // Make it look like a link
  },
  getLocationLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Align to the left
    paddingVertical: 8, // Give it some vertical space to align with expected text height
  },
  getLocationLoadingText: {
    fontSize: 14,
    color: "#007AFF", // Blue color for loading text
    fontFamily: "Inter-SemiBold",
    marginLeft: 8, // Space between spinner and text
  },
  // --- End Location Text Link Styles ---

  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "50%",
  },
  modalItem: {
    paddingVertical: 14,
    alignItems: "center",
  },
  modalSeparator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: -20,
  },
  modalItemText: {
    fontSize: 16,
    textAlign: "center",
    color: "#1F2937", // Dark text
    fontFamily: "Inter-Medium",
  },
  modalCancelButton: {
    paddingVertical: 14,
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#F2F2F2", // Light gray background
    borderRadius: 8,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: "#007AFF", // Standard blue color
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  // --- End Modal Styles ---
});

export default BasicInformation;
