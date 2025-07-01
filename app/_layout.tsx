// app/_layout.js
import { useFonts } from "expo-font";
import { useColorScheme } from "@/hooks/useColorScheme";
// If SessionProvider is for something else, keep it. If it's for Clerk, you might not need it separately.
// import SessionProvider from "@/utils/AuthContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, SafeAreaView } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { use, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Keep if you're using Supabase for other things
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY } from "@/env";
import SessionProvider, { useSession } from "@/utils/AuthContext";

// --- Custom hook to manage redirection based on auth status ---
function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  console.log("isLoaded", isLoaded);

  if (!isLoaded) {
    return (
      <View>
        <Text>Loading auth...</Text>
      </View>
    ); // Show a loading indicator while auth is being checked
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(registration)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="(settings)/index" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
    MontserratBold: require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        {/* If SessionProvider is for something else, keep it. If it was intended for Clerk, you might remove it. */}
        <SessionProvider>
          <ThemeProvider value={DefaultTheme}>
            <SafeAreaView style={{ flex: 1 }}>
              <RootNavigator />
            </SafeAreaView>
          </ThemeProvider>
        </SessionProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
