import React, {
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  ComponentProps,
  use,
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
  // REMOVE PanResponder
  // PanResponder,
  Animated,
  Alert,
} from "react-native";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  AntDesign, // Assuming AntDesign for heart/close icons
} from "@expo/vector-icons";
// Assuming FlipCard component exists and works with item and type props
import FlipCard from "./FlipCard";

const { width, height } = Dimensions.get("window");
// SWIPE_THRESHOLD is less relevant now, but we can keep it conceptually for opacity transition
const SWIPE_THRESHOLD_CONCEPTUAL = width * 0.5; // Adjust where LIKE/NOPE text reaches full opacity
const SLIDE_OUT_DISTANCE = width * 1.5; // How far off screen the card slides
const SLIDE_OUT_DURATION = 300; // Animation duration

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
      return { Component: Feather, name: "globe", color: "#555" }; // Using Feather for globe
    case "email":
      return { Component: Feather, name: "mail", color: "#555" }; // Using Feather for mail
    case "behance":
      return {
        Component: MaterialCommunityIcons,
        name: "behance",
        color: "#1769FF",
      };
    default:
      return null; // Or return a default/placeholder icon info
  }
};

interface UserCardProps {
  userData: Record<string, any> | null; // Allow null for initial state
  onSwipe: (type: "like" | "dislike", userId: string) => void; // Callback when a swipe is registered
  onCardRemoved: (userId: string) => void; // Callback when card animates off screen
  // Add other props for loading, error etc. if needed
}

