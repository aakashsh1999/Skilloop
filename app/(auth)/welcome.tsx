//

import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
// import { CircleDot } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Path, Svg } from "react-native-svg";
import { Ionicons, createIconSet } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { use, useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/utils/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "@/hooks/useToast";

WebBrowser.maybeCompleteAuthSession();

// Generate redirect URI
const redirectTo = makeRedirectUri({
  scheme: "skilloop",
  path: "welcome",
  useProxy: true,
});

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);

  const { access_token, refresh_token } = params;
  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) throw error;
  return data.session;
};

// Generic OAuth login handler
const performOAuth = async (provider: "github" | "google") => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(
    data?.url ?? "",
    redirectTo
  );

  if (res.type === "success") {
    const { url } = res;
    return createSessionFromUrl(url);
  }
};

const Logo = () => (
  <View style={styles.logoContainer}>
    <Image
      source={require("../../assets/images/skilloop.png")}
      // style={styles.logoImage}
      style={{ width: 150, height: 50, resizeMode: "contain" }}
    />
  </View>
);

const SocialButton = ({
  provider,
  signInWithGoogle,
}: {
  provider: "google" | "apple";
  signInWithGoogle: () => void;
}) => (
  <TouchableOpacity style={styles.socialButton} onPress={signInWithGoogle}>
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
  const { session, signIn } = useSession();

  const url = Linking.useURL();
  // Handle deep links
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url).then((s) => {
        if (s) handleSession(s);
      });
    }
  }, [url]);

  // Handle new session and store tokens
  const handleSession = async (s: any) => {
    console.log("handleSession", s);

    const { user } = s;
    const id = user?.id;

    if (!id) return;
    try {
      console.log("checkSession", id);
      // Check if user exists in your custom `profiles` or `users` table
      const { data, error } = await supabase
        .from("users") // or 'profiles', depending on your schema
        .select("*")
        .eq("id", id as string)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        await AsyncStorage.removeItem("session");
        await AsyncStorage.setItem(
          "gmail_user",
          JSON.stringify({
            id: id,
            isGoogle: true,
          })
        );
        toast({
          title: "Google Signup",
          description: "You have successfully signed in with Google.",
          variant: "success",
        });
        // User not found – navigate to register page
        router.push("/(registration)");
      } else {
        console.log("sddd");
        // User exists – navigate to home or dashboard
        signIn(id);
        router.replace("/"); // adjust as needed
      }
    } catch (err) {
      console.error("Error checking user:", err);
      Alert.alert("Error", "There was a problem checking your account.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Logo />

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
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Text style={styles.headingConnect}>Connect</Text>
            <Text style={styles.headingText}> with professionals.</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Text style={styles.headingCollaborate}>Collaborate</Text>
            <Text style={styles.headingText}> on projects.</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
            }}
          >
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
            onPress={() => router.push("/login")}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Text> </Text>
            <Ionicons name="arrow-redo-outline" size={24} color="white" />
          </TouchableOpacity>

          <SocialButton
            provider="google"
            signInWithGoogle={() => performOAuth("google")}
          />
        </View>

        <View style={styles.actionContainer}>
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  avatarsContainer: {
    flex: 1,
    position: "relative",
  },
  avatarCircle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
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
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
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
  socialButtonText: {
    fontSize: 18,
    color: "#000",
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
