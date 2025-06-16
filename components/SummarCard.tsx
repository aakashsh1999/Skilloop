// components/SummaryCard.tsx
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import {
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";

// Define the shared type for profile data used across different screens
export interface ProfileSummaryData {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  avatar?: string; // For chat UI, preferred
  profile_image?: string; // Main profile image from registration
  title?: string; // Job title or role
  website?: string | null;
  socialLinks?: Array<{ type: string; url: string }>;
  // These flags determine which action buttons appear
  isApproved?: boolean; // True if *current user* has approved this profile (for "Likes You" screen)
  matched?: boolean; // True if it's a mutual match (for "Matches" screen)
}

interface SummaryCardProps {
  profileData: ProfileSummaryData;
  onApprove?: (userId: string) => Promise<any>; // Optional, only for "Likes You" list
  onChatPress: (profile: ProfileSummaryData) => void; // Required for both "Likes You" and "Matches"
}

// Helper to get social media icons
const getSocialIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "linkedin":
      return {
        Component: FontAwesome,
        name: "linkedin-square",
        color: "#0A66C2",
      };
    case "instagram":
      return { Component: FontAwesome, name: "instagram", color: "#E4405F" };
    case "email":
      return { Component: Feather, name: "mail", color: "#000" };
    case "whatsapp":
      return {
        Component: MaterialCommunityIcons,
        name: "whatsapp",
        color: "#25D366",
      };
    case "upwork":
      return {
        Component: MaterialCommunityIcons,
        name: "upwork",
        color: "#64BF33",
      };
    case "dribbble":
      return {
        Component: MaterialCommunityIcons,
        name: "dribbble",
        color: "#EA4C89",
      };
    default:
      return null;
  }
};

// Helper for opening external links
const handleLinkPress = async (url: string) => {
  if (!url) {
    Alert.alert("Invalid Link", "URL is empty or invalid.");
    return;
  }
  try {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Cannot Open Link", `Could not open the URL: ${url}`);
    }
  } catch (error) {
    Alert.alert(
      "Error",
      `An error occurred while opening the link: ${(error as Error).message}`
    );
  }
};

const SummaryCard: React.FC<SummaryCardProps> = ({
  profileData,
  onApprove,
  onChatPress,
}) => {
  // Determine which action button to show
  const showApproveButton =
    onApprove && !profileData.matched && !profileData.isApproved; // Show if approve available AND not yet matched/approved
  const showChatButton = profileData.matched || profileData.isApproved; // Show if mutually matched OR if I have approved them

  const handleApproveAction = async () => {
    if (onApprove) {
      try {
        const result = await onApprove(profileData.id);
        // Parent component's state will update based on result.matched
        if (result?.matched) {
          Alert.alert("Congratulations!", "It's a match! You can now chat.");
        } else if (result?.message) {
          Alert.alert("Approval Sent", result.message);
        }
      } catch (error) {
        Alert.alert(
          "Error",
          (error as Error).message || "Failed to approve match."
        );
      }
    }
  };

  return (
    <View style={styles.summaryCard}>
      <Image
        source={{
          uri:
            profileData?.avatar ||
            profileData?.profile_image ||
            "https://via.placeholder.com/150",
        }}
        style={styles.avatar}
      />
      <View style={styles.summaryContent}>
        <Text style={styles.summaryName}>
          {profileData.name} {profileData.age ? `, ${profileData.age}` : ""}
        </Text>
        <Text style={styles.summaryJobTitle}>
          {profileData?.title || "No title provided"}
        </Text>
        {profileData.website && (
          <TouchableOpacity
            onPress={() => handleLinkPress(profileData.website!)}
          >
            <Text style={styles.summaryWebsiteLink}>Website/Portfolio</Text>
          </TouchableOpacity>
        )}
        <View style={styles.summarySocialIcons}>
          {profileData.socialLinks &&
            Array.isArray(profileData.socialLinks) &&
            profileData.socialLinks.map((link, index) => {
              const iconInfo = getSocialIcon(link.type);
              if (!iconInfo) return null;
              const IconComponent = iconInfo.Component;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleLinkPress(link.url)}
                  style={styles.socialIcon}
                >
                  <IconComponent
                    name={iconInfo.name}
                    size={20}
                    color={iconInfo.color || "#555"}
                  />
                </TouchableOpacity>
              );
            })}
        </View>
      </View>

      <View style={styles.actionButtons}>
        {showApproveButton && (
          <TouchableOpacity
            onPress={handleApproveAction}
            style={styles.actionButton}
          >
            <Ionicons name="checkmark-circle-outline" size={28} color="green" />
          </TouchableOpacity>
        )}
        {showChatButton && (
          <TouchableOpacity
            onPress={() => onChatPress(profileData)}
            style={styles.actionButton}
          >
            <Ionicons name="chatbubble-ellipses" size={28} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#eee",
  },
  summaryContent: {
    flex: 1,
  },
  summaryName: {
    fontWeight: "bold",
    fontSize: 19,
    marginBottom: 2,
    color: "#333",
  },
  summaryJobTitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 4,
  },
  summaryWebsiteLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
    marginTop: 2,
    marginBottom: 5,
    fontSize: 13,
  },
  summarySocialIcons: {
    flexDirection: "row",
    marginTop: 5,
  },
  socialIcon: {
    marginRight: 12,
  },
  actionButtons: {
    paddingLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  actionButton: {
    marginLeft: 10,
  },
});

export default SummaryCard;
