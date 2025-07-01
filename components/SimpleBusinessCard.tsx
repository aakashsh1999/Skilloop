import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { ProfileSummaryData } from "@/components/SummarCard"; // Assuming this path is correct

interface SimpleBusinessCardProps {
  profileData: ProfileSummaryData;
  onChatPress?: (profile: ProfileSummaryData) => void;
  onApprove?: (userId: string) => Promise<any>;
  showActionButtons?: boolean; // To control if approve/chat buttons are shown
}

const getSocialIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "linkedin":
      return {
        img: require("../assets/linked.png"), // Adjust path as needed
        name: "linkedin",
        color: "#0A66C2",
      };
    case "instagram":
      return {
        img: require("../assets/instagram.png"), // Adjust path as needed
        name: "instagram",
        color: "#E4405F",
      };
    case "figma":
      return {
        img: require("../assets/figma.png"), // Adjust path as needed
        name: "figma", // Corrected name
        color: "#1AB7EA", // Corrected color for Figma
      };
    case "upwork":
      return {
        img: require("../assets/fiver.png"), // Assuming you have an Upwork icon, replaced 'fiver'
        name: "upwork",
        color: "#64BF33",
      };
    case "dribbble":
      return {
        img: require("../assets/dribble.png"), // Assuming you have a Dribbble icon
        name: "dribbble",
        color: "#EA4C89",
      };
    default:
      return null;
  }
};

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
    Alert.alert("Error", `An error occurred: ${(error as Error).message}`);
  }
};

const SimpleBusinessCard: React.FC<SimpleBusinessCardProps> = ({
  profileData,
  onChatPress,
  onApprove,
  showActionButtons = false,
}) => {
  console.log(profileData, "adfddfs");
  const showApproveButton =
    onApprove && !profileData?.matched && !profileData?.isApproved;
  const showChatButton = profileData?.matched || profileData?.isApproved;

  const handleApproveAction = async () => {
    if (onApprove) {
      try {
        const result = await onApprove(profileData.id);
        if (result?.matched) {
          Alert.alert("Congratulations!", "It's a match! You can now chat.");
        } else if (result?.message) {
          Alert.alert("Approval Sent", result.message);
        }
      } catch (error) {
        Alert.alert("Error", (error as Error).message || "Failed to approve.");
      }
    }
  };

  return (
    // The outer View here is just for styling, the card itself is the inner View
    <View style={styles.cardContainer}>
      <View style={[styles.card, styles.cardFront]}>
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri:
                profileData.profile_image || "https://via.placeholder.com/80",
            }}
            style={styles.cardAvatar}
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{profileData.name}</Text>
            <Text style={styles.cardTitle}>
              {profileData.business_card?.role || "No title provided"}
            </Text>
            {profileData.business_card?.portfolio && (
              <TouchableOpacity
                onPress={() =>
                  handleLinkPress(profileData.business_card.portfolio!)
                }
              >
                <Text style={styles.portfolioLink}>Website/Portfolio</Text>
              </TouchableOpacity>
            )}
            <View style={styles.socialIconsContainer}>
              {profileData?.business_card?.socialProfiles?.map(
                (link, index) => {
                  const iconInfo = getSocialIcon(link.platform);
                  if (!iconInfo) return null;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleLinkPress(link.url)}
                      style={styles.socialIcon}
                    >
                      <Image
                        source={iconInfo.img}
                        style={{ width: 30, height: 30 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>
        </View>

        {showActionButtons && (
          <View style={styles.cardActionButtons}>
            {showApproveButton && (
              <TouchableOpacity
                onPress={handleApproveAction}
                style={[styles.cardActionButton, { backgroundColor: "white" }]}
              >
                <Image
                  source={require("../assets/thumb.png")} // Adjust path as needed
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            {showChatButton && onChatPress && (
              <TouchableOpacity
                onPress={() => onChatPress(profileData)}
                style={[
                  styles.cardActionButton,
                  { backgroundColor: "#e6f7ff" },
                ]}
              >
                <Image
                  source={require("../assets/message.png")} // Adjust path as needed
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// Adjust styles to remove any flip-related properties
const styles = StyleSheet.create({
  cardContainer: {
    // This container is just to give it the same wrapper style as the flippable card
    width: "100%",
    height: 190,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.58,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 20,
  },
  card: {
    // Removed 'position: "absolute"', 'backfaceVisibility: "hidden"', and perspective
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 30,
    borderWidth: 1,
    padding: 20,
    // Removed flip-related shadow properties as the container handles it now
  },
  cardFront: {
    // Removed 'justifyContent: "space-between"' from here, now handled by cardFrontContent
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e0e0e0",
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 24,
    fontFamily: "MontserratBold",
    color: "#000",
  },
  cardTitle: {
    fontSize: 18,
    marginVertical: 4,
    color: "#666",
    fontFamily: "Montserrat",
  },
  portfolioLink: {
    fontSize: 16,
    color: "#007AFF",
    fontFamily: "Montserrat",
    textDecorationLine: "underline",
    marginTop: 4,
    fontStyle: "italic",
  },
  socialIconsContainer: {
    flexDirection: "row", // Ensure social icons are in a row
    marginTop: 8, // Add a bit of spacing
  },
  socialIcon: {
    marginRight: 12,
    // marginTop: 10, // Removed to be consistent with socialIconsContainer
  },
  cardActionButtons: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
    right: 20,
    marginTop: 16, // This margin might be redundant if position: 'absolute' handles spacing
  },
  cardActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SimpleBusinessCard;
