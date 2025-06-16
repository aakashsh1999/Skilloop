"use client";

import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  Share,
  Alert,
} from "react-native";

const BusinessCardScreen = ({ navigation, route }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const profile = route?.params?.profile || {
    name: "Erik Tyler",
    role: "App developer",
    avatar: "/placeholder.svg?height=80&width=80",
    portfolio: "Website/Portfolio",
  };

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;

    Animated.timing(flipAnimation, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start();

    setIsFlipped(!isFlipped);
  };

  const shareCard = async () => {
    try {
      await Share.share({
        message: `Check out ${profile.name}'s business card!`,
        url: "https://example.com/card/erik-tyler",
        title: `${profile.name} - ${profile.role}`,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share card");
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Card</Text>
        <TouchableOpacity onPress={shareCard}>
          <Text style={styles.shareButton}>📤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={flipCard} activeOpacity={0.8}>
          <View style={styles.cardWrapper}>
            {/* Front of Card */}
            <Animated.View
              style={[
                styles.card,
                styles.cardFront,
                { transform: [{ rotateY: frontInterpolate }] },
              ]}
            >
              <View style={styles.cardHeader}>
                <Image
                  source={{ uri: profile.avatar }}
                  style={styles.cardAvatar}
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{profile.name}</Text>
                  <Text style={styles.cardRole}>{profile.role}</Text>
                  <TouchableOpacity>
                    <Text style={styles.portfolioLink}>
                      {profile.portfolio}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.socialIcons}>
                <TouchableOpacity style={styles.socialIcon}>
                  <Text style={styles.socialIconText}>🌐</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <Text style={styles.socialIconText}>📧</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <Text style={styles.socialIconText}>📱</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <Text style={styles.socialIconText}>💼</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Back of Card */}
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                { transform: [{ rotateY: backInterpolate }] },
              ]}
            >
              <View style={styles.qrContainer}>
                <View style={styles.qrCode}>
                  <Text style={styles.qrText}>QR</Text>
                </View>
                <Text style={styles.qrLabel}>{profile.name}</Text>
                <Text style={styles.qrSubLabel}>Scan to share a link card</Text>
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Add card to home screen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Customize your card</Text>
          <Text style={styles.actionButtonIcon}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Edit your card</Text>
          <Text style={styles.actionButtonIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  backButton: {
    fontSize: 24,
    color: "#000",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  shareButton: {
    fontSize: 20,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: 320,
    height: 200,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    backfaceVisibility: "hidden",
  },
  cardFront: {
    justifyContent: "space-between",
  },
  cardBack: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e0e0e0",
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  cardRole: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  portfolioLink: {
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  socialIconText: {
    fontSize: 16,
  },
  qrContainer: {
    alignItems: "center",
  },
  qrCode: {
    width: 80,
    height: 80,
    backgroundColor: "#000",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  qrText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  qrLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  qrSubLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    opacity: 0.5,
  },
  activeNavItem: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 24,
  },
});

export default BusinessCardScreen;
