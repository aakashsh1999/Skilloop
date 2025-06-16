import Icon from "@expo/vector-icons/Feather.js";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AddItemButtonProps {
  onPress: () => void;
  label: string;
  style?: object;
}

const AddItemButton: React.FC<AddItemButtonProps> = ({
  onPress,
  label,
  style,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <View style={styles.content}>
        <Icon name="plus" size={20} color="#6B7280" style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 12,
    // Removed width: "80%" and marginHorizontal: "auto" as they don't work for alignSelf
    alignSelf: "center", // Center the button horizontally
    width: "90%", // Adjust width as needed
    borderColor: "#ccc",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
  },
  label: {
    color: "#4B5563", // Gray color
    fontSize: 16,
    fontFamily: "Montserrat",
    fontWeight: "500",
  },
});

export default AddItemButton;
