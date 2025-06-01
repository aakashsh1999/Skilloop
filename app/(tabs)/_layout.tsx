import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarLabelStyle: {
          fontSize: 13,
          marginTop: 3,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/discover.png")}
              style={{ width: 28, height: 28, marginBottom: -4 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/matches.png")}
              style={{ width: 28, height: 28, marginBottom: -4 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/message.png")}
              style={{ width: 28, height: 28, marginBottom: -4 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="hub"
        options={{
          title: "Hub",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/hub.png")}
              style={{ width: 28, height: 28, marginBottom: -4 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
