import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";

const FloatingButtons = ({ onDislike, onLike }) => {
  return (
    <View style={styles.floatingContainer}>
      <TouchableOpacity
        onPress={onDislike} //
        style={styles.fabButton}
      >
        <Ionicons name="close-outline" size={40} color="black" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onLike} style={styles.fabButton}>
        <FontAwesome6 name="handshake" size={30} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    top: "50%", // adjust as needed
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    zIndex: 1000,
  },
  fabButton: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: "50%",
    elevation: 10,
    width: 80,
    height: 80,
    borderWidth: 1,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3.5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FloatingButtons;
