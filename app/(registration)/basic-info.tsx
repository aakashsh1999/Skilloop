import ActionButton from "@/components/ActionButton";
import PageHeader from "@/components/PageHeader";
import { useProfileStore } from "@/store/useProfileStore";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";

const BasicInformation: React.FC = () => {
  const navigation = useNavigation();
  const { profile, updateBasicInfo, setCurrentStep, completeStep } =
    useProfileStore();
  const { mobile } = useLocalSearchParams(); // user will be the mobile_number
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: profile.basicInfo.fullName || "",
    age: profile.basicInfo.age || "",
    gender: profile.basicInfo.gender || "",
    location: profile.basicInfo.location || "",
    mobile: mobile || "",
  });

  console.log(mobile, "mobile");
  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleContinue = () => {
    updateBasicInfo(formData);
    completeStep(2);
    setCurrentStep(3);
    router.push("/(registration)/profile-images"); // adjust route name as needed
  };

  const handleBack = () => {
    router.push("/(registration)");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PageHeader
        title="Basic Information"
        subtitle="Tell us a bit about yourself"
        currentStep={2}
        totalSteps={6}
        onBack={handleBack}
      />

      <View style={styles.field}>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          placeholder="Elon Musk"
          value={formData.fullName}
          onChangeText={(text) => handleChange("fullName", text)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="21"
          keyboardType="numeric"
          value={formData.age}
          onChangeText={(text) => handleChange("age", text)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Gender</Text>
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
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Mars"
          value={formData.location}
          onChangeText={(text) => handleChange("location", text)}
        />
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
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
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
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    color: "black",
    paddingRight: 30,
  },
});

export default BasicInformation;
