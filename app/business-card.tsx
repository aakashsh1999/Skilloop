"use client";

import BusinessCardDisplay from "@/components/SummarCard";
import { useRouter } from "expo-router";
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
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
  Platform,
  StatusBar,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons"; //

const BusinessCardScreen = () => {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const { userData } = useLocalSearchParams();
  const profile = JSON.parse(userData as string);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("./../assets/images/double-arrow.png")}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Card</Text>
        <Image
          source={require("./../assets/images/Card.png")}
          style={{ width: 20, height: 20, marginLeft: 5 }}
          resizeMode="contain"
        />
      </View>

      <View style={styles.cardContainer}>
        <BusinessCardDisplay
          profileData={profile}
          flipAnimation={flipAnimation}
          isFlipped={isFlipped}
          canFlip={true}
          onPressFlip={() => setIsFlipped(!isFlipped)}
          onChatPress={() => {}}
          onApprove={() => console.log("approve")}
        />
      </View>

      <View
        style={{
          width: "95%",
          justifyContent: "center",
          alignSelf: "center",
          height: 1,
          backgroundColor: "black",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 4,
        }}
      ></View>

      <View style={[styles.actionButtons]}>
        <CardActions />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    // paddingVertical: 15,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#fff",
  },
  backButton: {
    fontSize: 24,
    color: "#000",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "MontserratBold",
    marginLeft: 20,
    color: "#000",
  },
  shareButton: {
    fontSize: 20,
  },
  cardContainer: {
    height: 300,
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
    width: "auto",
    flex: 1,
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
    width: "auto",
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

const CardActions = () => {
  return (
    <View style={styles2.container}>
      {/* Button 1: Add card to home screen */}
      <TouchableOpacity style={styles2.addButton}>
        <Text style={styles2.addButtonText}>Add card to home screen</Text>
      </TouchableOpacity>

      {/* Button 2: Customize your card */}
      <TouchableOpacity style={styles2.customizeButton}>
        <Text style={styles2.customizeButtonText}>Customize your card </Text>
        <Image
          source={require("./../assets/images/pen1.png")}
          style={{ width: 20, height: 20 }}
          resizeMode="contain"
        />
        {/* A blue pencil icon */}
      </TouchableOpacity>

      {/* Button 3: Edit your card */}
      <TouchableOpacity style={styles2.editButton}>
        <Text style={styles2.editButtonText}>Edit your card </Text>
        <Image
          source={require("./../assets/images/pn2.png")}
          style={{ width: 20, height: 20 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles2 = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center", // Center align the buttons horizontally
    backgroundColor: "#fff", // Or your screen's background color
  },
  // Style for the black 'Add card' button
  addButton: {
    backgroundColor: "#000",
    borderRadius: 20, // Large border radius for pill shape
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 30,
    width: "90%", // Adjust width as needed
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "MontserratBold",
  },
  // Style for the 'Customize' button
  customizeButton: {
    flexDirection: "row", // Arrange text and icon in a row
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#BFD5CD40", // Light gray background
    borderWidth: 1,
    borderColor: "black", // Light gray border
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "70%",
    marginBottom: 15,
  },
  customizeButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "MontserratBold",
  },
  // Style for the 'Edit' button
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6D3BD40", // Very light pink/orange background
    borderWidth: 1,
    borderColor: "black", // Light pink/orange border
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "70%",
  },
  editButtonText: {
    fontFamily: "MontserratBold",

    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
});
