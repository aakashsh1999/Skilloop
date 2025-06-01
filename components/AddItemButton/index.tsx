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
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
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
    color: "#4B5563",
    fontSize: 16,
  },
});

export default AddItemButton;
