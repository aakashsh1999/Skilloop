import React, {
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  ComponentProps, // Re-import ComponentProps
} from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
  Animated,
  Alert,
} from "react-native";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import FlipCard from "./FlipCard";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.35;
const SWIPE_OUT_DURATION = 250;

// Use the provided URL for all images
const UNIVERSAL_IMAGE_URL =
  "https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDBBMEhxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D";

type IconNameType<T extends React.ComponentType<any>> =
  ComponentProps<T>["name"];

type SocialIconInfo =
  | {
      Component: typeof FontAwesome;
      name: IconNameType<typeof FontAwesome>;
      color: string;
    }
  | {
      Component: typeof Feather;
      name: IconNameType<typeof Feather>;
      color: string;
    }
  | {
      Component: typeof MaterialCommunityIcons;
      name: IconNameType<typeof MaterialCommunityIcons>;
      color: string;
    };

// Helper function to get the correct icon component and name for social links
const getSocialIcon = (
  type: "linkedin" | "instagram" | "website" | "email" | "behance"
): SocialIconInfo | null => {
  switch (type) {
    case "linkedin":
      return { Component: FontAwesome, name: "linkedin", color: "#0A66C2" };
    case "instagram":
      return { Component: FontAwesome, name: "instagram", color: "#E4405F" };
    case "website":
      return { Component: Feather, name: "globe", color: "#555" };
    case "email":
      return { Component: Feather, name: "mail", color: "#555" };
    case "behance":
      return {
        Component: MaterialCommunityIcons,
        name: "behance",
        color: "#1769FF",
      };
    default:
      return null;
  }
};

interface UserCardProps {
  userData: Record<string, any>; // The current user profile data
  onSwipe: (type: "like" | "dislike", userId: string) => void; // Callback when a swipe is registered
  onCardRemoved: (userId: string) => void; // Callback when card animates off screen
  // Add other props for loading, error etc. if needed
}

