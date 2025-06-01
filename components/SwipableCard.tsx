import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type SwipeDirection = "left" | "right";

type SwipeableCardProps<T> = {
  cards: T[];
  renderCard: (card: T) => React.ReactNode;
  onSwipe?: (card: T, direction: SwipeDirection) => void;
  cardStyle?: ViewStyle;
};

export default function SwipeableCard<T>({
  cards: initialCards,
  renderCard,
  onSwipe,
  cardStyle,
}: SwipeableCardProps<T>) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [cards, setCards] = useState(initialCards);

  // Sync internal cards state if prop changes
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 100) {
        swipe("right");
      } else if (gesture.dx < -100) {
        swipe("left");
      } else {
        resetPosition();
      }
    },
  });

  const swipe = (direction: SwipeDirection) => {
    const x = direction === "right" ? 500 : -500;

    Animated.timing(pan, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      const swipedCard = cards[0];
      setCards((prev) => prev.slice(1));
      pan.setValue({ x: 0, y: 0 });

      if (onSwipe) {
        onSwipe(swipedCard, direction);
      }
    });
  };

  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["-10deg", "0deg", "10deg"],
  });

  // Render cards in reverse order so top card is on top visually
  return (
    <View style={styles.container}>
      {[...cards].reverse().map((card, revIndex) => {
        const index = cards.length - 1 - revIndex;

        if (index === 0) {
          // Top card with panHandlers and animation
          return (
            <Animated.View
              key={
                typeof card === "object" && "id" in card
                  ? (card as any).id
                  : index
              }
              style={[
                styles.card,
                cardStyle,
                {
                  zIndex: 1000,
                  transform: [
                    { translateX: pan.x },
                    { translateY: pan.y },
                    { rotate },
                  ],
                },
              ]}
              {...panResponder.panHandlers}
            >
              {renderCard(card)}
            </Animated.View>
          );
        } else {
          // Cards below with vertical offset, no panHandlers
          return (
            <View
              key={
                typeof card === "object" && "id" in card
                  ? (card as any).id
                  : index
              }
              style={[
                styles.card,
                cardStyle,
                {
                  position: "relative", // relative so they stack vertically
                  zIndex: -index,
                },
              ]}
            >
              {renderCard(card)}
            </View>
          );
        }
      })}
      {cards.length === 0 && (
        <View style={styles.noMoreCards}>
          <Text
            style={{
              color: "black",
            }}
          >
            No more cards
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    padding: 20,
  },
  noMoreCards: {
    justifyContent: "center",
    alignItems: "center",
    height: 400,
  },
});
