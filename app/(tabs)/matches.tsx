// screens/ConnectionsScreen.js
import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../env"; // Make sure this is correct
import { useSession } from "@/utils/AuthContext";

const getSocialIcon = (type) => {
  switch (type) {
    case "linkedin":
      return {
        Component: FontAwesome,
        name: "linkedin-square",
        color: "#0A66C2",
      };
    case "instagram":
      return { Component: FontAwesome, name: "instagram", color: "#E4405F" };
    case "email":
      return { Component: Feather, name: "mail", color: "#000" };
    case "whatsapp":
      return {
        Component: MaterialCommunityIcons,
        name: "whatsapp",
        color: "#25D366",
      };
    case "upwork":
      return {
        Component: MaterialCommunityIcons,
        name: "upwork",
        color: "#64BF33",
      };
    case "dribbble":
      return {
        Component: MaterialCommunityIcons,
        name: "dribbble",
        color: "#EA4C89",
      };
    default:
      return null;
  }
};
const SummaryCard = ({
  profileData,
  handleLinkPress,
  onApprove,
  onChatPress,
}) => {
  const [isApproved, setIsApproved] = useState(profileData.isApproved || false);

  const handleApprovePress = async () => {
    try {
      await onApprove(profileData.id);
      setIsApproved(true);
      Alert.alert("Success", "Match approved! You can now chat.");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to approve match.");
    }
  };
  return (
    <View style={styles.summaryCard}>
      <Image
        source={{
          uri: profileData?.avatar || "https://via.placeholder.com/150",
        }}
        style={styles.avatar}
      />
      <View style={styles.summaryContent}>
        <Text style={styles.summaryJobTitle}>
          {profileData?.title || "N/A"}
        </Text>
        {profileData.website && (
          <TouchableOpacity
            onPress={() => handleLinkPress(profileData.website)}
          >
            <Text style={styles.summaryWebsiteLink}>Website/Portfolio</Text>
          </TouchableOpacity>
        )}
        <View style={styles.summarySocialIcons}>
          {profileData.socialLinks &&
            Array.isArray(profileData.socialLinks) &&
            profileData.socialLinks.map((link, index) => {
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
      </View>

      <View style={{ paddingLeft: 10 }}>
        {isApproved ? (
          <TouchableOpacity onPress={onChatPress}>
            <Ionicons name="chatbubble-ellipses" size={28} color="#007AFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleApprovePress}>
            <Ionicons name="checkmark-circle-outline" size={28} color="green" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ConnectionsScreen = () => {
  const [likedByUsers, setLikedByUsers] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(true);
  const [errorLikes, setErrorLikes] = useState(null);

  const router = useRouter();
  const { session } = useSession(); // user ID

  // Function to open chat screen
  const openChatScreen = (user) => {
    router.push(
      `/chat-screen?chatWithUserId=${encodeURIComponent(
        user.id
      )}&chatWithUserName=${encodeURIComponent(user.name)}`
    );
  };

  useEffect(() => {
    const fetchUsersWhoLikedMe = async () => {
      if (!session) {
        setLoadingLikes(false);
        return;
      }
      try {
        setLoadingLikes(true);
        setErrorLikes(null);

        const response = await fetch(
          `${API_BASE_URL}/api/likes/liked-by/${session}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch likes.");
        }

        const data = await response.json();

        // Add isApproved flag based on your match logic (false by default)
        // You may want to enhance this by fetching existing matches and checking approved state
        const formattedLikes = data.map((user) => {
          const socialLinksFromBusinessCard =
            user.business_card?.socialProfiles?.map((profile) => ({
              type: profile.platform.toLowerCase(),
              url: profile.url,
            })) || [];

          return {
            id: user.id,
            avatar: user.profile_image || "https://via.placeholder.com/150",
            name: user.name || "Unknown",
            title:
              user.business_card?.role || user.short_bio || "No title provided",
            website: user.business_card?.portfolio || null,
            socialLinks: socialLinksFromBusinessCard,
            isApproved: false, // default, update if needed by fetching matches
          };
        });

        setLikedByUsers(formattedLikes);
      } catch (err) {
        console.error("Error fetching likes:", err);
        setErrorLikes(err.message || "Something went wrong.");
        Alert.alert(
          "Error",
          err.message || "Failed to load users who liked you."
        );
      } finally {
        setLoadingLikes(false);
      }
    };

    fetchUsersWhoLikedMe();
  }, [session]);

  const approveMatch = async (likedUserId) => {
    console.log("Approving match:", likedUserId, session);
    if (!session) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/likes/matches/${likedUserId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session, likedUserId }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to approve match");
      }

      return await res.json();
    } catch (err) {
      throw err;
    }
  };

  const handleLinkPress = async (url) => {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Cannot Open Link", "Could not open the URL: " + url);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={{ marginHorizontal: 15 }}>
        <Text style={styles.title}>Your Connections</Text>
        <Text style={{ color: "#555", marginVertical: 10 }}>
          Connections fetching is disabled. (You can re-enable your `getMatches`
          logic here if needed.)
        </Text>

        <Text style={[styles.title, { marginTop: 30 }]}>
          People Who Liked You
        </Text>

        {loadingLikes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Loading people who liked you...</Text>
          </View>
        ) : errorLikes ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorLikes}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setErrorLikes(null);
                setLoadingLikes(true);
                // Re-fetch likes:
                (async () => {
                  try {
                    const response = await fetch(
                      `${API_BASE_URL}/api/likes/liked-by/${session}`
                    );
                    if (!response.ok) throw new Error("Failed to fetch likes");
                    const data = await response.json();
                    setLikedByUsers(data);
                  } catch (err) {
                    setErrorLikes(err.message);
                  } finally {
                    setLoadingLikes(false);
                  }
                })();
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : likedByUsers.length === 0 ? (
          <View style={styles.noConnectionsContainer}>
            <Text style={styles.noConnectionsText}>
              No users have liked you yet.
            </Text>
            <Text style={styles.noConnectionsSubText}>
              Keep your profile awesome!
            </Text>
          </View>
        ) : (
          <FlatList
            data={likedByUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SummaryCard
                profileData={item}
                handleLinkPress={handleLinkPress}
                onApprove={approveMatch}
                onChatPress={() => openChatScreen(item)}
              />
            )}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 20,
  },
  summaryCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 60,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  summaryContent: {
    flex: 1,
  },
  summaryJobTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
  summaryWebsiteLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
    marginTop: 5,
    marginBottom: 8,
    fontSize: 14,
  },
  summarySocialIcons: {
    flexDirection: "row",
    marginTop: 5,
  },
  socialIcon: {
    marginRight: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },
  noConnectionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  noConnectionsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  noConnectionsSubText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
});

export default ConnectionsScreen;
