import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from "react-native";

interface FlipCardProps {
  item: {
    id: string;
    logo?: string;
    name?: string;
    issuer?: string;
    year?: number;
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
  };
  type: "experience" | "certification";
}

const FlipCard: React.FC<FlipCardProps> = ({ item, type }) => {
  const [flipped, setFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Interpolations for front and back rotation
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const flipCard = () => {
    if (flipped) {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setFlipped(!flipped);
  };

  const renderCardBackContent = () => {
    if (type === "experience") {
      const endDateText = item.currentlyWorking
        ? "Present"
        : item.endDate || "N/A";
      return (
        <View style={styles.cardBackContent}>
          <Text style={styles.cardBackTitle}>{item.position}</Text>
          <Text style={styles.cardBackSubtitle}>{item.company}</Text>
          <Text
            style={styles.cardBackText}
          >{`${item.startDate} - ${endDateText}`}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.cardBackContent}>
          <Text style={styles.cardBackTitle}>{item.name}</Text>
          <Text style={styles.cardBackSubtitle}>{item.issuer}</Text>
          <Text style={styles.cardBackText}>{item.year}</Text>
        </View>
      );
    }
  };

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };
  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <TouchableOpacity
      onPress={flipCard}
      style={styles.cardContainer}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.flipCard, frontAnimatedStyle]}>
        <View style={styles.logoContainer}>
          {item.logo ? (
            <Image
              source={{ uri: item.logo }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.logoPlaceholder}>
              {item.name ? item.name[0] : item.company ? item.company[0] : "?"}
            </Text>
          )}
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.flipCard, styles.flipCardBack, backAnimatedStyle]}
      >
        {renderCardBackContent()}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: 10,
    marginHorizontal: "1%",
    borderRadius: 50,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  flipCard: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backfaceVisibility: "hidden",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    padding: 10,
  },
  flipCardBack: {
    backgroundColor: "#f0f0f0",
  },
  logoContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "80%",
    height: "80%",
  },
  logoPlaceholder: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ccc",
  },
  cardBackContent: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBackTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  cardBackSubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 2,
  },
  cardBackText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
});

export default FlipCard;
