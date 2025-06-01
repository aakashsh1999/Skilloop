import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface ActionButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle = [styles.baseButton];
    const variantStyle = styles[`${variant}Button`];
    if (fullWidth) baseStyle.push(styles.fullWidth);
    if (disabled) baseStyle.push(styles.disabledButton);
    return [...baseStyle, variantStyle, style || {}];
  };

  const getTextStyle = (): TextStyle[] => {
    const baseTextStyle = [styles.text];
    const variantText = styles[`${variant}Text`];
    return [...baseTextStyle, variantText, textStyle || {}];
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={getButtonStyle()}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Variants
  primaryButton: {
    backgroundColor: "#fb923c", // orange
  },
  secondaryButton: {
    backgroundColor: "#d1d5db", // gray-300
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    backgroundColor: "transparent",
  },

  // Text colors
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#1f2937", // gray-800
  },
  outlineText: {
    color: "#4b5563", // gray-600
  },
});

export default ActionButton;
