import Icon from "@expo/vector-icons/Feather"; // Using Feather as provided
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View, StatusBar } from "react-native"; // Added StatusBar for potential barStyle adjustment if needed

// Keeping the interface as is, though title/subtitle won't be rendered in the header bar itself.
interface PageHeaderProps {
  title?: string; // Optional, as it won't be displayed in the header bar
  subtitle?: string; // Optional, as it won't be displayed in the header bar
  currentStep?: number; // 1-indexed active step (e.g., 1 for the first bar)
  totalSteps?: number;
  onBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
}) => {
  const navigation = useNavigation();
  const router = useRouter();

  const handleBack = () => {
    if (currentStep === 0) {
      router.push("/login");
    }
    // Check if navigation can go back to prevent crashes on initial screen
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.warn("Cannot go back from this screen.");
      // Optionally, navigate to a default screen if there's no history
      // navigation.navigate('HomeScreen');
    }
  };

  const renderProgressBars = () => {
    if (
      currentStep === undefined ||
      totalSteps === undefined ||
      totalSteps === 0
    ) {
      return null;
    }

    const bars = [];
    for (let i = 0; i < totalSteps; i++) {
      // `currentStep` is 1-indexed, so `i + 1` matches `currentStep` for the active bar
      const isActive = i + 1 === currentStep;
      bars.push(
        <View
          key={i}
          style={[
            styles.progressBar,
            isActive ? styles.progressBarFilled : styles.progressBarEmpty,
          ]}
        />
      );
    }
    return <View style={styles.progressContainer}>{bars}</View>;
  };

  return (
    <View style={styles.headerBarContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        {/* Using Feather's arrow-left which looks similar to the image's arrow */}
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      {renderProgressBars()}

      <View style={styles.rightSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Distributes items evenly
    height: 56, // Standard header height
    backgroundColor: "white",
    paddingHorizontal: 16, // Padding on the sides as in the image
    marginBottom: 20,
    // borderBottomWidth: StyleSheet.hairlineWidth, // Subtle line at the bottom
    borderBottomColor: "#E0E0E0", // Light gray border
  },
  backButton: {
    paddingRight: 16, // Space between arrow and progress bars
    // No vertical margin needed as it's part of the horizontal flow
  },
  progressContainer: {
    flexDirection: "row",
    flex: 1, // Allows the progress container to take up available space
    justifyContent: "center", // Centers the progress bars within its flex container
  },
  progressBar: {
    height: 4, // Height of the bar
    width: 30, // Width of each bar as per image
    borderRadius: 2, // Rounded ends (half of height for perfect half circle)
    marginHorizontal: 4, // Space between bars
  },
  progressBarFilled: {
    backgroundColor: "black", // Color for the filled bar
  },
  progressBarEmpty: {
    backgroundColor: "#E0E0E0", // Light gray color for empty bars (similar to gray-200 but lighter)
  },
  rightSpacer: {
    width: 24 + 16, // Approximate width of the Feather icon (24) plus padding (16) to balance the back button
  },
  // The following styles for title/subtitle are retained in the StyleSheet
  // but are not used in the JSX of the `headerBarContainer` itself.
  // They would be used for content *below* this header bar.
  // If `PageHeader` is only for the top bar, these can be removed.
  // container: { // This was the original main container, now headerBarContainer takes its place
  //   marginBottom: 24,
  // },
  // title: {
  //   fontSize: 28,
  //   fontWeight: "bold",
  //   marginBottom: 8,
  // },
  // subtitle: {
  //   fontSize: 16,
  //   color: "#6b7280", // gray-500
  //   marginBottom: 24,
  // },
});

export default PageHeader;
