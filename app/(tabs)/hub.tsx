import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// You'll likely need these icon libraries:
// expo install @expo/vector-icons
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Get screen width for responsive button sizing
const { width } = Dimensions.get("window");
// Calculate button size: screen width minus padding, divided by 2, minus spacing
const buttonSize = (width - 16 * 2 - 12) / 2; // 16 padding each side, 12 space between

const router = useRouter();
const ProfileDashboardScreen = () => {
  const handleEditProfile = () => {
    console.log("Edit Profile Pressed");
    // Implement navigation or modal for editing profile
  };

  const handleFilterSort = () => {
    console.log("Filter/Sort Pressed");
    // Implement filter/sort functionality
  };

  const handleSettings = () => {
    console.log("Settings Pressed");
    // Implement navigation to settings screen
  };

  const handleCategoryPress = (category) => {
    console.log(`${category} Pressed`);
    router.push(`/(task-management)`);
    // Implement navigation or action based on category
  };

  const handleAnalyticsPress = () => {
    console.log("Analytics Pressed");
    // Implement navigation or action for Analytics
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Profile Card */}
      <View style={styles.profileCard}>
        {/* Icons */}
        <TouchableOpacity
          onPress={handleEditProfile}
          style={styles.iconTopLeft}
        >
          <Feather name="edit-2" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleFilterSort}
          style={styles.iconTopRight1}
        >
          <Ionicons name="options-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSettings} style={styles.iconTopRight2}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>

        {/* Avatar and Name */}
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/4.jpg" }} // Replace with actual avatar URL or require()
            style={styles.avatar}
          />
          <Text style={styles.profileName}>Dev Singh</Text>{" "}
          {/* Replace with actual name */}
        </View>
      </View>

      {/* Category Buttons Grid */}
      <View style={styles.gridContainer}>
        {/* Task Management */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            { width: buttonSize, height: buttonSize },
          ]}
          onPress={() => handleCategoryPress("Task Management")}
        >
          <Text style={styles.categoryEmoji}>📝</Text>
          <Text style={styles.categoryEmoji}>📁</Text>
          <Text style={styles.categoryText}>Task{"\n"}Management</Text>{" "}
          {/* Use {"\n"} for line break */}
        </TouchableOpacity>

        {/* Payment */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            { width: buttonSize, height: buttonSize },
          ]}
          onPress={() => handleCategoryPress("Payment")}
        >
          <Text style={styles.categoryEmoji}>💳</Text>
          <Text style={styles.categoryText}>Payment</Text>
        </TouchableOpacity>

        {/* Skill Clash */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            { width: buttonSize, height: buttonSize },
          ]}
          onPress={() => handleCategoryPress("Skill Clash")}
        >
          <Text style={styles.categoryEmoji}>🏆</Text>
          <Text style={styles.categoryText}>Skill Clash</Text>
        </TouchableOpacity>

        {/* Courses */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            { width: buttonSize, height: buttonSize },
          ]}
          onPress={() => handleCategoryPress("Courses")}
        >
          <Text style={styles.categoryEmoji}>📁</Text>
          <Text style={styles.categoryEmoji}>📄</Text>
          <Text style={styles.categoryText}>Courses</Text>
        </TouchableOpacity>
      </View>

      {/* Analytics Button */}
      <TouchableOpacity
        style={styles.analyticsButton}
        onPress={handleAnalyticsPress}
      >
        <Text style={styles.analyticsButtonText}>Analytics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0", // Light grey background
    padding: 16,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 20, // Vertical padding to give space
    paddingHorizontal: 15,
    marginBottom: 20,
    alignItems: "center", // Center content horizontally
    // Shadow for Android
    elevation: 3,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    position: "relative", // Needed for absolute positioning of icons
  },
  iconTopLeft: {
    position: "absolute",
    top: 15,
    left: 15,
    padding: 5, // Increase tappable area
    zIndex: 1, // Ensure icon is above other content
  },
  iconTopRight1: {
    position: "absolute",
    top: 15,
    right: 50, // Position relative to the settings icon
    padding: 5,
    zIndex: 1,
  },
  iconTopRight2: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 1,
  },
  profileInfo: {
    alignItems: "center", // Center avatar and name
    marginTop: 10, // Space below top icons
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40, // Make it round
    marginBottom: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Allow items to wrap to the next row
    justifyContent: "space-between", // Space out items
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: "#FFECD9", // Light peach color
    borderRadius: 15,
    padding: 15,
    marginBottom: 12, // Space below each button
    alignItems: "center",
    justifyContent: "center",
    // Add shadow for elevation
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryEmoji: {
    fontSize: 30, // Size of the emoji/icon
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
  },
  analyticsButton: {
    backgroundColor: "#fff", // White background
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    // Add shadow for elevation
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  analyticsButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProfileDashboardScreen;
