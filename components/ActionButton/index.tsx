import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform, // For platform-specific shadow properties
  ViewStyle, // For type-checking styles
  TextStyle, // For type-checking styles
} from "react-native";

interface ActionButtonProps {
  onPress: () => void;
  children: React.ReactNode; // Can be string, or other elements
  disabled?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean; // Prop to control button width
  style?: ViewStyle; // Allows external style overrides for the button container
  textStyle?: TextStyle; // Allows external style overrides for the button text
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onPress,
  children,
  disabled = false,
  isLoading = false,
  fullWidth = false, // Default to not full width
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7} // Visual feedback on press
      disabled={disabled || isLoading} // Disable if explicitly disabled or currently loading
      style={[
        styles.buttonContainer,
        fullWidth && styles.fullWidthButton, // Apply full width style if prop is true
        disabled && styles.buttonDisabled, // Apply disabled styles
        style, // Apply any custom styles passed in props (last to override)
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" /> // White spinner when loading
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: "#333333", // Light orange/brown color from image
    borderRadius: 20, // Very large border radius to create a pill shape
    borderWidth: 1,
    width: 250,
    marginHorizontal: "auto",
    borderColor: "black", // Black border from image
    height: 56, // Fixed height for a standard large button
    paddingHorizontal: 24, // Padding on sides (adjust as needed for text fit)
    alignItems: "center", // Center text horizontally
    justifyContent: "center", // Center text vertically
    // Shadow properties for iOS and Android
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 }, // Adjust for desired shadow direction/intensity
        shadowOpacity: 0.2, // Subtle shadow
        shadowRadius: 5,
      },
      android: {
        elevation: 8, // Android shadow
      },
    }),
  },
  fullWidthButton: {},
  buttonText: {
    color: "#FFFFFF", // White text color
    fontSize: 18,
    fontWeight: "600", // Semibold for the "Continue" text look
    // If Montserrat font is loaded, use it:
    // fontFamily: "Montserrat-SemiBold", // Or "Montserrat-Regular" depending on desired weight
  },
  buttonDisabled: {
    backgroundColor: "#D3D3D3", // Lighter gray for disabled state
    borderColor: "#A9A9A9", // Darker gray border for disabled
    // No shadow for disabled buttons for cleaner look, or reduce opacity
    ...Platform.select({
      ios: {
        shadowOpacity: 0.05,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export default ActionButton;
