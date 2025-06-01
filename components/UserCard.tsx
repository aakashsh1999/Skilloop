import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import FlipCard from "./FlipCard"; // Assuming FlipCard is in components folder

const { width } = Dimensions.get("window");

// Use the provided URL for all images
const UNIVERSAL_IMAGE_URL =
  "https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDBBMEhxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D";

// Helper function to get the correct icon component and name for social links
const getSocialIcon = (type) => {
  switch (type) {
    case "linkedin":
      return { Component: FontAwesome, name: "linkedin", color: "#0A66C2" };
    case "instagram":
      return { Component: FontAwesome, name: "instagram", color: "#E4405F" };
    case "website":
      return { Component: Feather, name: "globe", color: "#555" };
    case "email":
      return { Component: Feather, name: "mail", color: "#555" };
    case "behance":
      return {
        Component: MaterialCommunityIcons,
        name: "behance",
        color: "#1769FF",
      };
    default:
      return null;
  }
};

const UserCard = ({ userData }) => {
  if (!userData) {
    return (
      <View style={styles.cardPlaceholder}>
        <Text>No user data to display.</Text>
      </View>
    );
  }

  const displayData = userData.user; // Assuming the structure is { user: { ...profileData } }
  const businessCard = userData.business_card || {};

  const handleLinkPress = async (url) => {
    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(`Don't know how to open this link: ${url}`);
      }
    }
  };

  const renderLogoItem = ({
    item,
    type,
  }: {
    item: any;
    type: "experience" | "certification";
  }) => <FlipCard item={item} type={type} />;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled // Allows inner scroll view to work within PanResponder
    >
      <Text
        style={{
          color: "black",
          fontSize: 34,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        {displayData?.name || "John Doe"}
      </Text>

      {/* Featured Image 1 */}
      <Image
        source={{ uri: displayData?.profile_image || UNIVERSAL_IMAGE_URL }}
        style={styles.featuredImage}
        resizeMode="cover"
      />

      {/* Engagement Buttons/Indicators */}
      <View style={styles.engagementButtons}>
        <View style={styles.engagementButton}>
          <Feather
            name="calendar"
            size={20}
            color="black"
            style={{ marginRight: 4 }}
          />{" "}
          <Text style={styles.engagementText}>{displayData?.age || "N/A"}</Text>
        </View>
        <View style={styles.engagementButton}>
          <Feather
            name="user"
            size={20}
            color="black"
            style={{ marginRight: 4 }}
          />{" "}
          <Text style={styles.engagementText}>
            {displayData?.gender || "N/A"}
          </Text>
        </View>
        <View style={styles.engagementButton}>
          <Ionicons
            name="location-outline"
            size={20}
            color="black"
            style={{ marginRight: 4 }}
          />{" "}
          <Text style={styles.engagementText}>
            {displayData?.location || "N/A"}
          </Text>
        </View>
      </View>

      {/* Profile Summary Section */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryJobTitle}>
            {businessCard?.role || "Role not specified"}
          </Text>
          <Text style={styles.summaryEmploymentStatus}>
            {businessCard?.company || "Company not specified"}
          </Text>
          {businessCard?.website && (
            <TouchableOpacity
              onPress={() => handleLinkPress(businessCard.website)}
            >
              <Text style={styles.summaryWebsiteLink}>Website/Portfolio</Text>
            </TouchableOpacity>
          )}

          {/* Social Icons */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={styles.summarySocialIcons}>
              {displayData?.social_links?.map((link, index) => {
                const iconInfo = getSocialIcon(link.type);
                if (!iconInfo) return null;
                const IconComponent = iconInfo.Component;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleLinkPress(link.url)}
                    style={styles.socialIcon}
                  >
                    <IconComponent
                      name={iconInfo.name}
                      size={20}
                      color={iconInfo.color || "#555"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            <View
              style={{
                borderRadius: 100,
                backgroundColor: "white",
                borderWidth: 1,
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="briefcase-outline" size={20} color="black" />
            </View>
          </View>
        </View>
      </View>

      {/* Featured Image 2 */}
      <Image
        source={{
          uri: displayData?.anything_but_professional || UNIVERSAL_IMAGE_URL,
        }}
        style={styles.featuredImage}
        resizeMode="cover"
      />

      {/* Description */}
      <Text style={styles.descriptionText}>
        {displayData?.short_bio || "No bio available."}
      </Text>

      {/* Featured Image 3 (Placeholder as per original structure, using the same image) */}
      <Image
        source={{
          uri: displayData?.anything_but_professional || UNIVERSAL_IMAGE_URL,
        }}
        style={styles.featuredImage}
        resizeMode="cover"
      />

      {/* --- Experience Section --- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <Text style={styles.sectionCount}>
          {displayData?.work_experience?.length
            ? `+${displayData.work_experience.length}`
            : "0"}
        </Text>
      </View>
      <FlatList
        data={displayData?.work_experience || []}
        renderItem={({ item }) => renderLogoItem({ item, type: "experience" })}
        keyExtractor={(item, index) => `exp-${item.id || index}`}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
      />

      {/* --- Certification Section --- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Certification</Text>
        <Text style={styles.sectionCount}>
          {displayData?.certificates?.length
            ? `+${displayData.certificates.length}`
            : "0"}
        </Text>
      </View>
      <FlatList
        data={displayData?.certificates || []}
        renderItem={({ item }) =>
          renderLogoItem({ item, type: "certification" })
        }
        keyExtractor={(item, index) => `cert-${item.id || index}`}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 24,
  },
  cardPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
  },
  featuredImage: {
    width: "100%",
    aspectRatio: 1 / 1,
    borderRadius: 60,
    borderWidth: 1,
  },
  engagementButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginVertical: 20,
  },
  engagementButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  engagementText: {
    fontSize: 15,
    color: "black",
    fontWeight: "light",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 60,
    padding: 15,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 40,
    paddingVertical: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    position: "relative",
  },
  summaryContent: {
    marginBottom: 10,
  },
  summaryJobTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  summaryEmploymentStatus: {
    fontSize: 20,
    color: "#555",
    marginBottom: 8,
  },
  summaryWebsiteLink: {
    fontSize: 20,
    color: "#007AFF",
    marginBottom: 12,
  },
  summarySocialIcons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  socialIcon: {
    marginHorizontal: 8,
    padding: 4,
  },
  descriptionText: {
    fontSize: 24,
    marginVertical: 30,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 40,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionCount: {
    fontSize: 16,
    color: "#2E5ED7",
    fontWeight: "bold",
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 10,
  },
});

export default UserCard;
