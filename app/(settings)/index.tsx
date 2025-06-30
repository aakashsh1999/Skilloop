import { useSession } from "@/utils/AuthContext";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
} from "react-native";

// Icon component - replace with your preferred icon library
const Icon = ({ name, size = 20, color = "#666" }) => (
  <Text style={{ fontSize: size, color }}>{name}</Text>
);

const SettingsScreen = () => {
  const handlePress = (item: string) => {
    console.log(`Pressed: ${item}`);
    // Add your navigation logic here
  };
  const router = useRouter();

  const { signOut } = useSession();

  const SettingsItem = ({ title, onPress, icon = "→", badge = null }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <Text style={styles.settingsItemText}>{title}</Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Icon name={icon} size={20} color="#999" />
    </TouchableOpacity>
  );

  const SettingsSection = ({ title, icon, children, badge = null }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {icon} {title}
        </Text>
        {badge && (
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require("../../assets/images/double-arrow.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerIcon}>🔧</Text>
        </View>

        {/* Profile Section */}
        {/* <SettingsSection title="Profile" icon="👤"> */}
        <SettingsItem
          title="Profile Settings"
          icon="🧑‍💼"
          onPress={() => handlePress("Edit Profile")}
        />
        <SettingsItem
          title="Account Settings"
          icon="🧾"
          onPress={() => handlePress("Change Profile Picture")}
        />
        <SettingsItem
          title="App Preferences"
          icon="📱"
          onPress={() => handlePress("Update Skills / Tags")}
        />
        <SettingsItem
          title="Notifications"
          icon="🔔"
          onPress={() => handlePress("Visibility")}
        />
        <SettingsItem
          title="Privacy & Security"
          icon="🔐"
          onPress={() => handlePress("Update Skills / Tags")}
        />
        <SettingsItem
          title="Payments & Wallet"
          icon="💳"
          onPress={() => handlePress("Visibility")}
        />

        <SettingsItem
          title="Task & Project Settings"
          icon="⚒️"
          onPress={() => handlePress("Update Skills / Tags")}
        />
        <SettingsItem
          title="Support & Legal"
          icon="📄"
          onPress={() => handlePress("Visibility")}
        />

        <SettingsItem
          title="About"
          icon="👥"
          onPress={() => handlePress("Update Skills / Tags")}
        />
        <SettingsItem title="Logout" onPress={() => signOut()} icon="🚪" />
        {/* </SettingsSection> */}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 12,
    marginRight: 8,
    fontFamily: "MontserratBold",
  },
  headerIcon: {
    fontSize: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginRight: 8,
    fontFamily: "MontserratBold",
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionBadge: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  sectionBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "black",
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingsItemText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
    fontFamily: "Monsterrat",
  },
  badge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Monsterrat",
    fontWeight: "600",
  },
  bottomPadding: {
    height: 20,
  },
});

export default SettingsScreen;
