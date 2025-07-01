import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  Alert, // Import Alert
} from "react-native";
import { Feather } from "@expo/vector-icons"; // Import Feather for icons
import { useRouter } from "expo-router";
import { useSession } from "@/utils/AuthContext"; // Assuming this context provides session/user ID
import { supabase } from "@/lib/supabase"; // Import your Supabase client

// Define the UserProfile interface for better type safety
interface UserProfile {
  id: string;
  name: string | null;
  user_type: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  profile_image: string | null;
  face: string | null; // Assuming this is a URL or path to an image
  skill_type: string | null;
  short_bio: string | null;
  business_card: string | null; // Assuming this is a URL or path to an image/PDF
  certificates: string[]; // Array of certificate names/URLs
  work_experience: any[]; // Adjust type based on your schema
  skills: string[]; // Array of skills
  social_links: any; // Adjust type based on your schema (e.g., { linkedin: string, twitter: string })
  avatar: string | null; // URL to avatar image
  status: string | null;
  expoPushToken: string | null;
}

// Define the configuration for the locked feature cards
const FEATURE_CARDS_CONFIG = [
  {
    id: "task_management",
    title: "Task\nManagement",
    locked: true,
    bg: "../../assets/images/hub_1.png",
  }, // Replace with your image
  {
    id: "payment",
    title: "Payment",
    locked: true,
    bg: "../../assets/images/hub_1.png",
  }, // Replace with your image
  {
    id: "skill_clash",
    title: "Skill Clash",
    locked: true,
    bg: "../../assets/images/hub_1.png",
  }, // Replace with your image
  {
    id: "courses",
    title: "Courses",
    locked: true,
    bg: "../../assets/images/hub_1.png",
  }, // Replace with your image
  {
    id: "analytics",
    title: "Analytics",
    locked: true,
    fullWidth: true,
    bg: "../../assets/feature_analytics_bg.png",
  }, // Replace with your image
];

