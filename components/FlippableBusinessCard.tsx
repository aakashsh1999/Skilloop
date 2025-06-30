import React, { useRef } from "react";
import { Animated, StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  canFlip?: boolean;
}

const FlipCard: React.FC<FlipCardProps> = ({ front, back, canFlip = true }) => {
  const animation = useRef(new Animated.Value(0)).current;
  const isFlipped = useRef(false);

  const frontInterpolate = animation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const flip = () => {
    if (!canFlip) return;
    Animated.spring(animation, {
      toValue: isFlipped.current ? 0 : 180,
      useNativeDriver: true,
    }).start(() => {
      isFlipped.current = !isFlipped.current;
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.card, { transform: [{ rotateY: frontInterpolate }] }]}
      >
        {front}
        <TouchableOpacity onPress={flip} style={styles.flipButton}>
          <Ionicons name="swap-horizontal" size={24} color="#888" />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View
        style={[
          styles.card,
          styles.back,
          { transform: [{ rotateY: backInterpolate }] },
        ]}
      >
        {back}
        <TouchableOpacity onPress={flip} style={styles.flipButton}>
          <Ionicons name="swap-horizontal" size={24} color="#888" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
    perspective: 1000,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    backfaceVisibility: "hidden",
  },
  back: {
    justifyContent: "center",
  },
  flipButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    zIndex: 1,
  },
});

export default FlipCard;
