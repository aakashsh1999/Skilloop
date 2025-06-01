import { Stack } from "expo-router";

export default function RegistrationLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="basic-info" options={{ headerShown: false }} />
      <Stack.Screen name="business-card" options={{ headerShown: false }} />
      <Stack.Screen name="work-experience" options={{ headerShown: false }} />
      <Stack.Screen name="misc" options={{ headerShown: false }} />
      <Stack.Screen name="profile-images" options={{ headerShown: false }} />
      <Stack.Screen name="profile-complete" options={{ headerShown: false }} />
      <Stack.Screen name="certificates" options={{ headerShown: false }} />
    </Stack>
  );
}
