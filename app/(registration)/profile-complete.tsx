import ActionButton from "@/components/ActionButton";
import { useProfileStore } from "@/store/useProfileStore";
import Icon from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const ProfileComplete = () => {
  const navigation = useNavigation();
  const { profile } = useProfileStore();
  const router = useRouter();

  useEffect(() => {
    if (profile.completedSteps.length < 6) {
      router.push("/login"); // Adjust screen name accordingly
    }
  }, [profile.completedSteps, navigation]);

  const handleViewProfile = () => {
    router.push("/login"); // Adjust screen name accordingly
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Icon name="check-circle" size={40} stroke="#16a34a" />
      </View>

      <Text style={styles.title}>Profile Complete!</Text>

      <Text style={styles.description}>
        Your professional profile has been successfully created. You can now
        showcase your skills and experience to others.
      </Text>

      <ActionButton onPress={handleViewProfile} fullWidth>
        Login to View Profile
      </ActionButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dcfce7", // green-100
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    color: "#6b7280", // gray text
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
});

export default ProfileComplete;