export default function HubScreen() {
  const { session, isLoading: isSessionLoading } = useSession(); // Get session and its loading state
  const [profile, setProfile] = useState<UserProfile | null>(null); // State to store the fetched user profile
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // State for profile fetching loading
  const [error, setError] = useState<string | null>(null); // State for fetch errors

  const router = useRouter();

  // --- Fetch Profile Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      // Only proceed if session is loaded and a user ID is available
      if (isSessionLoading || !session) {
        if (!isSessionLoading) {
          // If session finished loading but no user, handle unauthenticated state
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
          .select("*")
          .eq("id:uuid", session)
          .single(); // Select all fields needed for the hub screen (adjust as per your schema and display needs)

        if (error && error.code !== "PGRST116") {
          // PGRST116 is 'No rows found', which is an expected case if profile creation failed earlier
          console.error("Supabase profile fetch error:", error);
          throw new Error(error.message || "Failed to fetch profile data.");
        }

        if (data) {
          console.log("Profile fetched successfully.");
          setProfile(data as UserProfile); // Store the fetched data with type assertion
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
          // router.replace('/profile-setup'); // Adjust path if needed
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
  }, [session, isSessionLoading, router]); // Added router to dependency array if used inside effect

  // --- Conditional Rendering: Loading, Error, or Content ---
  if (isLoadingProfile || isSessionLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        {/* If no session, prompt login */}
        {!session && !isSessionLoading && (
          <TouchableOpacity
            onPress={() => router.replace("/login")} // Adjust path if needed
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>Go to Login</Text>
          </TouchableOpacity>
        )}
        {session && !profile && !isLoadingProfile && (
          <View style={styles.centeredContainer}>
            <Text style={styles.errorSubText}>
              Your profile information is missing or incomplete.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/profile-setup")} // Navigate to profile setup/edit
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Complete Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // --- Render Main Hub Content ---
  return (
    <SafeAreaView style={styles.container}>
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
              router.push("/profile-setup"); // Example route to basic info or profile edit
            }}
          >
            <Image
              source={require("../../assets/images/pen.png")}
              width={10}
              height={10}
              style={{ width: 25, height: 25 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.filterIcon]}
            onPress={() => {
              console.log("Filter pressed");
              Alert.alert("Under Development", "Filter options coming soon!");
            }}
          >
            <Image
              source={require("../../assets/images/switches.png")}
              width={10}
              height={10}
              style={{ marginLeft: 5, width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.settingsIcon]}
            onPress={() => {
              console.log("Settings pressed");
              router.push("/(settings)"); // Navigate to settings screen
            }}
          >
            <Image
              source={require("../../assets/images/settings.png")}
              width={10}
              height={10}
              style={{ marginLeft: 5, width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Avatar */}
          <Image
            source={{
              uri:
                profile?.profile_image ||
                "https://via.placeholder.com/150?text=Avatar",
            }}
            style={styles.avatar}
          />

          {/* Name */}
          <Text style={styles.profileName}>{profile?.name || "User Name"}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.profileButton, styles.myProfileButton]}
              onPress={() => {
                console.log("My Profile pressed");
                // Example: Navigate to a detailed profile view page
                // router.push(`/user/${profile?.id}`);
                Alert.alert(
                  "Feature Under Development",
                  "Detailed profile view coming soon!"
                );
              }}
            >
              <Text style={[styles.buttonText, styles.myProfileText]}>
                My Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.profileButton, styles.myCardButton]}
              onPress={() => {
                const dataToPass = {
                  name: profile.name,
                  role: profile.role,
                  company: profile.company,
                  business_card: profile.business_card,
                  skills: profile.skills,
                  bio: profile.bio,
                  profile_image: profile.profile_image,
                };

                router.push({
                  pathname: "/business-card",
                  params: { userData: JSON.stringify(dataToPass) }, // ✅ serialize object
                });
              }}
            >
              <Text style={[styles.buttonText, styles.myCardText]}>
                My Card
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Locked Features Grid */}
        <View style={styles.featuresGrid}>
          {FEATURE_CARDS_CONFIG?.filter((card) => !card.fullWidth).map(
            (feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCardWrapper}
                onPress={() =>
                  Alert.alert(
                    "Feature Locked",
                    `This "${feature.title}" feature is not yet available.`
                  )
                }
              >
                <ImageBackground
                  source={
                    feature.id == "task_management"
                      ? require("../../assets/images/hub_1.png")
                      : feature?.id === "skill_clash"
                      ? require("../../assets/images/hub_2.png")
                      : feature?.id === "payment"
                      ? require("../../assets/images/hub_3.png")
                      : feature?.id === "courses"
                      ? require("../../assets/images/hub_4.png")
                      : feature?.id === "analytics"
                      ? require("../../assets/images/hub_1.png")
                      : null
                  } // Use the specific background image
                  style={styles.featureCardContent}
                  resizeMode="cover"
                >
                  {/* <Text style={styles.featureTitle}>
                    {feature?.title || "Feature title"}
                  </Text>
                  <View style={styles.lockContainer}>
                    <Feather name="lock" size={32} color="#C0C0C0" />
                  </View> */}
                </ImageBackground>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Analytics Card (Full Width) */}
        {FEATURE_CARDS_CONFIG.filter((card) => card.fullWidth).map(
          (feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.analyticsCard}
              onPress={() =>
                Alert.alert(
                  "Feature Locked",
                  `This "${feature.title}" feature is not yet available.`
                )
              }
            >
              <ImageBackground
                source={require("../../assets/images/hub_5.png")} // Use the specific background image
                style={styles.analyticsCardBackground}
                resizeMode="contain"
              ></ImageBackground>
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#f8f9fa", // Light background color
  },
  centeredContainer: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    paddingTop: 10,
    borderRadius: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  iconButton: {
    padding: 8,
    position: "absolute",
    zIndex: 1,
  },
  editIcon: { top: 10, left: 10 },
  filterIcon: { top: 10, right: 40 },
  settingsIcon: { top: 10, right: 10 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
    backgroundColor: "#e0e0e0",
    borderWidth: 3,
    borderColor: "#fff", // White border around avatar
  },
  profileName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 15,
    fontFamily: "MontserratBold",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 15,
  },
  profileButton: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  myProfileButton: {
    backgroundColor: "#BFD5CD",
    borderColor: "#000000",
  },
  myCardButton: {
    backgroundColor: "#F6D3BD",
    borderColor: "#000000",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "500",

    color: "#000000",
  },
  myProfileText: {
    color: "#000000",
    fontFamily: "Montserrat",
  },
  myCardText: {
    color: "#000000",
    fontFamily: "Montserrat",
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  badge: {
    backgroundColor: "#E0F2F7",
    borderColor: "#00BCD4",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  userTypeBadge: {
    backgroundColor: "#FFEDD5",
    borderColor: "#FF9800",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },

  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCardWrapper: {
    width: "48%", // Adjust to '49%' if you want a small gap without margin
    aspectRatio: 1, // Make cards square, adjust if needed
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  featureCardContent: {
    flex: 1, // Ensure ImageBackground takes full space of wrapper
    alignItems: "center",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    // padding: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333", // Darker contrast for visibility
    lineHeight: 22,
  },
  lockContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  analyticsCard: {
    borderRadius: 20,
    width: "100%",
    height: 200,
    overflow: "hidden",
    position: "relative", // For absolute positioning of background if needed
  },
  analyticsCardBackground: {
    flexDirection: "row",
    justifyContent: "space-between",
    resizeMode: "contain",
    height: 200,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333", // Make title more visible, adjust as needed
    zIndex: 1,
  },
});
