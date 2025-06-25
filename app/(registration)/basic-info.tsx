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
} from "react-native";
import ActionButton from "@/components/ActionButton";
import PageHeader from "@/components/PageHeader";
import QuestionHeader from "@/components/PageHeader/QuestionHeader";
import { useProfileStore } from "@/store/useProfileStore";
import { useLocalSearchParams, useRouter } from "expo-router";

const BasicInformation: React.FC = () => {
  const { profile, updateBasicInfo, setCurrentStep, completeStep } =
    useProfileStore();
  const { mobile } = useLocalSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: profile.basicInfo.fullName || "",
    age: profile.basicInfo.age || "",
    gender: profile.basicInfo.gender || "",
    location: profile.basicInfo.location || "",
    mobile: typeof mobile === "string" ? mobile : "",
  });

  const [showGenderModal, setShowGenderModal] = useState(false);

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Non-binary", value: "non-binary" },
    { label: "Other", value: "other" },
    { label: "Prefer not to say", value: "prefer-not-to-say" },
  ];

  const isFormValid =
    formData.fullName.trim() !== "" &&
    formData.age.trim() !== "" &&
    formData.gender.trim() !== "" &&
    formData.location.trim() !== "";

  const handleChange = useCallback((name: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const handleContinue = () => {
    if (!isFormValid) {
      Alert.alert("Missing Information", "Please fill all mandatory fields.");
      return;
    }

    updateBasicInfo(formData);
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
            autoCapitalize="words"
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
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9]/g, "");
              handleChange("age", numericText);
            }}
            maxLength={3}
            returnKeyType="next"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Gender<Text style={styles.required}>*</Text>
          </Text>
          <Pressable
            style={styles.input}
            onPress={() => setShowGenderModal(true)}
          >
            <Text style={{ color: formData.gender ? "#000" : "#9CA3AF" }}>
              {formData.gender
                ? genderOptions.find((g) => g.value === formData.gender)?.label
                : "Choose your gender"}
            </Text>
          </Pressable>

          <Modal visible={showGenderModal} transparent animationType="slide">
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
                      <Text style={styles.modalItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowGenderModal(false)}
                  style={[styles.modalItem, { borderTopWidth: 1 }]}
                >
                  <Text style={[styles.modalItemText, { color: "red" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Location<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., New York, NY"
            value={formData.location}
            onChangeText={(text) => handleChange("location", text)}
            returnKeyType="done"
          />
        </View>

        <ActionButton
          onPress={handleContinue}
          fullWidth
          disabled={!isFormValid}
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
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
});

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#4B5563",
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
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "50%",
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalItemText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default BasicInformation;