const UserCard = React.forwardRef<any, UserCardProps>(
  ({ userData, onSwipe, onCardRemoved }, ref) => {
    const position = useRef(new Animated.ValueXY()).current;
    const scale = useRef(new Animated.Value(1)).current;
    const [isScrolling, setIsScrolling] = useState(false); // New state to track scrolling

    useEffect(() => {
      position.setValue({ x: 0, y: 0 });
      scale.setValue(1);
    }, [userData]);

    useImperativeHandle(ref, () => ({
      forceSwipe: (type: "like" | "dislike") => {
        forceSwipeInternal(type);
      },
    }));

    const handleLinkPress = async (url: string) => {
      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert(`Don't know how to open this link: ${url}`);
        }
      }
    };

    const renderLogoItem = useCallback(
      ({ item, type }: { item: any; type: "experience" | "certification" }) => (
        <FlipCard item={item} type={type} />
      ),
      []
    );

    const likeOpacity = position.x.interpolate({
      inputRange: [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
      outputRange: [0, 0.5, 1],
      extrapolate: "clamp",
    });

    const dislikeOpacity = position.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.5, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: "clamp",
    });

    // --- PanResponder Logic ---
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isScrolling, // Only allow swipe if not scrolling
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // If scrolling, don't allow swipe gesture
          if (isScrolling) {
            return false;
          }
          // Only trigger pan responder for horizontal movement (swiping)
          // Adjust the threshold to make it less sensitive to vertical movement
          return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2; // Increased multiplier
        },
        onPanResponderGrant: () => {
          Animated.spring(scale, {
            toValue: 0.98,
            friction: 5,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderMove: (event, gestureState) => {
          position.setValue({ x: gestureState.dx, y: gestureState.dy / 3 });
        },
        onPanResponderRelease: (event, gestureState) => {
          Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }).start();

          if (gestureState.dx > SWIPE_THRESHOLD) {
            forceSwipeInternal("like");
          } else if (gestureState.dx < -SWIPE_THRESHOLD) {
            forceSwipeInternal("dislike");
          } else {
            resetPosition();
          }
        },
      })
    ).current;

    if (!userData) {
      return (
        <View style={styles.cardPlaceholder}>
          <Text>No user data to display. Please refresh.</Text>
        </View>
      );
    }

    const displayData = userData.user;
    const businessCard = userData.business_card || {};

    const rotate = position.x.interpolate({
      inputRange: [-width / 2, 0, width / 2],
      outputRange: ["-12deg", "0deg", "12deg"],
      extrapolate: "clamp",
    });

    const animatedCardStyle = {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { rotate },
        { scale },
      ],
    };

    const forceSwipeInternal = (direction: "like" | "dislike") => {
      const x = direction === "like" ? width * 1.5 : -width * 1.5;

      Animated.parallel([
        Animated.timing(position, {
          toValue: { x, y: 0 },
          duration: SWIPE_OUT_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: direction === "like" ? 1.05 : 0.95,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onSwipe(direction, userData.id);
        onCardRemoved(userData.id);
        position.setValue({ x: 0, y: 0 });
        scale.setValue(1);
      });
    };

    const resetPosition = () => {
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <View style={styles.cardContainer}>
        {/* LIKE indicator overlay */}
        <Animated.View
          style={[
            styles.overlayIndicator,
            styles.likeIndicator,
            { opacity: likeOpacity },
          ]}
        >
          <AntDesign name="heart" size={80} color="#4CD964" />
          <Text style={styles.overlayText}>LIKE</Text>
        </Animated.View>

        {/* DISLIKE indicator overlay */}
        <Animated.View
          style={[
            styles.overlayIndicator,
            styles.dislikeIndicator,
            { opacity: dislikeOpacity },
          ]}
        >
          <AntDesign name="close" size={80} color="#FF3B30" />
          <Text style={[styles.overlayText, { color: "#FF3B30" }]}>NOPE</Text>
        </Animated.View>

        <Animated.View
          style={[styles.animatedCard, animatedCardStyle]}
          {...panResponder.panHandlers}
        >
          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            // Event handlers to manage scrolling state
            onScrollBeginDrag={() => setIsScrolling(true)}
            onScrollEndDrag={() => setIsScrolling(false)}
            onMomentumScrollEnd={() => setIsScrolling(false)}
            scrollEventThrottle={16} // Important for performance
          >
            {/* ... (rest of your UserCard content) ... */}

            {/* Profile Name */}
            <Text style={styles.userName}>
              {displayData?.full_name || "John Doe"}
            </Text>

            {/* Featured Image 1 */}
            <Image
              source={{
                uri: displayData?.profile_images?.[0] || UNIVERSAL_IMAGE_URL,
              }}
              style={styles.featuredImage}
              resizeMode="cover"
            />

            {/* Engagement Buttons/Indicators */}
            <View style={styles.engagementButtons}>
              <View style={styles.engagementButton}>
                <Feather
                  name="calendar"
                  size={20}
                  color="black"
                  style={{ marginRight: 4 }}
                />
                <Text> </Text>
                <Text style={styles.engagementText}>
                  {displayData?.age || "N/A"}
                </Text>
              </View>
              <View style={styles.engagementButton}>
                <Feather
                  name="user"
                  size={20}
                  color="black"
                  style={{ marginRight: 4 }}
                />
                <Text> </Text>
                <Text style={styles.engagementText}>
                  {displayData?.gender || "N/A"}
                </Text>
              </View>
              <View style={styles.engagementButton}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="black"
                  style={{ marginRight: 4 }}
                />
                <Text> </Text>
                <Text style={styles.engagementText}>
                  {displayData?.location_name || "N/A"}
                </Text>
              </View>
            </View>

            {/* Profile Summary Section (Business Card) */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryJobTitle}>
                  {businessCard?.role || "Role not specified"}
                </Text>
                <Text style={styles.summaryEmploymentStatus}>
                  {businessCard?.company || "Company not specified"}
                </Text>
                {businessCard?.website && (
                  <TouchableOpacity
                    onPress={() => handleLinkPress(businessCard.website)}
                  >
                    <Text style={styles.summaryWebsiteLink}>
                      Website/Portfolio
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Social Icons */}
                <View style={styles.socialAndBriefcaseContainer}>
                  <View style={styles.summarySocialIcons}>
                    {displayData?.social_links?.map(
                      (
                        link: {
                          type:
                            | "linkedin"
                            | "instagram"
                            | "website"
                            | "email"
                            | "behance";
                          url: string;
                        },
                        index: number
                      ) => {
                        const iconInfo = getSocialIcon(link.type);
                        if (!iconInfo) return null;
                        const IconComponent = iconInfo.Component;
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleLinkPress(link.url)}
                            style={styles.socialIcon}
                          >
                            <IconComponent
                              name={iconInfo.name as any} // Cast to any to resolve type error
                              size={20}
                              color={iconInfo.color || "#555"}
                            />
                          </TouchableOpacity>
                        );
                      }
                    )}
                  </View>
                  <View style={styles.briefcaseIconCircle}>
                    <Ionicons
                      name="briefcase-outline"
                      size={20}
                      color="black"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Featured Image 2 */}
            <Image
              source={{
                uri:
                  displayData?.anything_but_professional?.[0] ||
                  UNIVERSAL_IMAGE_URL,
              }}
              style={styles.featuredImage}
              resizeMode="cover"
            />

            {/* Description (Short Bio) */}
            <Text style={styles.descriptionText}>
              {displayData?.short_bio || "No bio available."}
            </Text>

            {/* Featured Image 3 (Placeholder) */}
            <Image
              source={{
                uri:
                  displayData?.anything_but_professional?.[1] ||
                  UNIVERSAL_IMAGE_URL,
              }}
              style={styles.featuredImage}
              resizeMode="cover"
            />

            {/* --- Experience Section --- */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Experience</Text>
              <Text style={styles.sectionCount}>
                {displayData?.work_experience?.length
                  ? `+${displayData.work_experience.length}`
                  : "0"}
              </Text>
            </View>
            <FlatList
              data={displayData?.work_experience || []}
              renderItem={({ item }) =>
                renderLogoItem({ item, type: "experience" })
              }
              keyExtractor={(item, index) => `exp-${item.id || index}`}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.row}
            />

            {/* --- Certification Section --- */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Certification</Text>
              <Text style={styles.sectionCount}>
                {displayData?.certificates?.length
                  ? `+${displayData.certificates.length}`
                  : "0"}
              </Text>
            </View>
            <FlatList
              data={displayData?.certificates || []}
              renderItem={({ item }) =>
                renderLogoItem({ item, type: "certification" })
              }
              keyExtractor={(item, index) => `cert-${item.id || index}`}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.row}
            />

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  cardContainer: {
    width: width,
    height: height,
    marginTop: 80,
    position: "relative", // To position the overlay indicators
  },
  overlayIndicator: {
    position: "absolute",
    top: "10%",
    width: width,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  likeIndicator: {
    right: 0,
  },
  dislikeIndicator: {
    left: 0,
  },
  overlayText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CD964", // Green color for LIKE
    marginTop: 10,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  animatedCard: {
    position: "absolute",
    width: width,
    height: height * 0.9, // Slightly shorter to show there could be more cards under
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20, // More rounded corners for card feel
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5, // Android shadow
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 15,
    width: "95%", // Slightly narrower than parent for visual effect
    alignSelf: "center",
  },
  cardPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
    marginHorizontal: 20,
    height: height * 0.7,
  },
  userName: {
    color: "black",
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 8,
  },
  featuredImage: {
    width: "100%",
    aspectRatio: 1 / 1,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 20,
  },
  engagementButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    marginVertical: 20,
    width: "100%",
  },
  engagementButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  engagementText: {
    fontSize: 15,
    color: "black",
    fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  summaryContent: {
    // No specific styles needed here, flows naturally
  },
  summaryJobTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  summaryEmploymentStatus: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  summaryWebsiteLink: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 12,
  },
  socialAndBriefcaseContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  summarySocialIcons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  socialIcon: {
    marginRight: 10,
    padding: 5,
  },
  briefcaseIconCircle: {
    borderRadius: 100,
    backgroundColor: "#F0F2F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  descriptionText: {
    fontSize: 16,
    marginVertical: 10,
    color: "#333",
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 0,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionCount: {
    fontSize: 16,
    color: "#2E5ED7",
    fontWeight: "bold",
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 0,
    marginBottom: 10,
  },
});

export default UserCard;
