import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar, // Ensure StatusBar is imported if used in styles
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import * as Location from "expo-location";
import ActionButton from "@/components/ActionButton"; // Ensure correct path
import PageHeader from "@/components/PageHeader"; // Ensure correct path
import QuestionHeader from "@/components/PageHeader/QuestionHeader"; // Ensure correct path
import { useProfileStore } from "@/store/useProfileStore"; // Ensure correct path
import { useNavigation } from "@react-navigation/native"; // For navigation (not used in JSX)
import { useLocalSearchParams, useRouter } from "expo-router"; // For router

const BasicInformation: React.FC = () => {
  const navigation = useNavigation();
  const { profile, updateBasicInfo, setCurrentStep, completeStep } =
    useProfileStore();
  const { mobile } = useLocalSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: profile.basicInfo.fullName || "",
    age: profile.basicInfo.age || "",
    gender: profile.basicInfo.gender || "",
    location: profile.basicInfo.location || "",
    latitude: profile.basicInfo.latitude, // NEW: Initialize latitude
    longitude: profile.basicInfo.longitude, // NEW: Initialize longitude
    mobile: typeof mobile === "string" ? mobile : "",
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Debounce ref for location input changes
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if all mandatory fields are filled
  const isFormValid =
    formData.fullName.trim() !== "" &&
    formData.age.trim() !== "" &&
    formData.gender.trim() !== "" &&
    formData.location.trim() !== "";

  // Generic handler for form field changes
  const handleChange = useCallback((name: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  // Function to geocode a manually entered address
  // This is NOT a real-time "suggestion on search" but a conversion after typing.
  const geocodeAddress = useCallback(
    async (address: string) => {
      if (address.trim() === "") {
        handleChange("latitude", null);
        handleChange("longitude", null);
        return;
      }
      try {
        // Using `geocodeAsync` might be slow and not ideal for real-time suggestions
        // For proper suggestions, an external Geocoding API (e.g., Google Places) is recommended.
        const geocoded = await Location.geocodeAsync(address);
        if (geocoded.length > 0) {
          const { latitude, longitude } = geocoded[0];
          handleChange("latitude", latitude);
          handleChange("longitude", longitude);
          setLocationError(null); // Clear any previous error
        } else {
          // If no results, clear coords but keep the typed location text
          handleChange("latitude", null);
          handleChange("longitude", null);
          setLocationError("Could not find coordinates for this location.");
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
        handleChange("latitude", null);
        handleChange("longitude", null);
        setLocationError("Error finding location coordinates.");
      }
    },
    [handleChange]
  );

  // Handle location input change with debounce for geocoding
  const handleLocationInputChange = useCallback(
    (text: string) => {
      handleChange("location", text);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        geocodeAddress(text);
      }, 1000); // Debounce for 1 second
    },
    [handleChange, geocodeAddress]
  );

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission to access location was denied.");
        Alert.alert(
          "Location Permission Denied",
          "Please enable location services in your device settings to use this feature."
        );
        return; // Return immediately if permission denied
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      let geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = geocode[0];
      let locationString = "Unknown location";
      if (address) {
        // Prioritize more specific components
        locationString =
          address.city ||
          address.subregion ||
          address.region ||
          address.country ||
          "Unknown location";
      }

      // Update formData with both location string and coordinates
      setFormData((prevData) => ({
        ...prevData,
        location: locationString,
        latitude: latitude,
        longitude: longitude,
      }));

      Alert.alert("Location Found", `Detected: ${locationString}`);
    } catch (error: any) {
      console.error("Error fetching location:", error);
      setLocationError("Could not fetch location. Please try again.");
      Alert.alert(
        "Location Error",
        "Failed to get current location. " + error.message ||
          "Please check your GPS and internet connection."
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleContinue = () => {
    if (!isFormValid) {
      Alert.alert("Missing Information", "Please fill all mandatory fields.");
      return;
    }

    // Ensure latitude/longitude are set if location is manually entered but not geocoded yet
    if (!formData.latitude || !formData.longitude) {
      Alert.alert(
        "Location Incomplete",
        "Please use 'Get Current Location' or ensure your manually typed location is recognized."
      );
      return;
    }

    updateBasicInfo(formData); // This now includes latitude and longitude
    completeStep(2);
    setCurrentStep(3);
    router.push("/(registration)/profile-images");
  };

  const handleBack = () => {
    router.push("/(registration)");
  };

  return (
    <View style={appStyles.fullScreenContainer}>
      <PageHeader currentStep={2} totalSteps={6} onBack={handleBack} />
      <QuestionHeader
        title="Basic Information"
        subtitle="Tell us a bit about yourself"
      />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
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
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Age<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="21"
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(text) => handleChange("age", text)}
            maxLength={3}
            returnKeyType="next"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Gender<Text style={styles.required}>*</Text>
          </Text>
          <RNPickerSelect
            onValueChange={(value) => handleChange("gender", value)}
            value={formData.gender}
            placeholder={{ label: "Choose your gender", value: "" }}
            items={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Non-binary", value: "non-binary" },
              { label: "Other", value: "other" },
              { label: "Prefer not to say", value: "prefer-not-to-say" },
            ]}
            style={pickerSelectStyles}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Location<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., New York, NY"
            value={formData.location}
            onChangeText={handleLocationInputChange} // Use the new handler for debounce/geocoding
            returnKeyType="done"
          />
          {/* Display current Lat/Lon if available (for debugging/info) */}
          {formData.latitude && formData.longitude && (
            <Text style={styles.coordinatesText}>
              Lat: {formData.latitude.toFixed(4)}, Lon:{" "}
              {formData.longitude.toFixed(4)}
            </Text>
          )}
          <TouchableOpacity
            style={styles.getLocationButton}
            onPress={handleGetLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.getLocationButtonText}>
                Get Current Location
              </Text>
            )}
          </TouchableOpacity>
          {locationError && (
            <Text style={styles.locationErrorText}>{locationError}</Text>
          )}
        </View>

        <ActionButton
          onPress={handleContinue}
          fullWidth
          disabled={
            !isFormValid ||
            isLoadingLocation ||
            !formData.latitude ||
            !formData.longitude
          }
        >
          Continue
        </ActionButton>
      </ScrollView>
    </View>
  );
};

// Global app styles for consistent full-screen behavior (often used with SafeAreaView)
const appStyles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fff", // Match the ScrollView background
  },
});

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 24,
  },
  pageSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#4B5563",
    fontFamily: "Montserrat",
    marginBottom: 8,
  },
  required: {
    color: "red",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    fontFamily: "MontserratBold",
  },
  getLocationButton: {
    backgroundColor: "#007AFF",
    borderRadius: 999,
    paddingVertical: 12,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  getLocationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  locationErrorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  coordinatesText: {
    // NEW style for displaying coordinates
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    textAlign: "right",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    color: "black",
    paddingRight: 30,
    backgroundColor: "white",
    fontFamily: "MontserratBold",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    fontFamily: "MontserratBold",

    color: "black",
    paddingRight: 30,
    backgroundColor: "white",
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
});

export default BasicInformation;
