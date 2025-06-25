import { useSession } from "@/utils/AuthContext";
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
      <Icon name={icon} size={16} color="#999" />
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
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerIcon}>🔧</Text>
        </View>

        {/* Profile Section */}
        <SettingsSection title="Profile" icon="👤">
          <SettingsItem
            title="Edit Profile"
            onPress={() => handlePress("Edit Profile")}
          />
          <SettingsItem
            title="Change Profile Picture"
            onPress={() => handlePress("Change Profile Picture")}
          />
          <SettingsItem
            title="Update Skills / Tags"
            onPress={() => handlePress("Update Skills / Tags")}
          />
          <SettingsItem
            title="Visibility"
            onPress={() => handlePress("Visibility")}
          />
          <SettingsItem title="Logout" onPress={() => signOut()} />
        </SettingsSection>

        {/* Account Section */}
        <SettingsSection title="Account" icon="💼">
          <SettingsItem
            title="Email & Phone"
            onPress={() => handlePress("Email & Phone")}
          />
          <SettingsItem
            title="Password"
            onPress={() => handlePress("Password")}
          />
          <SettingsItem
            title="Linked Accounts"
            onPress={() => handlePress("Linked Accounts")}
          />
          <SettingsItem
            title="Delete Account"
            onPress={() => handlePress("Delete Account")}
          />
        </SettingsSection>

        {/* App Preferences Section */}
        <SettingsSection title="App Preferences" icon="📱">
          <SettingsItem
            title="Dark Mode / Light Mode"
            onPress={() => handlePress("Dark Mode / Light Mode")}
          />
          <SettingsItem
            title="Language Preference"
            onPress={() => handlePress("Language Preference")}
          />
          <SettingsItem
            title="Swipe Preferences"
            onPress={() => handlePress("Swipe Preferences")}
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications" icon="🔔">
          <SettingsItem
            title="Push Notifications"
            onPress={() => handlePress("Push Notifications")}
          />
          <SettingsItem
            title="Email Notifications"
            onPress={() => handlePress("Email Notifications")}
          />
        </SettingsSection>

        {/* Privacy & Security Section */}
        <SettingsSection title="Privacy & Security" icon="🛡️">
          <SettingsItem
            title="Blocked Users List"
            onPress={() => handlePress("Blocked Users List")}
          />
          <SettingsItem
            title="2-Factor Authentication"
            onPress={() => handlePress("2-Factor Authentication")}
          />
          <SettingsItem
            title="App Lock (Face ID / PIN)"
            onPress={() => handlePress("App Lock (Face ID / PIN)")}
          />
        </SettingsSection>

        {/* Support & Legal Section */}
        <SettingsSection title="Support & Legal" icon="❓">
          <SettingsItem
            title="Help Center / FAQ"
            onPress={() => handlePress("Help Center / FAQ")}
          />
          <SettingsItem
            title="Contact Support"
            onPress={() => handlePress("Contact Support")}
          />
          <SettingsItem
            title="Report a Bug"
            onPress={() => handlePress("Report a Bug")}
          />
          <SettingsItem
            title="Terms & Conditions"
            onPress={() => handlePress("Terms & Conditions")}
          />
          <SettingsItem
            title="Privacy Policy"
            onPress={() => handlePress("Privacy Policy")}
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About" icon="ℹ️">
          <SettingsItem
            title="Version"
            onPress={() => handlePress("Version")}
          />
          <SettingsItem
            title="Follow Us"
            onPress={() => handlePress("Follow Us")}
          />
          <SettingsItem
            title="Rate Us"
            onPress={() => handlePress("Rate Us")}
          />
          <SettingsItem
            title="Give Feedback"
            onPress={() => handlePress("Give Feedback")}
          />
        </SettingsSection>

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
    marginRight: 8,
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
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
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
    fontWeight: "600",
  },
  bottomPadding: {
    height: 20,
  },
});

export default SettingsScreen;
