import React from "react";
import { StyleSheet, Text, View, ViewStyle, TextStyle } from "react-native";

interface QuestionHeaderProps {
  title: string;
  subtitle: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  title,
  subtitle,
  containerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Adding some padding to match typical screen content placement
    paddingHorizontal: 10,
    marginBottom: 24, // Space below this component
  },
  title: {
    fontSize: 28,
    // Use the loaded font family for bold text
    color: "#000", // Black color as in the image
    marginBottom: 8, // Space between title and subtitle
  },
  subtitle: {
    fontSize: 16,
    // Use the loaded font family for regular text
    color: "#6b7280", // A typical gray for descriptive text
  },
});

export default QuestionHeader;
