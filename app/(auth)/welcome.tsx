// app/welcome.js (or your landing page file)
"use client";

import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  BackHandler,
  View,
  Text,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react"; // Import useState
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "@/hooks/useToast";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import { Path, Svg } from "react-native-svg";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/utils/AuthContext";

const Logo = () => (
  <View style={styles.logoContainer}>
    <Image
      source={require("../../assets/images/skilloop.png")}
      style={{ width: 150, height: 50, resizeMode: "contain" }}
    />
  </View>
);

const SocialButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.socialButton} onPress={onPress}>
    <Svg viewBox="0 0 24 24" width="24" height="24">
      <Path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <Path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <Path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <Path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </Svg>
  </TouchableOpacity>
);

export default function App() {
  const router = useRouter();
  const { user, isLoaded } = useUser(); // useUser hook to get user details
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [isLoadingUser, setIsLoadingUser] = useState(false); // State to track if we're trying to get user details
  const { signIn, session } = useSession();
  const path = usePathname();

  console.log("path", path);

  useEffect(() => {
    const backAction = () => {
      if (path === "/welcome" || path === "/(auth)/welcome") {
        // Disable back button
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [path]);
  const handleGoogleSignIn = async () => {
    setIsLoadingUser(true); // Start loading user data
    try {
      const result = await startOAuthFlow();

      if (result?.createdSessionId) {
        await result.setActive({ session: result.createdSessionId });
        // Now that the session is active, useUser should eventually populate
        // We'll handle the next steps in the useEffect below that watches `user` and `isLoaded`
      } else {
        // Handle case where OAuth flow didn't return a session ID
        toast({
          title: "Sign in failed",
          description: "No session returned from Google.",
          variant: "destructive",
        });
        setIsLoadingUser(false); // Reset loading state
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      Alert.alert("Error", "Google sign-in failed.");
      setIsLoadingUser(false); // Reset loading state on error
    }
  };

  // This useEffect now specifically handles what to do *after* the session is created
  // and the user object is populated.
  useEffect(() => {
    // Only proceed if Clerk is loaded, a user object is available, and we are currently in a loading state from the OAuth flow
    if (isLoaded && user && isLoadingUser) {
      const email = user.primaryEmailAddress?.emailAddress;
      const name = user.fullName;
      const imageUrl = user.imageUrl;
      console.log("user", user?.primaryEmailAddress?.emailAddress);
      initiateSignUpLogin(email);
    }
    // Add 'isLoadingUser' to dependencies to re-run this effect when it changes
  }, [isLoaded, user, isLoadingUser, router]);

  async function initiateSignUpLogin(email: string) {
    if (!email) {
      // Fallback if essential user info is missing
      toast({
        title: "Sign in error",
        description: "Could not retrieve user details.",
        variant: "destructive",
      });
      setIsLoadingUser(false); // Reset loading state
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        // User not found - this is a new Google user

        await AsyncStorage.setItem(
          "gmail_user",
          JSON.stringify({
            email: email,
            isGoogle: true,
          })
        );
        toast({
          title: "Welcome!",
          description: "Please complete your profile setup.",
          variant: "success",
        });

        // Navigate to registration for naew users
        router.push("/(registration)");
      } else {
        const id = data.id;
        // User exists - sign them in
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
          variant: "success",
        });
        signIn(id);
      }
      //
    } catch (e) {
      console.log(e);
      toast({
        title: "Sign in error",
        description: "Could not retrieve user details.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (session) {
      router.replace("/(tabs)");
    }
  }, [session]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Logo />

        {/* Avatars Container is for background visuals, doesn't depend on auth state */}
        <View style={styles.avatarsContainer}>
          <Image
            source={require("../../assets/images/Ellipse 1.png")}
            style={{
              position: "absolute",
              right: 0,
              top: -100,
              resizeMode: "contain",
              width: 150,
              height: 150,
            }}
          />
          <Image
            source={require("../../assets/images/Ellipse 2.png")}
            style={{
              position: "absolute",
              right: 300,
              top: 70,
              width: 130,
              height: 130,
              resizeMode: "contain",
            }}
          />
          <Image
            source={require("../../assets/images/Ellipse 3.png")}
            style={{
              position: "absolute",
              right: 20,
              top: 120,
              width: 160,
              height: 160,
              resizeMode: "contain",
            }}
          />
          <Image
            source={require("../../assets/images/Ellipse 4.png")}
            style={{
              position: "absolute",
              right: 150,
              top: 300,
              width: 200,
              height: 200,
              resizeMode: "contain",
            }}
          />
          <Image
            source={require("../../assets/images/Ellipse 5.png")}
            style={{
              position: "absolute",
              right: 0,
              top: 300,
              width: 130,
              height: 130,
              resizeMode: "contain",
            }}
          />
          <Image
            source={require("../../assets/images/Ellipse 6.png")}
            style={{
              position: "absolute",
              right: 200,
              top: 180,
              width: 80,
              height: 80,
              resizeMode: "contain",
            }}
          />
          <Image
            source={require("../../assets/images/Ellipse 7.png")}
            style={{
              position: "absolute",
              right: 160,
              top: 0,
              width: 120,
              height: 120,
              resizeMode: "contain",
            }}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.headingConnect}>Connect</Text>
            <Text style={styles.headingText}> with professionals.</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.headingCollaborate}>Collaborate</Text>
            <Text style={styles.headingText}> on projects.</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.headingCreate}>Create</Text>
            <Text style={styles.headingText}> new opportunities.</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.push("/(auth)/login")} // Navigate to your Clerk login/signup screens
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Text> </Text>
            <Ionicons name="arrow-redo-outline" size={24} color="white" />
          </TouchableOpacity>

          {/* Conditionally render SocialButton if not currently loading user */}
          <SocialButton onPress={handleGoogleSignIn} />
        </View>

        <View style={styles.actionContainer}>
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  avatarsContainer: {
    flex: 1,
    position: "relative",
  },
  textContainer: {
    marginVertical: 40,
  },
  headingText: {
    fontSize: 28,
    fontWeight: "400",
    lineHeight: 36,
  },
  headingConnect: {
    fontSize: 28,
    color: "#8FCCDE",
    fontWeight: "600",
  },
  headingCollaborate: {
    fontSize: 28,
    color: "#F5A623",
    fontWeight: "600",
  },
  headingCreate: {
    fontSize: 28,
    color: "#000",
    fontWeight: "600",
  },
  actionContainer: {
    gap: 20,
    marginBottom: 40,
    marginTop: 30,
  },
  getStartedButton: {
    width: "50%",
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  getStartedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 24,
    marginLeft: 15,
    borderWidth: 1,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 16,
    color: "#666",
  },
  signInLink: {
    fontSize: 16,
    color: "#F5A623",
    fontWeight: "600",
  },
});
