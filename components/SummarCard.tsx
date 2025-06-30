import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
  Alert,
} from "react-native";
import {
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { ProfileSummaryData } from "@/components/SummarCard";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system";

interface BusinessCardDisplayProps {
  profileData: ProfileSummaryData;
  canFlip?: boolean;
  onApprove?: (userId: string) => Promise<any>;
  onChatPress: (profile: ProfileSummaryData) => void;
}

const getSocialIcon = (type: string) => {
  console.log(type, "asdfd");
  switch (type.toLowerCase()) {
    case "linkedin":
      return {
        img: require("../assets/linked.png"),
        name: "linkedin",
        color: "#0A66C2",
      };
    case "instagram":
      return {
        img: require("../assets/instagram.png"),
        name: "instagram",
        color: "#E4405F",
      };

    case "figma":
      return {
        img: require("../assets/figma.png"),

        name: "whatsapp",
        color: "#25D366",
      };
    case "upwork":
      return {
        img: require("../assets/fiver.png"),
        name: "upwork",
        color: "#64BF33",
      };
    case "dribbble":
      return {
        img: require("../assets/dribble.png"),
        name: "dribbble",
        color: "#EA4C89",
      };
    default:
      return null;
  }
};

const handleLinkPress = async (url: string) => {
  console.log(url, "asdasdfdfsdfd");
  if (!url) {
    Alert.alert("Invalid Link", "URL is empty or invalid.");
    return;
  }
  try {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Cannot Open Link", `Could not open the URL: ${url}`);
    }
  } catch (error) {
    Alert.alert("Error", `An error occurred: ${(error as Error).message}`);
  }
};

