import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  StatusBar,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { Feather } from "@expo/vector-icons"; // Import Feather for icons
import { useRouter } from "expo-router";
import { useSession } from "@/utils/AuthContext"; // Assuming this context provides session/user ID
import { supabase } from "@/lib/supabase"; // Import your Supabase client

// Define the configuration for the locked feature cards
const FEATURE_CARDS_CONFIG = [
  { id: "task_management", title: "Task\nManagement", locked: true }, // Title can include \n for multiline
  { id: "payment", title: "Payment", locked: true },
  { id: "skill_clash", title: "Skill Clash", locked: true },
  { id: "courses", title: "Courses", locked: true },
  { id: "analytics", title: "Analytics", locked: true, fullWidth: true }, // Flag for full width
];

export default function HubScreen() {
  const { session, isLoading: isSessionLoading } = useSession(); // Get session and its loading state
  const [profile, setProfile] = useState<any>(null); // State to store the fetched user profile
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // State for profile fetching loading
  const [error, setError] = useState<string | null>(null); // State for fetch errors

  console.log(session, "ss");
  const router = useRouter();

  // --- Fetch Profile Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      // Only proceed if session is loaded and a user ID is available
      if (isSessionLoading || !session) {
        if (!isSessionLoading) {
          // If session finished loading but no user, handle unauthenticated
          console.warn("Session or User ID not available for profile fetch.");
          setIsLoadingProfile(false); // Stop loading state
          setProfile(null); // Ensure profile is null
          setError("User not authenticated."); // Set an error message
          // Optionally redirect to login if user is expected to be authenticated
          // router.replace('/login');
        }
        return; // Don't fetch if not ready
      }

      setIsLoadingProfile(true); // Start loading indicator
      setError(null); // Clear previous errors
      console.log("Fetching profile for user ID:", session);

      try {
        const { data, error } = await supabase
          .from("users") // Query your 'users' table
          .select(
            `
            id, name, user_type, age, gender, location, latitude, longitude,
            profile_image, face, skill_type, short_bio, business_card,
            certificates, work_experience, skills, social_links,
            avatar, status, expoPushToken
          `
          ) // Select all fields needed for the hub screen (adjust as per your schema and display needs)
          .eq("id::uuid", session as string); // Add 'as string' for TypeScript clarity          .single(); // Expecting a single row

        if (error && error.code !== "PGRST116") {
          // PGRST116 is 'No rows found', which is an expected case if profile creation failed earlier
          console.error("Supabase profile fetch error:", error);
          throw new Error(error.message || "Failed to fetch profile data.");
        }

        if (data) {
          console.log("Profile fetched successfully.");
          setProfile(data); // Store the fetched data
        } else {
          // Case where user is authenticated but no profile exists in 'users' table
          console.warn(
            "Profile data not found in 'users' table for user ID:",
            session
          );
          setProfile(null); // Ensure profile is null
          setError(
            "Profile data incomplete. Please complete your registration or contact support."
          );
          // Optional: Redirect to the registration flow if profile is missing
          // router.replace('/registration'); // Adjust path if needed
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile."); // Set the error message
        setProfile(null); // Ensure profile is null on error
      } finally {
        setIsLoadingProfile(false); // Stop loading indicator
      }
    };

    // Call the fetch function
    fetchProfile();
  }, [session, isSessionLoading]); // Re-run effect if session or its loading state changes

  // --- Conditional Rendering: Loading, Error, or Content ---
  if (isLoadingProfile || isSessionLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // if (error) {
  //   return (
  //     <View style={styles.centeredContainer}>
  //       <Text style={styles.errorText}>{error}</Text>
  //       {/* Add a button to retry or go to login/registration */}
  //       {!session && ( // If no session, prompt login
  //         <TouchableOpacity
  //           onPress={() => router.replace("/login")}
  //           style={styles.actionButton}
  //         >
  //           <Text style={styles.actionButtonText}>Go to Login</Text>
  //         </TouchableOpacity>
  //       )}
  //       {session &&
  //         !profile && ( // If session but no profile, prompt registration or retry
  //           <>
  //             <Text style={styles.errorSubText}>
  //               Please ensure your profile is complete.
  //             </Text>
  //             {/* Optional: Button to retry fetch or go to registration */}
  //             {/* <TouchableOpacity onPress={() => fetchProfile()} style={styles.actionButton}>
  //                         <Text style={styles.actionButtonText}>Retry</Text>
  //                     </TouchableOpacity> */}
  //             {/* Or direct to registration if that's the flow */}
  //           </>
  //         )}
  //       {/* For other fetch errors, just show the error message */}
  //     </View>
  //   );
  // }

  // If we reach here, profile is loaded (or null if error was just a warning)
  // Check if profile is actually null before rendering main content
  // if (!profile) {
  //   // This case is handled by the error state, but good to have a fallback UI
  //   return (
  //     <View style={styles.centeredContainer}>
  //       <Text style={styles.errorText}>Profile data not available.</Text>
  //       <Text style={styles.errorSubText}>
  //         Please log in or complete your profile.
  //       </Text>
  //       <TouchableOpacity
  //         onPress={() => router.replace("/login")}
  //         style={styles.actionButton}
  //       >
  //         <Text style={styles.actionButtonText}>Go to Login</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  // --- Render Main Hub Content ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Use a platform-specific StatusBar style */}
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
        backgroundColor="#fff"
      />

      {/* Header - Removed from the image design */}
      {/* <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="settings" size={24} color="#000" />
        </TouchableOpacity>
      </View> */}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Profile Card */}
        <View style={styles.profileCard}>
          {/* Icons positioned absolutely within the main card */}
          <TouchableOpacity
            style={[styles.iconButton, styles.editIcon]}
            onPress={() => {
              console.log("Edit profile pressed");
              // Navigate to your profile edit screen, potentially passing current profile data
              router.push("/(registration)/basic-information"); // Example route to basic info
              // You might need a dedicated 'EditProfile' screen that loads data
              // or pass profile.id as a parameter
            }}
          >
            <Feather name="edit-3" size={20} color="black" />{" "}
            {/* Pencil icon variant */}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.filterIcon]}
            onPress={() => {
              console.log("Filter pressed");
              // Handle filter logic or navigate to filter screen
              // Example: router.push('/filter-settings');
              Alert.alert("Under Development", "Filter options coming soon!");
            }}
          >
            <Feather name="filter" size={20} color="black" />{" "}
            {/* Filter icon */}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.settingsIcon]}
            onPress={() => {
              console.log("Settings pressed");
              router.push("/(settings)"); // Navigate to settings screen
            }}
          >
            <Feather name="settings" size={20} color="black" />{" "}
            {/* Settings icon */}
          </TouchableOpacity>

          {/* Avatar */}
          {/* Use profile_image or avatar from fetched data */}
          <Image
            source={{
              uri: "https://via.placeholder.com/150?text=Avatar",
            }} // Use fetched image, fallback to placeholder
            style={styles.avatar}
          />

          {/* Name */}
          <Text style={styles.profileName}>{profile?.name || "No Name"}</Text>

          {/* My Profile / My Card Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.profileButton, styles.myProfileButton]}
              onPress={() => {
                console.log("My Profile pressed");
                // Navigate to detailed profile view
                // router.push(`/profile-view/${profile.id}`); // Example
                Alert.alert(
                  "Under Development",
                  "Detailed Profile view coming soon!"
                );
              }}
            >
              <Text style={[styles.buttonText, styles.myProfileText]}>
                My Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.profileButton, styles.myCardButton]}
              onPress={() => router.push("/business-card")} // Navigate to business card screen
            >
              <Text style={[styles.buttonText, styles.myCardText]}>
                My Card
              </Text>
            </TouchableOpacity>
          </View>

          {/* Skills/Badges (based on design image, seems to show skill type and user type) */}
          <View style={styles.badgesContainer}>
            {profile?.skill_type && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {profile.skill_type || "test skill"}
                </Text>
              </View>
            )}
            {profile?.user_type && (
              <View style={[styles.badge, styles.userTypeBadge]}>
                {" "}
                {/* Style for user type badge */}
                <Text style={styles.badgeText}>
                  {profile?.user_type || "Freelancer"}
                </Text>
              </View>
            )}
            {/* If you want to show skills as badges: */}
            {/*
               {Array.isArray(profile.skills) && profile.skills.map((skill: any, index: number) => (
                   <View key={index} style={styles.badge}>
                       <Text style={styles.badgeText}>{typeof skill === 'string' ? skill : skill?.name || ''}</Text>
                   </View>
               ))}
               */}
          </View>
        </View>

        {/* Locked Features Grid & Analytics */}
        <View style={styles.featuresGrid}>
          {FEATURE_CARDS_CONFIG?.filter((card) => !card.fullWidth).map(
            (feature) => (
              <TouchableOpacity key={feature.id} style={styles.featureCard}>
                <Text style={styles.featureTitle}>
                  {feature?.title || "Feature title"}
                </Text>
                {/* Optional: Add specific background images here matching design */}
                {/* <Image source={...} style={styles.featureCardBackground} /> */}
                <View style={styles.lockContainer}>
                  <Feather name="lock" size={32} color="#C0C0C0" />{" "}
                  {/* Gray lock icon */}
                </View>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Analytics Card (Full Width) */}
        {FEATURE_CARDS_CONFIG.filter((card) => card.fullWidth).map(
          (feature) => (
            <TouchableOpacity key={feature.id} style={styles.analyticsCard}>
              {/* Optional: Add specific background images here */}
              {/* <Image source={...} style={styles.analyticsCardBackground} /> */}
              <Text style={styles.analyticsTitle}>{feature.title}</Text>
              <View style={styles.lockContainer}>
                <Feather name="lock" size={32} color="#C0C0C0" />{" "}
                {/* Gray lock icon */}
              </View>
            </TouchableOpacity>
          )
        )}

        {/* Add bottom padding for the scroll view */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Light background color
  },
  centeredContainer: {
    // Used for loading/error states
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FF6347", // Error color
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 15,
  },
  actionButton: {
    // Simple action button style for retry/login
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Header styles removed as per design image
  // header: { ... },
  // headerButton: { ... },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // Allows content to expand
    padding: 16, // Padding around all content inside scroll view
    paddingBottom: 30, // Extra padding at the bottom
  },
  profileCard: {
    backgroundColor: "#fff", // White background
    borderRadius: 24, // Larger border radius
    padding: 24, // Inner padding
    alignItems: "center", // Center content horizontally
    marginBottom: 20, // Space below card
    shadowColor: "#000", // Shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Adjusted opacity
    shadowRadius: 8,
    elevation: 4,
    position: "relative", // Needed for absolute positioning of icons
  },
  // Icons positioned absolutely within the profile card
  iconButton: {
    padding: 8, // Make touch area easier
    position: "absolute",
    zIndex: 1, // Ensure icons are tappable
  },
  editIcon: { top: 10, left: 10 }, // Position edit icon (pencil)
  filterIcon: { top: 10, right: 40 }, // Position filter icon
  settingsIcon: { top: 10, right: 10 }, // Position settings icon

  avatar: {
    width: 90, // Larger avatar size
    height: 90,
    borderRadius: 45, // Circular
    marginBottom: 16, // Space below avatar
    backgroundColor: "#e0e0e0", // Placeholder background
    borderWidth: 3, // Border around avatar
    borderColor: "#fff", // White border initially
    // Note: The image shows a light background color behind the avatar, not a border
    // You could achieve this with a View behind the avatar
    // Example: <View style={styles.avatarBackground}><Image ... /></View>
    // avatarBackground: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#E0F2F7', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  },
  profileName: {
    fontSize: 26, // Larger font for name
    fontWeight: "bold", // Bold
    color: "#000",
    marginBottom: 15, // Space below name
    textAlign: "center", // Center text
  },
  buttonContainer: {
    flexDirection: "row", // Buttons side-by-side
    gap: 12, // Space between buttons (RN 0.71+), or use margin
    marginBottom: 15, // Space below button row
  },
  profileButton: {
    // Base style for the two profile buttons
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20, // Oval shape
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center", // Center content
    minWidth: 100, // Minimum width
  },
  myProfileButton: {
    // "My Profile" specific style
    backgroundColor: "#E8F5E8", // Light green background
    borderColor: "#4CAF50", // Green border (adjust to match design)
  },
  myCardButton: {
    // "My Card" specific style
    backgroundColor: "#FFF3E0", // Light orange background
    borderColor: "#FF9800", // Orange border (adjust to match design)
  },
  buttonText: {
    // Base text style for the two profile buttons
    fontSize: 14,
    fontWeight: "600", // Semi-bold
  },
  myProfileText: {
    // "My Profile" text color
    color: "#388E3C", // Green text
  },
  myCardText: {
    // "My Card" text color
    color: "#F57C00", // Orange text
  },
  badgesContainer: {
    // Container for skill/user type badges
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // Center badges
    gap: 8, // Space between badges
    marginTop: 10, // Space above badges
    // marginBottom: 15, // Space below badges (handled by featuresGrid margin)
  },
  badge: {
    // Style for a single badge
    backgroundColor: "#E0F2F7", // Light blue/teal background
    borderColor: "#00BCD4", // Teal border
    borderWidth: 1,
    borderRadius: 12, // Rounded corners
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  userTypeBadge: {
    // Example: Style for the user type badge if different color is needed
    backgroundColor: "#FFEDD5", // Light orange background
    borderColor: "#FF9800", // Orange border
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333", // Dark text
  },

  featuresGrid: {
    // Container for the 2x2 feature cards
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Distribute cards horizontally
    gap: 12, // Space between cards (RN 0.71+)
    marginBottom: 20, // Space below the grid
  },
  featureCard: {
    // Style for a single feature card (Task, Payment, etc.)
    width: "48%", // Width for two items per row with space-between and padding
    aspectRatio: 1.1, // Adjust aspect ratio to match image closer
    backgroundColor: "#fff", // White background
    borderRadius: 20, // Rounded corners
    padding: 20, // Inner padding
    justifyContent: "space-between", // Space title and lock icon
    shadowColor: "#000", // Shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: "relative", // Needed for potential background images
    overflow: "hidden", // Ensure background image respects border radius
  },
  featureCardBackground: {
    // Optional: Style for background images within feature cards
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Or 'contain', 'stretch'
    opacity: 0.2, // Make it subtle
    zIndex: 0, // Behind title and lock
  },
  featureTitle: {
    // Style for the title inside feature cards
    fontSize: 15, // Font size
    fontWeight: "500", // Medium weight
    color: "#C0C0C0", // Gray color from image
    lineHeight: 20, // Adjusted line height for multiline
    // textAlign: 'center', // Optional: if title is always one word
    zIndex: 1, // Ensure title is above background image
  },
  lockContainer: {
    // Container for the lock icon
    alignSelf: "flex-end", // Align lock icon to the bottom right
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1, // Ensure lock is above background image
  },
  analyticsCard: {
    // Style for the full-width analytics card
    backgroundColor: "#fff", // White background
    borderRadius: 20, // Rounded corners
    padding: 24, // Inner padding (slightly more vertical padding seems implied)
    flexDirection: "row", // Align title and lock horizontally
    justifyContent: "space-between", // Space between title and lock
    alignItems: "center", // Vertically align center
    shadowColor: "#000", // Shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: "relative", // Needed for potential background images
    overflow: "hidden", // Ensure background image respects border radius
  },
  analyticsCardBackground: {
    // Optional: Style for background images within analytics card
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Or 'contain', 'stretch'
    opacity: 0.2, // Make it subtle
    zIndex: 0, // Behind title and lock
  },
  analyticsTitle: {
    // Style for the analytics title
    fontSize: 18, // Font size
    fontWeight: "500", // Medium weight
    color: "#C0C0C0", // Gray color from image
    zIndex: 1, // Ensure title is above background image
  },
});
