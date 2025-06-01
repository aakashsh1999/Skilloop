import ActionButton from "@/components/ActionButton";
import PageHeader from "@/components/PageHeader";
import { useProfileStore } from "@/store/useProfileStore";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SKILL_CATEGORIES = [
  { id: "editor", label: "Editor" },
  { id: "developer", label: "Developer" },
  { id: "designer", label: "Designer" },
  { id: "business", label: "Business Growth" },
  { id: "videography", label: "Videography" },
];

const MiscScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    profile,
    addSkill,
    removeSkill,
    updateBio,
    setCurrentStep,
    completeStep,
  } = useProfileStore();

  const [skillInput, setSkillInput] = useState("");
  const [bio, setBio] = useState(profile.bio || "");
  const inputRef = useRef<TextInput>(null);

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const category =
        SKILL_CATEGORIES.find(
          (c) =>
            c.label.toLowerCase().includes(skillInput.toLowerCase()) ||
            skillInput.toLowerCase().includes(c.label.toLowerCase())
        )?.id || "other";

      addSkill({
        name: skillInput.trim(),
        category,
      });

      setSkillInput("");
      Keyboard.dismiss();
    }
  };

  //   useEffect(() => {
  //     const handleKeyPress = (e: KeyboardEvent) => {
  //       if (e.key === "Enter") {
  //         e.preventDefault();
  //         handleAddSkill();
  //       }
  //     };

  //     const input = inputRef.current;
  //     if (input) {
  //       input.addListener("onSubmitEditing", handleAddSkill);
  //     }
  //     return () => {
  //       if (input) {
  //         input.removeListener("onSubmitEditing", handleAddSkill);
  //       }
  //     };
  //   }, [skillInput]);

  const handleAddPredefinedSkill = (skill: (typeof SKILL_CATEGORIES)[0]) => {
    addSkill({ name: skill.label, category: skill.id });
  };

  const router = useRouter();
  const handleContinue = () => {
    updateBio(bio);
    completeStep(6);
    setCurrentStep(7);
    router.push("/(registration)/business-card");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PageHeader
        title="Misc"
        subtitle="Add your skills and bio"
        currentStep={6}
        totalSteps={6}
        onBack={handleBack}
      />

      <Text style={styles.label}>Search your skill</Text>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="E.g., Editor, developer..."
        value={skillInput}
        onChangeText={setSkillInput}
        onSubmitEditing={handleAddSkill}
        returnKeyType="done"
      />

      <View style={styles.tagsContainer}>
        {SKILL_CATEGORIES.map((skill) => (
          <TouchableOpacity
            key={skill.id}
            style={styles.tag}
            onPress={() => handleAddPredefinedSkill(skill)}
          >
            <Text style={styles.tagText}>{skill.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tagsContainer}>
        {profile.skills.map((skill) => (
          <View key={skill.id} style={styles.skillTag}>
            <Text>{skill.name}</Text>
            <TouchableOpacity onPress={() => removeSkill(skill.id)}>
              <Feather
                name="x"
                size={14}
                color="#6B7280"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={styles.label}>Add short bio</Text>
      <TextInput
        style={styles.textarea}
        multiline
        numberOfLines={5}
        placeholder="Write a short bio about yourself..."
        value={bio}
        onChangeText={setBio}
      />

      <ActionButton onPress={handleContinue} fullWidth>
        Continue
      </ActionButton>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    color: "#6B7280",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  skillTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 24,
  },
});

export default MiscScreen;
