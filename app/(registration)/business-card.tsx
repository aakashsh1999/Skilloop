import ActionButton from "@/components/ActionButton";
import PageHeader from "@/components/PageHeader";
import QuestionHeader from "@/components/PageHeader/QuestionHeader";
import { useProfileStore } from "@/store/useProfileStore";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useRef, useState, useEffect } from "react"; // Import useEffect
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";

const SOCIAL_PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", icon: "📊" },
  { id: "figma", name: "Figma", icon: "🎨" },
  { id: "upwork", name: "Upwork", icon: "💼" },
  { id: "dribbble", name: "Dribbble", icon: "🏀" },
  { id: "instagram", name: "Instagram", icon: "📸" },
];

const BusinessCard: React.FC = () => {
  const navigation = useNavigation();
  const {
    profile,
    updateBusinessCard,
    addSocialProfile,
    setCurrentStep,
    completeStep,
  } = useProfileStore();

  const [formData, setFormData] = useState({
    role: profile.businessCard.role || "",
    company: profile.businessCard.company || "",
    portfolio: profile.businessCard.portfolio || "",
  });

  const router = useRouter();

  const [socialUrls, setSocialUrls] = useState<Record<string, string>>(() => {
    const initialUrls: Record<string, string> = {};
    SOCIAL_PLATFORMS.forEach((platform) => {
      initialUrls[platform.id] =
        profile.businessCard.socialProfiles.find(
          (p) => p.platform === platform.id
        )?.url || "";
    });
    return initialUrls;
  });

  const [openSocialInputs, setOpenSocialInputs] = useState<
    Record<string, boolean>
  >(() => {
    const initialState: Record<string, boolean> = {};
    SOCIAL_PLATFORMS.forEach((platform) => {
      // Only open if there's an existing non-empty URL
      initialState[platform.id] = !!socialUrls[platform.id].trim();
    });
    console.log("Initial openSocialInputs state:", initialState); // Debugging initial state
    return initialState;
  });

  // Debugging openSocialInputs state changes
  useEffect(() => {
    console.log("Current openSocialInputs state:", openSocialInputs);
  }, [openSocialInputs]);

  const socialInputRefs = useRef<Record<string, TextInput | null>>({});

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (name: string, value: string) => {
    setSocialUrls((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSocialInput = (platformId: string) => {
    setOpenSocialInputs((prev) => {
      const isCurrentlyOpen = prev[platformId];
      const newState = { ...prev, [platformId]: !isCurrentlyOpen };
      console.log(
        `Toggling ${platformId}: from ${isCurrentlyOpen} to ${!isCurrentlyOpen}. New state partial:`,
        newState
      );

      // If we're opening it, try to focus after the state update
      if (newState[platformId]) {
        // Use a slight delay to ensure the TextInput is rendered before trying to focus
        setTimeout(() => {
          console.log(
            `Attempting to focus ${platformId}. Ref exists:`,
            !!socialInputRefs.current[platformId]
          );
          socialInputRefs.current[platformId]?.focus();
        }, 100);
      }
      return newState;
    });
  };

  const handleContinue = () => {
    updateBusinessCard(formData);

    // Filter and add only social profiles that have a URL
    // This loop should use the current `socialUrls` state
    // and `Object.values(socialUrls).forEach` or similar
    // to ensure all entered URLs are saved.
    // The previous implementation was already correct for this part.
    Object.entries(socialUrls).forEach(([platform, url]) => {
      if (url.trim()) {
        addSocialProfile({ platform, url });
      }
    });

    completeStep(3);
    setCurrentStep(4);
    router.push("/(registration)/certificates");
  };

  const handleBack = () => {
    router.push("/(registration)/basic-info");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PageHeader currentStep={3} totalSteps={6} onBack={handleBack} />
      <QuestionHeader
        title="Your Business Card"
        subtitle="Your quick identity card — this is what others will see first."
      />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Role</Text>
        <TextInput
          style={styles.input}
          placeholder="App Developer/Editor"
          value={formData.role}
          onChangeText={(text) => handleChange("role", text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Current Company / Project</Text>
        <TextInput
          style={styles.input}
          placeholder="Currently at [Your Startup Name]"
          value={formData.company}
          onChangeText={(text) => handleChange("company", text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Portfolio / Website (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="www.mywork.dev"
          value={formData.portfolio}
          onChangeText={(text) => handleChange("portfolio", text)}
        />
        <Text style={styles.help}>Link to your portfolio or website</Text>
      </View>

      <View style={styles.socialContainer}>
        <Text style={styles.socialLabel}>
          Social Profiles (Select all that Apply)
        </Text>

        <View style={styles.iconRow}>
          {SOCIAL_PLATFORMS.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={[
                styles.iconCircle,
                openSocialInputs[platform.id] && styles.iconCircleActive,
              ]}
              onPress={() => toggleSocialInput(platform.id)}
            >
              <Text>{platform.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {SOCIAL_PLATFORMS.map((platform) =>
          openSocialInputs[platform.id] ? (
            <View
              key={platform.id + "-input-wrapper"}
              style={styles.inputGroup}
            >
              <TextInput
                ref={(el) => (socialInputRefs.current[platform.id] = el)}
                style={styles.input}
                placeholder={`${platform.name} URL`}
                value={socialUrls[platform.id]}
                onChangeText={(text) => handleSocialChange(platform.id, text)}
                // Temporarily comment out onBlur to test simultaneous opening
                // onBlur={() => {
                //   if (!socialUrls[platform.id]?.trim()) {
                //      setOpenSocialInputs(prev => ({...prev, [platform.id]: false}));
                //   }
                // }}
              />
            </View>
          ) : null
        )}
      </View>

      <ActionButton onPress={handleContinue} fullWidth>
        Continue
      </ActionButton>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "white",
    flexGrow: 1,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
  },
  help: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
  socialContainer: {
    marginBottom: 24,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    marginVertical: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  iconCircleActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#DBEAFE",
  },
});

export default BusinessCard;
