import Icon from "@expo/vector-icons/Feather";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ItemCardProps {
  logo?: string;
  logoPlaceholder?: string;
  title: string;
  subtitle: string;
  onRemove?: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  logo,
  logoPlaceholder,
  title,
  subtitle,
  onRemove,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.logoContainer}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.logoImage} />
        ) : (
          <Text style={styles.logoPlaceholder}>
            {(logoPlaceholder || title[0]).toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {onRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Icon name="x" size={16} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 8,
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoPlaceholder: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9CA3AF",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "500",
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
});

export default ItemCard;
