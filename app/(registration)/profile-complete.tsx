import ActionButton from "@/components/ActionButton";
// import { useProfileStore } from "@/store/useProfileStore"; // Assuming this isn't strictly needed for *displaying* the final screen
// import Icon from "@expo/vector-icons/Feather"; // Not using Feather checkmark in the new design
// import { useNavigation } from "@react-navigation/native"; // Not directly used in render
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView, // Using SafeAreaView for layout
  Image, // Needed for images if not using emojis
  TouchableOpacity, // Needed for button if ActionButton doesn't support custom content
} from "react-native";

// Assuming ActionButton component supports styles and children like:
// <ActionButton style={{...}} onPress={...}>Content with {icon} and Text</ActionButton>
// If ActionButton only takes text, we might need a different button approach or modify ActionButton.
// Let's assume ActionButton can take children for now.

const ProfileComplete = () => {
  // const { profile } = useProfileStore(); // Keep if you need to check profile state
  const router = useRouter();

  // --- Review this useEffect ---
  // If this screen is the final destination *after* successful registration,
  // this useEffect might prevent it from ever showing if completedSteps logic
  // isn't perfectly aligned. For a final success screen, you might remove
  // this redirect logic here and handle entry/exit higher up (e.g., in your _layout.tsx)
  // useEffect(() => {
  //   // Example: If the user is *not* authenticated, redirect to login
  //   // This logic depends heavily on your AuthContext/global state setup
  //   const checkAuth = async () => {
  //      const { data: { session } } = await supabase.auth.getSession(); // Assuming supabase client is available
  //      if (!session) {
  //          router.replace("/login"); // Redirect to login if not authenticated
  //      }
  //   };
  //   checkAuth();
  // }, []);
  // --- End useEffect Review ---

  const handleGoHome = () => {
    // Navigate to your main authenticated screen (e.g., the tabs)
    // Use replace to prevent going back to the completion screen
    router.replace("/login"); // Adjust this route to your actual authenticated home screen
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- Floating Emojis/Images --- */}
        {/* These are positioned absolutely within the container */}
        {/* Using Text for emojis is simpler but appearance can vary across devices.
            Using local Image assets gives more control over appearance. */}
        {/* Let's use Text for emojis first */}
        <Text style={[styles.floatingElement, styles.emojiBook]}>📚</Text>{" "}
        {/* Book emoji */}
        <Text style={[styles.floatingElement, styles.emojiPaper]}>📝</Text>{" "}
        {/* Paper & Pencil emoji */}
        <Text style={[styles.floatingElement, styles.emojiPerson]}>
          🤵
        </Text>{" "}
        {/* Person emoji (using a similar one) */}
        <Text style={[styles.floatingElement, styles.emojiThumbsUp]}>
          👍
        </Text>{" "}
        {/* Thumbs Up emoji */}
        <Text style={[styles.floatingElement, styles.emojiCard]}>💳</Text>{" "}
        {/* Credit Card emoji */}
        <Text style={[styles.floatingElement, styles.emojiCalendar]}>
          📅
        </Text>{" "}
        {/* Calendar emoji (or 🗓️) */}
        <Text style={[styles.floatingElement, styles.emojiPaperclip]}>
          📎
        </Text>{" "}
        {/* Paperclip emoji */}
        <Text style={[styles.floatingElement, styles.emojiFilingCabinet]}>
          🗄️
        </Text>{" "}
        {/* Filing Cabinet emoji */}
        {/* --- Main Content --- */}
        <View style={styles.contentWrapper}>
          {" "}
          {/* Add a wrapper for central content */}
          <Text style={styles.title}>You're all set,{"\n"}Dev!</Text>
          <Text style={styles.subtitle}>
            Your profile is live and ready to shine.
          </Text>
          {/* --- Feature List --- */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔍</Text>
              <Text style={styles.featureText}>Discover skills & projects</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💎</Text>{" "}
              {/* Using diamond emoji */}
              <Text style={styles.featureText}>Match with collaborators</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✉️</Text>
              <Text style={styles.featureText}>Chat, share tasks & grow</Text>
            </View>
          </View>
          {/* --- Go to Home Button --- */}
          {/* Assuming ActionButton can render children */}
          <ActionButton
            onPress={handleGoHome}
            fullWidth // Should take the width of its container
            style={styles.goHomeButton} // Custom styles for the button itself (background, shape)
            // ActionButton might automatically handle textStyle for children Text components
          >
            {/* Content inside button - arranged horizontally */}
            <View style={styles.goHomeButtonContent}>
              <Text style={styles.rocketEmoji}>🚀</Text> {/* Rocket emoji */}
              <Text style={styles.goHomeButtonText}>Go to Home</Text>
            </View>
          </ActionButton>
        </View>{" "}
        {/* End contentWrapper */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white", // Full screen background
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    borderLeftWidth: 4, // Example border width
    borderRightWidth: 4, // Example border width
    borderColor: "#87CEEB", // Light blue border color (SkyBlue, adjust if needed)
    position: "relative", // Needed for absolute positioning of floating elements
    overflow: "hidden", // Clip anything outside the container borders
  },
  contentWrapper: {
    flex: 1, // Allow content to take available space
    paddingHorizontal: 24, // Inner horizontal padding
    paddingTop: 60, // Top padding for the main content block
    alignItems: "flex-start", // Align text and features to the left
    // justifyContent: 'center', // Optional: Center content vertically within the wrapper
  },
  title: {
    fontSize: 34, // Adjust size based on image
    fontWeight: "bold",
    marginBottom: 10, // Space below title
    textAlign: "left",
    lineHeight: 40, // Adjust line height for multi-line title
  },
  subtitle: {
    fontSize: 18, // Adjust size
    color: "#333", // Dark gray text
    textAlign: "left",
    marginBottom: 30, // Space below subtitle
    lineHeight: 24,
  },
  featureList: {
    marginBottom: 40, // Space below features and before button
    alignSelf: "stretch", // Allow the list container to take full width
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12, // Space between items
  },
  featureIcon: {
    fontSize: 20, // Emoji icon size
    marginRight: 10, // Space between icon and text
  },
  featureText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    flexShrink: 1, // Allow text to wrap
  },
  goHomeButton: {
    // ActionButton base styles should handle padding, minHeight, etc.
    backgroundColor: "black", // Black background
    borderRadius: 999, // Full rounded border
    // Ensure ActionButton correctly applies these
  },
  goHomeButtonContent: {
    flexDirection: "row", // Arrange children horizontally
    alignItems: "center", // Vertically align center
    justifyContent: "center", // Center content horizontally within the button
    width: "100%", // Ensure the content view takes full width of the button
  },
  rocketEmoji: {
    fontSize: 20, // Size of the rocket emoji
    marginRight: 10, // Space between emoji and text
  },
  goHomeButtonText: {
    color: "white", // White text color
    fontSize: 18, // Button text size
    fontWeight: "600", // Semi-bold
  },

  // --- Floating Elements Styles ---
  floatingElement: {
    position: "absolute",
    // Adjust fontSize for emojis or width/height for Images
    fontSize: 50, // Example emoji size
    zIndex: 0, // Emojis behind main content
    // Specific positions will override these defaults
  },
  emojiBook: {
    top: 30,
    left: 20,
    transform: [{ rotate: "-15deg" }],
    fontSize: 40,
  }, // Smaller size
  emojiPaper: {
    top: 10,
    right: 30,
    transform: [{ rotate: "10deg" }],
    fontSize: 40,
  }, // Smaller size
  emojiPerson: { top: 80, right: 10, fontSize: 40 }, // Smaller size
  emojiThumbsUp: { top: 200, right: 10, fontSize: 50 },
  emojiCard: {
    top: 500,
    left: 30,
    transform: [{ rotate: "20deg" }],
    fontSize: 50,
  },
  emojiCalendar: { top: 500, right: 30, fontSize: 40 }, // Smaller size
  emojiPaperclip: {
    bottom: 50,
    left: 20,
    transform: [{ rotate: "-30deg" }],
    fontSize: 60,
  }, // Larger size
  emojiFilingCabinet: { bottom: 30, right: 30, fontSize: 50 },
});

export default ProfileComplete;
