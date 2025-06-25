// app/_layout.js
import { useColorScheme } from "@/hooks/useColorScheme";
import SessionProvider, { useSession } from "@/utils/AuthContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot, Stack, useRouter } from "expo-router"; // Import useRouter
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View, Text } from "react-native";
import "react-native-get-random-values";

export default function RootLayout() {
  // const [fontsLoaded] = useFonts({
  //   Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
  //   MontserratBold: require("../assets/fonts/Montserrat-Bold.ttf"),
  // });

  // if (!fontsLoaded) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <Text>Loading fonts...</Text>
  //     </View>
  //   );
  // }

  return (
    <SessionProvider>
      <AuthStack />
    </SessionProvider>
  );
}

function AuthStack() {
  const { session, isLoading } = useSession();
  const router = useRouter(); // Initialize router

  const colorScheme = useColorScheme();

  // Redirect logic (important for initial load and auth state changes)
  useEffect(() => {
    if (isLoading) return; // Wait for session to load

    if (session) {
      // User is logged in
      router.replace("/(tabs)"); // Navigate to the authenticated tabs
    } else {
      // User is not logged in
      router.replace("/(auth)/welcome"); // Navigate to the unauthenticated auth group (e.g., welcome screen)
    }
  }, [session, isLoading, router]); // Dependency array: re-run when session or loading state changes

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Checking session...</Text>
      </View>
    );
  }

  // Render Stack for all possible top-level routes
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Unauthenticated routes - accessible when session is null */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(registration)" options={{ headerShown: false }} />

        {/* Authenticated routes - accessible when session is not null */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="(settings)/index"
          options={{ headerShown: false }}
        />
        {/* Potentially other authenticated screens like user profile, settings outside tabs */}
        {/* <Stack.Screen name="settings" options={{ headerShown: false }} /> */}

        {/* Not Found Screen */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