const UserCard = React.forwardRef<any, UserCardProps>(
  ({ userData, onSwipe, onCardRemoved }, ref) => {
    const position = useRef(new Animated.ValueXY()).current;
    const scale = useRef(new Animated.Value(1)).current;
    // REMOVE isScrolling state as PanResponder is removed
    // const [isScrolling, setIsScrolling] = useState(false);
    console.log(userData, "dd");

    // Reset position and scale when userData changes (a new card is shown)
    useEffect(() => {
      position.setValue({ x: 0, y: 0 });
      scale.setValue(1);
      console.log("Card mounted/userData changed:", userData?.id); // Debugging log
    }, [userData]);

    // Expose forceSwipe function via ref
    useImperativeHandle(ref, () => ({
      forceSwipe: (type: "like" | "dislike") => {
        forceSwipeInternal(type);
      },
      // Optionally expose other methods if needed
      // reset: () => resetPosition(), // No longer needed as no manual drag
    }));

    const handleLinkPress = async (url?: string) => {
      // Added optional chaining
      if (url) {
        try {
          // Added try-catch for robustness
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          } else {
            Alert.alert(
              `Cannot Open Link`,
              `Don't know how to open this link: ${url}`
            );
          }
        } catch (error) {
          console.error("Error opening link:", error);
          Alert.alert("Error", "Could not open the link.");
        }
      } else {
        Alert.alert("No Link", "No URL provided for this item.");
      }
    };

    const renderLogoItem = useCallback(
      ({ item, type }: { item: any; type: "experience" | "certification" }) => (
        <FlipCard item={item} type={type} />
      ),
      []
    );

    // Opacity interpolation based on horizontal position
    const likeOpacity = position.x.interpolate({
      // Opacity goes from 0 to 1 as the card moves from center (0) to SWIPE_THRESHOLD_CONCEPTUAL (or beyond)
      inputRange: [0, SWIPE_THRESHOLD_CONCEPTUAL],
      outputRange: [0, 1],
      extrapolate: "clamp", // Keep opacity at 1 if it goes beyond the threshold
    });

    const dislikeOpacity = position.x.interpolate({
      // Opacity goes from 0 to 1 as the card moves from center (0) to -SWIPE_THRESHOLD_CONCEPTUAL (or beyond)
      inputRange: [-SWIPE_THRESHOLD_CONCEPTUAL, 0],
      outputRange: [1, 0],
      extrapolate: "clamp", // Keep opacity at 1 if it goes below the negative threshold
    });

    // --- PanResponder Logic (REMOVED) ---
    // const panResponder = useRef(...).current;

    // If no user data, display a placeholder
    if (!userData) {
      return (
        <View style={styles.cardPlaceholder}>
          <Text style={styles.placeholderText}>Loading user data...</Text>
          {/* You might want an ActivityIndicator here too */}
        </View>
      );
    }

    // Destructure nested data with default values
    const displayData = userData.user || {};
    const businessCard = userData.business_card || {};
    const workExperience = userData.work_experience || [];
    const certificates = userData.certificates || [];
    const socialLinks = userData.social_links || []; // Assuming social_links is an array

    // REMOVE rotate interpolation as rotation is not desired
    // const rotate = position.x.interpolate({
    //   inputRange: [-width / 2, 0, width / 2],
    //   outputRange: ["-12deg", "0deg", "12deg"],
    //   extrapolate: "clamp",
    // });

    // Animated card style - includes translation and scale, NO rotation
    const animatedCardStyle = {
      transform: [
        { translateX: position.x },
        { translateY: position.y }, // Keeping vertical movement for the animation origin point
        // REMOVE rotate: rotate,
        { scale: scale }, // Keeping scale effect during animation
      ],
    };

    // Internal function to perform the slide animation
    const forceSwipeInternal = (direction: "like" | "dislike") => {
      // Determine the final X position to slide off-screen
      const x = direction === "like" ? SLIDE_OUT_DISTANCE : -SLIDE_OUT_DISTANCE;

      Animated.parallel([
        // Animate horizontal position
        Animated.timing(position.x, {
          // Animate position.x directly
          toValue: x,
          duration: SLIDE_OUT_DURATION,
          useNativeDriver: true,
        }),
        // Optional: Animate vertical position slightly if desired, or keep it at 0
        Animated.timing(position.y, {
          toValue: 0, // Slide straight horizontally
          duration: SLIDE_OUT_DURATION,
          useNativeDriver: true,
        }),
        // Optional: Animate scale slightly
        Animated.spring(scale, {
          toValue: direction === "like" ? 1.05 : 0.95, // Scale up slightly for like, down for dislike
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Call callbacks after animation finishes
        onSwipe(direction, userData.id);
        // onCardRemoved(userData.id); // This should likely be called AFTER onSwipe
        // And the parent component should remove the card based on the onCardRemoved event

        // Reset position and scale *before* the next card appears
        // The useEffect on userData change already handles this, but resetting here
        // ensures the animation is ready for the *next* card immediately.
        position.setValue({ x: 0, y: 0 });
        scale.setValue(1);

        // NOW call onCardRemoved so the parent knows to remove the card
        // from its state, triggering the next card render (and useEffect reset)
        onCardRemoved(userData.id);
      });
    };

    // REMOVE resetPosition function as it's no longer needed

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
          {/* Using AntDesign Heart for LIKE icon */}
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
          {/* Using AntDesign Close for DISLIKE icon */}
          <AntDesign name="close" size={80} color="#FF3B30" />
          <Text style={[styles.overlayText, { color: "#FF3B30" }]}>NOPE</Text>
        </Animated.View>

        {/* The animated card View - PanHandlers REMOVED */}
        <Animated.View style={[styles.animatedCard, animatedCardStyle]}>
          {/* ScrollView for card content */}
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContentContainer} // Added style for content padding
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled // Allow nested scrolling (e.g., if FlipCards scroll)
            // REMOVE PanResponder-related scroll handlers
            // onScrollBeginDrag={() => setIsScrolling(true)}
            // onScrollEndDrag={() => setIsScrolling(false)}
            // onMomentumScrollEnd={() => setIsScrolling(false)}
            // scrollEventThrottle={16} // Less critical now, but can keep
          >
            {/* Profile Name */}
            <Text style={styles.userName}>
              {/* Use name from basicInfo if available, fallback to userData.user.name */}
              {userData.name || userData.name || "No Name"}
            </Text>
            {/* Featured Image 1 (Face/Profile Image) */}
            {/* Assuming profileImages is an array in userData.user */}
            <Image
              source={{
                uri: userData?.profile_image,
              }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            {/* Engagement Buttons/Indicators (Age, Gender, Location) */}
            <View style={styles.engagementButtons}>
              <View style={styles.engagementButton}>
                <Feather
                  name="calendar"
                  size={20}
                  color="black"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.engagementText}>
                  {userData?.age || displayData?.age || "N/A"} yrs
                </Text>
              </View>
              <View style={styles.engagementButton}>
                <Feather
                  name="user"
                  size={20}
                  color="black"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.engagementText}>
                  {/* Capitalize first letter of gender */}
                  {userData?.gender
                    ? userData.gender.charAt(0).toUpperCase() +
                      userData.gender.slice(1)
                    : userData?.gender
                    ? userData.gender.charAt(0).toUpperCase() +
                      userData.gender.slice(1)
                    : "N/A"}
                </Text>
              </View>
              <View style={styles.engagementButton}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="black"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.engagementText}>
                  {/* Location name from basicInfo or location field */}
                  {userData?.location || userData?.location || "N/A"}
                </Text>
              </View>
            </View>
            {/* Profile Summary Section (Business Card) */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryJobTitle}>
                  {userData?.business_card?.["role"] || "Role not specified"}
                </Text>
                <Text style={styles.summaryEmploymentStatus}>
                  {businessCard?.company || "Company not specified"}
                </Text>
                {/* Check for portfolio link from businessCard */}
                {businessCard?.portfolio && (
                  <TouchableOpacity
                    onPress={() => handleLinkPress(businessCard.portfolio)}
                    style={{ marginTop: 5 }} // Add some space
                  >
                    <Text style={styles.summaryWebsiteLink}>
                      Portfolio Link
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Social Icons & Briefcase */}
                <View style={styles.socialAndBriefcaseContainer}>
                  <View style={styles.summarySocialIcons}>
                    {userData?.social_links?.length > 0 ? ( // Only map if links exist
                      userData?.social_links?.map(
                        (
                          link: {
                            id: string; // Assuming social links have an ID
                            type:
                              | "linkedin"
                              | "instagram"
                              | "website"
                              | "email"
                              | "behance"
                              | string; // Allow other types just in case
                            value: string; // Assuming the URL/handle is in 'value'
                          },
                          index: number // Fallback index if ID is missing
                        ) => {
                          const iconInfo = getSocialIcon(link.type as any); // Cast type for helper
                          // Check if link.value is a valid URL before rendering
                          if (!iconInfo || !link.value) return null;
                          const IconComponent = iconInfo.Component;
                          return (
                            <TouchableOpacity
                              key={link.id || index} // Use ID as key if available
                              onPress={() => handleLinkPress(link.value)} // Use link.value as URL
                              style={styles.socialIcon}
                            >
                              <IconComponent
                                name={iconInfo.name as any} // Cast to any for specific icon lib type
                                size={20}
                                color={iconInfo.color || "#555"}
                              />
                            </TouchableOpacity>
                          );
                        }
                      )
                    ) : (
                      <Text style={{ fontSize: 14, color: "#666" }}>
                        No social links added.
                      </Text>
                    )}
                  </View>
                  {/* Briefcase icon - seems decorative or indicates work/skills */}
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
            {/* Featured Image 2 (Skill Image) */}
            {/* Assuming profileImages has a 'skill' type image */}
            <Image
              source={{
                uri: userData?.face,
              }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            {/* Description (Short Bio) */}
            <Text style={styles.descriptionText}>
              {userData?.shortBio || userData?.short_bio || "No bio available."}
            </Text>
            {/* Featured Image 3 (Anything but professional image) */}
            {/* Assuming profileImages has a 'professional' type image */}
            <Image
              source={{
                uri:
                  userData?.anything_but_professional ||
                  userData?.anything_but_professional,
              }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            {/* --- Experience Section --- */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Experience</Text>
              <Text style={styles.sectionCount}>
                {workExperience.length > 0 ? `+${workExperience.length}` : "0"}
              </Text>
            </View>
            {userData?.work_experience?.length > 0 ? ( // Only render FlatList if data exists
              <FlatList
                data={userData.work_experience}
                renderItem={({ item }) =>
                  renderLogoItem({ item, type: "experience" })
                }
                keyExtractor={(item, index) => `exp-${item.id || index}`} // Use id if available
                numColumns={2}
                scrollEnabled={false} // Do not scroll independently
                columnWrapperStyle={styles.row} // Style for each row of items
                contentContainerStyle={styles.flatlistContent} // Optional: inner padding
              />
            ) : (
              <Text style={styles.noItemsText}>
                No work experience added yet.
              </Text>
            )}
            {/* --- Certification Section --- */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Certification</Text>
              <Text style={styles.sectionCount}>
                {certificates.length > 0 ? `+${certificates.length}` : "0"}
              </Text>
            </View>
            {userData?.certificates?.length > 0 ? ( // Only render FlatList if data exists
              <FlatList
                data={userData.certificates}
                renderItem={
                  ({ item }) => renderLogoItem({ item, type: "certification" }) // Use the generic logo item renderer
                }
                keyExtractor={(item, index) => `cert-${item.id || index}`} // Use id if available
                numColumns={2}
                scrollEnabled={false} // Do not scroll independently
                columnWrapperStyle={styles.row} // Style for each row of items
                contentContainerStyle={styles.flatlistContent} // Optional: inner padding
              />
            ) : (
              <Text style={styles.noItemsText}>No certificates added yet.</Text>
            )}
            <View style={{ height: 40 }} /> {/* Bottom padding */}
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
    // Position at the top of the screen relative to its parent View
    position: "absolute",
    top: 0, // Ensure it covers the top
    left: 0, // Ensure it covers the left
    // We will position the parent Views in the swipe screen to overlap them
  },
  overlayIndicator: {
    position: "absolute",
    // Center vertically based on the card's height relative to its parent
    top: "40%", // Adjust this vertically if needed
    width: "100%", // Take full width of parent container
    zIndex: 10, // Above the card
    justifyContent: "center",
    alignItems: "center",
    // Horizontal positioning is handled by likeIndicator/dislikeIndicator
  },
  likeIndicator: {
    // The content (icon/text) is centered, so we just need it to be visible
    // when swiped right. No specific 'right' positioning needed here.
    // The opacity interpolation already handles its appearance on right swipe.
  },
  dislikeIndicator: {
    // Similar to likeIndicator, no specific 'left' positioning needed.
    // The opacity interpolation handles its appearance on left swipe.
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
    position: "absolute", // Keep absolute positioning within cardContainer
    width: "95%", // Card itself is slightly narrower
    height: height * 0.85, // Adjust height to fit screen better, leave space below for next card hint
    alignSelf: "center", // Center the card horizontally in its parent container
    justifyContent: "center", // Center content (ScrollView) within animated view
    alignItems: "center", // Center content (ScrollView) within animated view
    borderRadius: 15, // Rounded corners for card feel
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 3 },
    // shadowOpacity: 0.2,
    // shadowRadius: 8,
    // elevation: 5, // Android shadow
  },
  container: {
    flex: 1, // ScrollView takes full space of animatedCard
    backgroundColor: "white",
    // Padding moved to contentContainerStyle
    // paddingHorizontal: 24,
    // paddingTop: 20,
    // paddingBottom: 20,
    borderRadius: 15, // Match animatedCard borderRadius
    width: "100%", // ScrollView takes full width of animatedCard
  },
  scrollContentContainer: {
    paddingHorizontal: 24, // Inner padding for content
    paddingTop: 20,
    paddingBottom: 20,
  },
  cardPlaceholder: {
    width: "95%", // Match card width
    height: height * 0.85, // Match card height
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    // Removed marginHorizontal, using alignSelf
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: "Montserrat",
    color: "#666",
  },
  userName: {
    color: "black",
    fontSize: 34,
    fontFamily: "MontserratBold",
    marginBottom: 8,
  },
  featuredImage: {
    width: "100%",
    aspectRatio: 1 / 1, // Keep aspect ratio
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 20,
  },
  engagementButtons: {
    flexDirection: "row",
    justifyContent: "space-around", // Use space-around for even spacing
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 5, // Reduced horizontal padding
    paddingVertical: 10,
    borderRadius: 30,
    marginVertical: 20,
    width: "100%",
  },
  engagementButton: {
    flexDirection: "row",
    alignItems: "center",
    // Flex: 1 commented out to prevent stretching, use space-around/between instead
    // flex: 1,
    justifyContent: "center", // Center content within each button segment
  },
  engagementText: {
    fontSize: 15,
    color: "black",
    fontFamily: "Montserrat",
    fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 40,
    paddingHorizontal: 30, // Inner horizontal padding
    paddingVertical: 20, // Inner vertical padding
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 20,
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
    fontFamily: "MontserratBold",
    marginBottom: 4,
  },
  summaryEmploymentStatus: {
    fontSize: 16,
    color: "#555",
    fontFamily: "Montserrat",
    marginBottom: 8,
  },
  summaryWebsiteLink: {
    fontSize: 16,
    fontFamily: "Montserrat",
    color: "#007AFF",
    // marginBottom: 12, // Margin handled by parent view spacing
    textDecorationLine: "underline", // Add underline for link clarity
  },
  socialAndBriefcaseContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15, // Space above social row
  },
  summarySocialIcons: {
    flexDirection: "row",
    flexWrap: "wrap",
    flexShrink: 1, // Allow icons to wrap if many
    marginRight: 10, // Space before briefcase icon
  },
  socialIcon: {
    marginRight: 10, // Space between social icons
    padding: 2, // Small padding for touch area
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
    flexShrink: 0, // Prevent shrinking
  },
  descriptionText: {
    fontSize: 24,
    marginVertical: 12, // Space above and below
    color: "#333",
    fontFamily: "MontserratBold",
    lineHeight: 24,
    // marginBottom: 20, // Redundant with marginVertical
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    // paddingHorizontal: 0, // Redundant if contentContainerStyle has padding
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "MontserratBold",
  },
  sectionCount: {
    fontSize: 16,
    color: "#2E5ED7", // Example blue color
    fontWeight: "bold",
  },
  row: {
    justifyContent: "space-between",
    // paddingHorizontal: 0, // Redundant if contentContainerStyle has padding
    marginBottom: 10,
  },
  flatlistContent: {},
  noItemsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontFamily: "Montserrat",
    marginTop: 5,
    marginBottom: 15, // Space below the message
  },
});

export default UserCard;
