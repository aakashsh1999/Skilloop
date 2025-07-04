import ActionButton from "@/components/ActionButton";
import PageHeader from "@/components/PageHeader";
import QuestionHeader from "@/components/PageHeader/QuestionHeader";
import { useProfileStore } from "@/store/useProfileStore";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const USER_TYPES = [
  {
    type: "freelancer" as const,
    title: "Freelancer",
    description: "I provide services or work on projects",
    emoji: "👨‍💼",
  },
  {
    type: "founder" as const,
    title: "Founder",
    description: "I'm building a startup or business",
    emoji: "💼",
  },
  {
    type: "student" as const,
    title: "Student",
    description: "I'm studying or learning new skills",
    emoji: "🎓",
  },
];

const UserTypeSelection: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { mobile } = useLocalSearchParams(); // user will be the mobile_number

  const { profile, setUserType, setCurrentStep, completeStep } =
    useProfileStore();
  const [selectedType, setSelectedType] = useState<string>(profile.userType);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  console.log(mobile, "ss");

  const handleContinue = () => {
    setUserType(selectedType as any);
    completeStep(1);
    setCurrentStep(2);
    router.push({
      pathname: "/(registration)/basic-info",
      params: { mobile: mobile || "" },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PageHeader currentStep={1} totalSteps={6} />

      <QuestionHeader title="I am a..." subtitle="select what describes you" />

      <View style={styles.optionList}>
        {USER_TYPES.map((userType) => (
          <TouchableOpacity
            key={userType.type}
            onPress={() => handleTypeSelect(userType.type)}
            style={[
              styles.optionCard,
              selectedType === userType.type && styles.optionCardSelected,
            ]}
          >
            <View style={styles.optionContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{userType.title}</Text>
                <Text style={styles.optionDescription}>
                  {userType.description}
                </Text>
              </View>
              <Text style={styles.optionEmoji}>{userType.emoji}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ActionButton onPress={handleContinue} fullWidth>
        Continue
      </ActionButton>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    paddingBottom: 32,
    backgroundColor: "#fff",
  },
  optionList: {
    marginBottom: 48,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: "black", // gray-200
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 28,
    paddingBottom: 32,
    marginBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
  },
  optionCardSelected: {
    borderColor: "#fb923c", // orange-400
    backgroundColor: "rgba(251, 146, 60, 0.05)",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 4,
  },
  optionDescription: {
    color: "#6b7280", // gray-500
  },
  optionEmoji: {
    fontSize: 28,
    marginLeft: 12,
  },
});

export default UserTypeSelection;
