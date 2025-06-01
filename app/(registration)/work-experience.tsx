import ActionButton from "@/components/ActionButton";
import AddItemButton from "@/components/AddItemButton";
import ItemCard from "@/components/ItemCard";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/hooks/useToast";
import { useProfileStore } from "@/store/useProfileStore";
import { formatDate } from "@/utils/dateUtils";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, // Import ActivityIndicator for loading state
} from "react-native";
import { API_BASE_URL } from "@/env";

// IMPORTANT: MAKE SURE THIS NGROK URL IS CURRENT AND MATCHES YOUR ACTIVE NGROK TUNNEL!
// Ngrok free tunnels change every time you restart ngrok.

const WorkExperienceScreen = () => {
  const navigation = useNavigation();
  const { toast } = useToast();
  const {
    profile,
    addWorkExperience,
    removeWorkExperience,
    setCurrentStep,
    completeStep,
    // If you have a resetProfile function, use it here after successful registration
    // resetProfile,
  } = useProfileStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setIsLoading] = useState(false); // Changed to 'loading' for clarity
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
  });
  const router = useRouter();

  const handleChange = (name: string, value: string) => {
    // Added types for clarity
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCurrentlyWorkingChange = (value: boolean) => {
    // Added type for clarity
    setFormData({
      ...formData,
      currentlyWorking: value,
      endDate: value ? "" : formData.endDate,
    });
  };

  const handleAddExperience = () => {
    if (!formData.company || !formData.position || !formData.startDate) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic date format validation (MM/YYYY)
    const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dateRegex.test(formData.startDate)) {
      toast({
        title: "Invalid Start Date",
        description: "Please use MM/YYYY format (e.g., 01/2023).",
        variant: "destructive",
      });
      return;
    }
    if (
      !formData.currentlyWorking &&
      formData.endDate &&
      !dateRegex.test(formData.endDate)
    ) {
      toast({
        title: "Invalid End Date",
        description: "Please use MM/YYYY format for End Date (e.g., 12/2024).",
        variant: "destructive",
      });
      return;
    }

    if (!formData.currentlyWorking && !formData.endDate) {
      toast({
        title: "End date required",
        description:
          'Please provide an end date or select "I currently work here".',
        variant: "destructive",
      });
      return;
    }

    addWorkExperience({
      // Generate a unique ID for the experience (simple timestamp for now)
      id: Date.now().toString(),
      company: formData.company,
      position: formData.position,
      startDate: formData.startDate,
      endDate: formData.currentlyWorking ? undefined : formData.endDate,
      currentlyWorking: formData.currentlyWorking,
    });

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
    // Added type for clarity
    removeWorkExperience(id);
    toast({
      title: "Experience removed",
      description: "Your work experience has been removed.",
    });
  };

  const sendProfileDataToBackend = async (data: any) => {
    // Added type for clarity
    console.log("Attempting to send data:", data?.mobile_number); // More detailed log
    setIsLoading(true);
    try {
      // --- FIX: Corrected API endpoint path ---
      const fullUrl = `${API_BASE_URL}/api/auth/register`; // Corrected path, add your own
      console.log("Sending to URL:", fullUrl);

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authorization headers if needed, e.g., 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      // --- CRITICAL DEBUGGING STEP: Get raw response text ---
      const responseText = await response.json();
      console.log("Raw Backend Response Text:", responseText);

      if (!response.ok) {
        // Attempt to parse as JSON if it's not a successful response
        let errorMessage = "Failed to register profile on backend.";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
          console.error("Backend error (parsed):", errorData);
        } catch (parseError) {
          // If responseText is not valid JSON, use the raw text as the message
          errorMessage = `Backend returned non-JSON error: ${responseText}`;
          console.error(
            "Backend error (raw text, JSON parse failed):",
            responseText
          );
        }
        throw new Error(errorMessage);
      }
      // If response.ok is true, it should always be valid JSON
      // console.log("Backend Success Response Data:", responseData);

      toast({
        title: "Profile Saved!",
        description: "Your full profile has been successfully registered.",
        variant: "success",
      });

      // Navigate to the next screen after successful API call
      router.push("/(registration)/profile-complete"); // Or wherever the final step leads
    } catch (error: any) {
      console.error("API call failed:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        // @ts-ignore
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    completeStep(5);
    setCurrentStep(6);

    const mobileNumber = profile?.basicInfo?.mobile;

    if (!mobileNumber) {
      toast({
        title: "Missing Mobile Number",
        description: "Mobile number is required to continue.",
        variant: "destructive",
      });
      return;
    }
    console.log(mobileNumber, "working");

    const dataToSend = {
      mobile_number: mobileNumber,
      user_type: profile.userType || "Unknown",
      name: profile.basicInfo?.fullName || "Unknown Name",
      gender: profile.basicInfo?.gender || "Not Specified",
      age: profile.basicInfo?.age ? parseInt(profile.basicInfo.age, 10) : 0,
      location: profile.basicInfo?.location || "Unknown Location",

      latitude: profile.location?.latitude
        ? parseFloat(profile.location.latitude)
        : null,
      longitude: profile.location?.longitude
        ? parseFloat(profile.location.longitude)
        : null,

      profile_image:
        profile.profileImages?.find((img) => img.type === "face")?.url || "",

      face:
        profile.profileImages?.find((img) => img.type === "face")?.url || null,

      anything_but_professional:
        profile.profileImages?.find((img) => img.type === "professional")
          ?.url || null,

      skills: profile.skills || [],

      skill_type: profile.skillType || "Unknown",

      short_bio: profile.shortBio || "No bio provided.",

      business_card: {
        role: profile.businessCard?.role || null,
        company: profile.businessCard?.company || null,
        portfolio: profile.businessCard?.portfolio || null,
        socialProfiles: profile.businessCard?.socialProfiles || [],
      },

      certificates: profile.certificates || [],
      work_experience: profile.workExperience || [],
    };

    console.log(
      "✅ Final data to send (handleContinue):",
      JSON.stringify(dataToSend, null, 2)
    );

    console.log(profile, "mobile");

    // console.log(
    //   "Final data to send (handleContinue):",
    //   JSON.stringify(dataToSend, null, 2)
    // );

    await sendProfileDataToBackend(dataToSend);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSkip = async () => {
    // Made async as it also calls sendProfileDataToBackend
    completeStep(5);
    setCurrentStep(6);

    const dataToSend = {
      // Same structure as handleContinue, but work_experience might be empty
      mobile_number: profile.mobile,
      user_type: profile.userType,
      name: profile.basicInfo.name,
      gender: profile.basicInfo.gender,
      age: profile.basicInfo.age ? parseInt(profile.basicInfo.age) : null,
      location: profile.basicInfo.location,
      latitude: profile.location?.latitude || null,
      longitude: profile.location?.longitude || null,
      profile_image:
        profile.profileImages.find((img) => img.type === "face")?.url || null,
      face:
        profile.profileImages.find((img) => img.type === "face")?.url || null,
      skills: profile.skills,
      anything_but_professional:
        profile.profileImages.find((img) => img.type === "professional")?.url ||
        null,
      skill_type: profile.skillType,
      short_bio: profile.shortBio,
      business_card: {
        role: profile.businessCard.role || null,
        company: profile.businessCard.company || null,
        portfolio: profile.businessCard.portfolio || null,
        socialProfiles: profile.businessCard.socialProfiles || [],
      },
      certificates: profile.certificates || [],
      work_experience: profile.workExperience || [], // Will be an empty array if user skipped adding
    };

    console.log(
      "Final data to send (handleSkip):",
      JSON.stringify(dataToSend, null, 2)
    );

    await sendProfileDataToBackend(dataToSend);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PageHeader
        title="Work Experience"
        subtitle="Add your professional experience to highlight your career path"
        currentStep={5}
        totalSteps={6}
        onBack={handleBack}
      />

      {profile.workExperience.length > 0 && (
        <View style={styles.listContainer}>
          {profile.workExperience.map((experience) => (
            <ItemCard
              key={experience.id}
              logo={experience.logo || undefined}
              logoPlaceholder={experience.company ? experience.company[0] : ""}
              title={experience.position}
              subtitle={`${experience.company} • ${formatDate(
                experience.startDate
              )} - ${
                experience.currentlyWorking
                  ? "Present"
                  : formatDate(experience.endDate || "")
              }`}
              onRemove={() => handleRemoveExperience(experience.id)}
            />
          ))}
        </View>
      )}

      <AddItemButton
        onPress={() => setIsDialogOpen(true)}
        label="+ Add Experience"
        style={styles.addButton}
      />

      {profile.workExperience.length > 0 ? (
        <ActionButton onPress={handleContinue} fullWidth disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : "Continue"}
        </ActionButton>
      ) : (
        <ActionButton
          onPress={handleSkip}
          variant="outline"
          fullWidth
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : "Skip for now"}
        </ActionButton>
      )}

      <Modal
        visible={isDialogOpen}
        animationType="slide"
        onRequestClose={() => setIsDialogOpen(false)}
      >
        <ScrollView contentContainerStyle={styles.dialogContent}>
          <Text style={styles.dialogTitle}>Add Experience</Text>

          <TextInput
            placeholder="Company"
            style={styles.input}
            value={formData.company}
            onChangeText={(text) => handleChange("company", text)}
            autoCapitalize="words"
          />
          <TextInput
            placeholder="Position"
            style={styles.input}
            value={formData.position}
            onChangeText={(text) => handleChange("position", text)}
            autoCapitalize="words"
          />
          <TextInput
            placeholder="Start Date (MM/YYYY)"
            style={styles.input}
            value={formData.startDate}
            onChangeText={(text) => handleChange("startDate", text)}
            keyboardType="numeric"
            maxLength={7}
          />

          <View style={styles.switchRow}>
            <Switch
              value={formData.currentlyWorking}
              onValueChange={handleCurrentlyWorkingChange}
            />
            <Text>I currently work here</Text>
          </View>

          {!formData.currentlyWorking && (
            <TextInput
              placeholder="End Date (MM/YYYY)"
              style={styles.input}
              value={formData.endDate}
              onChangeText={(text) => handleChange("endDate", text)}
              keyboardType="numeric"
              maxLength={7}
            />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => setIsDialogOpen(false)}
              style={[styles.button, styles.cancelButton]}
              disabled={loading}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddExperience}
              style={[styles.button, styles.saveButton]}
              disabled={loading}
            >
              <Text style={{ color: "white" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    marginBottom: 24,
  },
  addButton: {
    marginBottom: 24,
  },
  dialogContent: {
    padding: 16,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  button: {
    padding: 12,
    borderRadius: 20,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  saveButton: {
    backgroundColor: "orange",
  },
});

export default WorkExperienceScreen;