const BusinessCardDisplay: React.FC<BusinessCardDisplayProps> = ({
  profileData,
  canFlip = true,
  onApprove,
  onChatPress,
}) => {
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const isFlipped = useRef(false);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const handleCardFlip = () => {
    if (!canFlip) return;
    const toValue = isFlipped.current ? 0 : 180;
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => {
      isFlipped.current = !isFlipped.current;
    });
  };

  const showApproveButton =
    onApprove && !profileData?.matched && !profileData?.isApproved;
  const showChatButton = profileData?.matched || profileData?.isApproved;

  const handleApproveAction = async () => {
    if (onApprove) {
      try {
        const result = await onApprove(profileData.id);
        if (result?.matched) {
          Alert.alert("Congratulations!", "It's a match! You can now chat.");
        } else if (result?.message) {
          Alert.alert("Approval Sent", result.message);
        }
      } catch (error) {
        Alert.alert("Error", (error as Error).message || "Failed to approve.");
      }
    }
  };

  const animatedFrontStyle = [
    styles.card,
    { transform: [{ rotateY: frontInterpolate }] },
  ];
  const animatedBackStyle = [
    styles.card,
    { transform: [{ rotateY: backInterpolate }] },
  ];

  const cardRef = useRef<View>(null);
  const frontCardRef = useRef<View>(null); // New ref for the front card
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (!permissionResponse?.granted) {
      requestPermission();
    }
  }, []);

  const handleDownloadCard = async () => {
    if (!frontCardRef.current) {
      // Use frontCardRef for downloading the front card
      Alert.alert("Error", "Could not get reference to the card.");
      return;
    }
    try {
      const uri = await captureRef(frontCardRef, {
        // Capture the front card
        format: "png",
        quality: 1,
      });
      const asset = await MediaLibrary.createAssetAsync(uri);
      Alert.alert("Downloaded", "Business card saved to gallery!");
    } catch (error) {
      Alert.alert("Error", "Could not download the card.");
      console.error("Download card error:", error);
    }
  };

  const handleShareCard = async () => {
    if (!frontCardRef.current) {
      // Assuming you've updated to use frontCardRef
      Alert.alert("Error", "Could not get reference to the card.");
      return;
    }
    try {
      const uri = await captureRef(frontCardRef, {
        format: "png",
        quality: 1,
      });
      await Sharing.shareAsync(uri); // This is the key line
    } catch (error) {
      Alert.alert("Error", "Could not share the card.");
      console.error("Share card error:", error);
    }
  };
  return (
    <View style={{ width: "100%" }}>
      <View style={styles.cardWrapper}>
        {/* Flip Button outside both sides */}
        {canFlip && (
          <TouchableOpacity onPress={handleCardFlip} style={styles.flipButton}>
            <Image
              source={require("./../assets/images/double-arrow.png")}
              style={{
                width: 20,
                height: 20,
                transform: isFlipped ? [{ scaleX: -1 }] : [{ scaleX: 1 }], // Flips to point right
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        {/* Front Side */}
        <Animated.View
          style={[animatedFrontStyle, styles.cardFront]}
          ref={frontCardRef}
        >
          <View style={styles.cardHeader}>
            <Image
              source={{
                uri:
                  profileData.profile_image || "https://via.placeholder.com/80",
              }}
              style={styles.cardAvatar}
            />
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{profileData.name}</Text>
              <Text style={styles.cardTitle}>
                {profileData.business_card?.role || "No title provided"}
              </Text>
              {profileData.business_card?.portfolio && (
                <TouchableOpacity
                  onPress={() =>
                    handleLinkPress(profileData.business_card.portfolio!)
                  }
                >
                  <Text style={styles.portfolioLink}>Website/Portfolio</Text>
                </TouchableOpacity>
              )}
              <View style={{ flexDirection: "row" }}>
                {profileData?.business_card?.socialProfiles?.map(
                  (link, index) => {
                    const iconInfo = getSocialIcon(link.platform);
                    if (!iconInfo) return null;
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleLinkPress(link.url)}
                        style={styles.socialIcon}
                      >
                        <Image
                          source={iconInfo.img}
                          style={{ width: 30, height: 30 }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>
          </View>

          {!canFlip && (
            <View style={styles.cardActionButtons}>
              {showApproveButton && (
                <TouchableOpacity
                  onPress={handleApproveAction}
                  style={[
                    styles.cardActionButton,
                    { backgroundColor: "white" },
                  ]}
                >
                  <Image
                    source={require("./../assets/thumb.png")}
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
              {showChatButton && (
                <TouchableOpacity
                  onPress={() => onChatPress(profileData)}
                  style={[
                    styles.cardActionButton,
                    { backgroundColor: "#e6f7ff" },
                  ]}
                >
                  <Image
                    source={require("./../assets/message.png")}
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>

        {/* Back Side */}
        <Animated.View style={[animatedBackStyle, styles.cardBack]}>
          <View ref={cardRef} style={styles.qrContainer}>
            <QRCode
              value={JSON.stringify({
                name: profileData.name,
                role: profileData.business_card?.role,
                company: profileData.business_card?.company,
                portfolio: profileData.business_card?.portfolio,
                socialProfiles: profileData.business_card?.socialProfiles,
              })} // or a URL to profile
              size={120}
            />
            <View
              style={{
                marginLeft: 30,
              }}
            >
              <Text style={styles.qrLabel}>{profileData.name}</Text>
              <View style={{ flexDirection: "row", marginTop: 16 }}>
                <TouchableOpacity
                  style={[
                    styles.cardActionButton,
                    {
                      width: 100,
                      height: 30,
                      backgroundColor: "white",
                      flexDirection: "row",
                    },
                  ]}
                  onPress={handleShareCard}
                >
                  <Text
                    style={{ color: "black", fontSize: 14, marginRight: 5 }}
                  >
                    Share
                  </Text>
                  <Feather name="external-link" size={20} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cardActionButton,
                    {
                      backgroundColor: "white",
                      marginLeft: 16,
                      width: 30,
                      height: 30,
                    },
                  ]}
                  onPress={handleDownloadCard}
                >
                  <Feather name="download" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text
            style={[
              styles.qrSubLabel,
              {
                position: "absolute",
                bottom: 10,
                fontFamily: "Montserrat",
                marginHorizontal: "auto",
                textDecorationLine: "underline",
                color: "gray",
              },
            ]}
          >
            Scan and Save or Share {profileData.name}'s Card{" "}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: "100%",
    height: 190,
    perspective: 1000,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.58,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 20,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 30,
    borderWidth: 1,
    padding: 20,
    backfaceVisibility: "hidden",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.58,
    shadowRadius: 16,
    elevation: 10,
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

    alignItems: "center",
  },
  cardAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e0e0e0",
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 24,
    fontFamily: "MontserratBold",
    color: "#000",
  },
  cardTitle: {
    fontSize: 18,
    marginVertical: 4,
    color: "#666",
    fontFamily: "Montserrat",
  },

  portfolioLink: {
    fontSize: 16,
    color: "#007AFF",
    fontFamily: "Montserrat",
    textDecorationLine: "underline",
    marginTop: 4,
    fontStyle: "italic",
  },
  socialIcon: {
    marginRight: 12,
    marginTop: 10,
  },
  cardActionButtons: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
    right: 20,
    marginTop: 16,
  },
  cardActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    borderWidth: 1,

    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  qrContainer: {
    flexDirection: "row",
    padding: 30,
    width: "100%",
    justifyContent: "flex-start",
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
    fontSize: 22,
    fontFamily: "MontserratBold",
    color: "#000",
    marginBottom: 4,
  },
  qrSubLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  flipButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: "-50%" }],
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 6,
    elevation: 10,
    zIndex: 999,
  },
});

export default BusinessCardDisplay;
