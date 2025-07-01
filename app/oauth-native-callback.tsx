"use client";

import { useRouter, useGlobalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OAuthNativeCallback() {
  const router = useRouter();
  const { signIn, setActive } = useAuth();
  const searchParams = useGlobalSearchParams();

  useEffect(() => {
    const completeOAuth = async () => {
      try {
        console.log("OAuth callback params:", searchParams);
        // Get the code from the search params
        const code = searchParams.code as string;
        const state = searchParams.state as string;

        if (!code) {
          router.replace("/login");
          return;
        }

        // Complete the OAuth flow using the authorization code
        const signInAttempt = await signIn?.attemptFirstFactor({
          strategy: "oauth_google", // or "oauth_github" depending on your provider
          code: code,
        });

        if (signInAttempt?.status === "complete") {
          // Set the active session
          await setActive({ session: signInAttempt.createdSessionId });

          console.log("OAuth sign-in successful");
          router.replace("/(tabs)");
        } else {
          console.error("OAuth sign-in incomplete:", signInAttempt?.status);
          router.replace("/welcome");
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        router.replace("/welcome");
      }
    };

    completeOAuth();
  }, [router, searchParams, signIn, setActive]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ marginBottom: 10 }}>Completing sign-in...</Text>
      <ActivityIndicator size="large" />
    </View>
  );
}
