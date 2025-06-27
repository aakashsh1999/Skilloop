import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions, // To potentially size the card relative to screen
} from "react-native";
import {
  Feather, // For message-circle, compass icons
  // Assuming other icon libraries are available if needed, like FontAwesome for handshake or diamond emoji
} from "@expo/vector-icons";
// Assuming you have a custom Button or ActionButton component you like,
// but we'll style Touchables directly to match the image closely.

const { width } = Dimensions.get("window");

// Example prop types for clarity
interface UserInfo {
  avatar: string; // URL of the avatar image
  name: string;
  role: string;
}

interface SharedItem {
  type: "skill" | "location" | "interest" | string; // Or specific types like 'business growth', 'New York', etc.
  value: string; // The text displayed in the badge
}

interface MatchCardProps {
  isVisible: boolean; // To control visibility (if used in a Modal)
  matchData: {
    currentUser: UserInfo;
    matchedUser: UserInfo;
    sharedItems: SharedItem[];
    matchText?: string; // Optional custom text like "Time to turn..."
  };
  onMessageNow: (matchedUserId: string) => void; // Function called when Message button is pressed
  onContinueExploring: () => void; // Function called when Explore button is pressed (likely closes the card)
  // Add other props like matchedUserId if needed by onMessageNow
}

// You might wrap this component in a Modal and an overlay View in the parent
const MatchCard: React.FC<MatchCardProps> = ({
  matchData,
  onMessageNow,
  onContinueExploring,
}) => {
  // Use mock data structure if matchData is null or incomplete for development
  const mockMatchData = {
    currentUser: {
      avatar: "https://via.placeholder.com/150?text=You", // Placeholder
      name: "You", // Use actual current user name from your state
      role: "Your Role", // Use actual current user role
    },
    matchedUser: {
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Example Matched User Image
      name: "Erik",
      role: "App Developer",
    },
    sharedItems: [
      { type: "skill", value: "📈 business growth" }, // Using emojis directly
      { type: "location", value: "📍 New York" },
      { type: "skill", value: "🚀 Startup Building" },
      // Add more shared items as needed
    ],
    matchText: "Time to turn mutual respect into mutual projects.",
  };

  // Use real data if available, otherwise fallback to mock
  const { currentUser, matchedUser, sharedItems, matchText } =
    matchData || mockMatchData;

  // Ensure required data is present before rendering
  if (!currentUser || !matchedUser) {
    console.warn("MatchCard: Missing currentUser or matchedUser data.");
    return null; // Or render a minimal placeholder/error state
  }

  return (
    // This View could be inside a Modal or other overlay container
    <View style={styles.cardContainer}>
      {/* Top Badge */}
      <View style={styles.topBadgeContainer}>
        <Text style={styles.topBadgeText}>
          🤝 Great minds swipe alike! {/* Handshake emoji + Text */}
        </Text>
      </View>
      {/* Heading */}
      <Text style={styles.heading}>
        You and {matchedUser.name} liked each other's profile.
      </Text>
      {/* Avatar Row */}
      <View style={styles.avatarRow}>
        {/* Current User Info */}
        <View style={styles.userInfo}>
          <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.role}>{currentUser.role}</Text>
        </View>
        {/* Handshake Emoji/Icon */}
        <Text style={styles.handshakeEmoji}>🤝</Text>{" "}
        {/* Using handshake emoji */}
        {/* Matched User Info */}
        <View style={styles.userInfo}>
          <Image source={{ uri: matchedUser.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{matchedUser.name}</Text>
          <Text style={styles.role}>{matchedUser.role}</Text>
        </View>
      </View>
      {/* Divider */}
      <View style={styles.divider} />
      {/* Shared Items Section */}
      <Text style={styles.shareLabel}>You both share</Text>{" "}
      {/* Underlined label */}
      {/* Shared Badges */}
      <View style={styles.sharedBadgesContainer}>
        {sharedItems.map((item, index) => (
          <View key={index} style={styles.badge}>
            {" "}
            {/* Badge view */}
            <Text style={styles.badgeText}>{item.value}</Text>{" "}
            {/* Badge text */}
          </View>
        ))}
      </View>
      {/* Description Text */}
      <Text style={styles.description}>
        {matchText || "Time to turn mutual respect into mutual projects."}{" "}
        {/* Default or custom text */}
      </Text>
      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Message Now Button */}
        <TouchableOpacity
          style={[styles.buttonBase, styles.messageButton]}
          onPress={() => onMessageNow(matchedUser.name)} // Pass matched user info
        >
          <Text style={[styles.buttonTextBase, styles.messageButtonText]}>
            Message now
          </Text>
          {/* Message bubble icon */}
          <Feather
            name="message-circle"
            size={18}
            color="#000"
            style={styles.buttonIcon}
          />
        </TouchableOpacity>

        {/* Continue Exploring Button */}
        <TouchableOpacity
          style={[styles.buttonBase, styles.exploreButton]}
          onPress={onContinueExploring}
        >
          <Text style={[styles.buttonTextBase, styles.exploreButtonText]}>
            Continue exploring
          </Text>
          {/* Compass or location icon */}
          <Feather
            name="compass"
            size={18}
            color="#000"
            style={styles.buttonIcon}
          />{" "}
          {/* Using Feather compass */}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF", // White background
    borderRadius: 20, // Rounded corners for the card
    padding: 24, // Inner padding
    marginHorizontal: 20, // Space from screen edges
    // Positioning and shadow - assuming this is an overlay
    position: "absolute", // Can be absolute or managed by modal/parent layout
    top: "10%", // Example positioning, adjust as needed
    alignSelf: "center", // Center horizontally
    width: width * 0.9, // Card width (e.g., 90% of screen width)
    maxWidth: 400, // Max width for larger screens
    shadowColor: "#000", // Shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5, // Android elevation
  },
  topBadgeContainer: {
    backgroundColor: "#FFEDD5", // Light orange background
    borderColor: "#F97316", // Border color (matches orange button border)
    borderWidth: 1,
    borderRadius: 20, // Rounded shape
    paddingVertical: 8, // Inner vertical padding
    paddingHorizontal: 16, // Inner horizontal padding
    alignSelf: "center", // Center the badge horizontally
    marginBottom: 20, // Space below the badge
  },
  topBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333", // Dark text color
  },
  heading: {
    fontSize: 18,
    fontWeight: "normal", // Not bold in the image
    color: "#333", // Dark text
    textAlign: "center", // Center text
    marginBottom: 20, // Space below heading
  },
  avatarRow: {
    flexDirection: "row",
    justifyContent: "center", // Center avatars and handshake
    alignItems: "center", // Align vertically
    marginBottom: 20, // Space below avatar row
  },
  userInfo: {
    alignItems: "center", // Center name and role below avatar
    marginHorizontal: 10, // Space around user info blocks
  },
  avatar: {
    width: 80, // Avatar size
    height: 80,
    borderRadius: 40, // Circular avatar
    backgroundColor: "#eee", // Placeholder background
    marginBottom: 8, // Space below avatar
    borderWidth: 2, // Subtle border
    borderColor: "#ccc",
  },
  // Border colors for avatars in image look like #E0F2F7 (light green) and #FFEDD5 (light orange)
  // You could pass different border styles based on user data if needed:
  /*
   avatar: { ..., borderColor: isCurrentUser ? '#E0F2F7' : '#FFEDD5' }
   */

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 4, // Space below name
  },
  role: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  handshakeEmoji: {
    fontSize: 30, // Size of the emoji
    marginHorizontal: 5, // Space around emoji
  },
  divider: {
    height: 1,
    backgroundColor: "#eee", // Light gray divider
    marginVertical: 15, // Space above and below divider
  },
  shareLabel: {
    fontSize: 14,
    fontWeight: "bold", // Bold in image
    color: "#333", // Dark text
    textAlign: "center", // Center the label
    textDecorationLine: "underline", // Underlined
    marginBottom: 15, // Space below label
  },
  sharedBadgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Allow badges to wrap to next line
    justifyContent: "center", // Center the badges horizontally
    gap: 8, // Space between badges (RN 0.71+), or use margin
    marginBottom: 20, // Space below badges
  },
  badge: {
    backgroundColor: "#E5E7EB", // Default badge background (light gray)
    borderColor: "#D1D5DB", // Default badge border
    borderWidth: 1,
    borderRadius: 15, // Rounded corners for badges
    paddingVertical: 6, // Inner vertical padding
    paddingHorizontal: 12, // Inner horizontal padding
  },
  // Specific badge colors based on the image examples
  // You'd apply these conditionally based on shared item type/value
  /*
  badge: {
      ...,
      backgroundColor: item.type === 'location' ? '#E0F2F7' : (item.value.includes('business') ? '#E5E7EB' : '#BFDBFE'), // Example logic
      borderColor: item.type === 'location' ? '#007B82' : (item.value.includes('business') ? '#A9A9A9' : '#3B82F6'), // Example logic
  }
  */
  badgeText: {
    fontSize: 13,
    color: "#333", // Dark text
    fontWeight: "500",
  },
  description: {
    fontSize: 14, // Smaller font size
    color: "#666", // Gray text
    fontStyle: "italic", // Italic style
    textAlign: "center", // Center text
    marginVertical: 15, // Space above and below
  },
  buttonsContainer: {
    alignItems: "center", // Center buttons horizontally
    marginTop: 10, // Space above buttons
  },
  buttonBase: {
    flexDirection: "row", // Arrange icon and text horizontally
    alignItems: "center", // Align icon and text vertically
    justifyContent: "center", // Center content horizontally
    width: "100%", // Take full width of container
    paddingVertical: 12, // Inner vertical padding
    paddingHorizontal: 24, // Inner horizontal padding
    borderRadius: 30, // Fully rounded shape
    borderWidth: 1, // Border
    marginBottom: 12, // Space between buttons
  },
  messageButton: {
    backgroundColor: "#FFFFFF", // White background
    borderColor: "#333", // Dark border (close to black)
  },
  exploreButton: {
    backgroundColor: "#FFFFFF", // White background
    borderColor: "#333", // Dark border (close to black)
  },
  buttonTextBase: {
    fontSize: 16,
    fontWeight: "600", // Semi-bold
    marginRight: 8, // Space between text and icon
  },
  messageButtonText: {
    color: "#000", // Black text
  },
  exploreButtonText: {
    color: "#000", // Black text
  },
  buttonIcon: {
    // Size and color set directly on Feather component
  },
});

export default MatchCard;
