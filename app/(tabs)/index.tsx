import React, { use, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  View,
} from "react-native";
// You'll likely need these icon libraries:
// expo install @expo/vector-icons
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { API_BASE_URL } from "../../env"; // Ensure this path is correct
import FlipCard from "@/components/FlipCard"; // Assuming this is used elsewhere or can be removed if not
import FloatingButtons from "@/components/FloatingButtons";
import { useSession } from "@/utils/AuthContext";
import { router } from "expo-router";
const { width } = Dimensions.get("window");
// import SwipeableCard from "@/components/SwipableCard"; // Assuming UserCard serves this purpose
import UserCard from "@/components/UserCard";

// ... (UNIVERSAL_IMAGE_URL, profileData, getSocialIcon - assuming these are for UserCard or other parts)

const ProfileScreen = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const PAGE_LIMIT = 10; // Defined in your component

  const { signOut, session } = useSession();
  const flatListRef = useRef<FlatList<any>>(null); // Added type for FlatList ref
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!session) {
      router.push("/welcome");
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchDiscoverableUsers(1); // Fetch initial users on mount/session change
    }
  }, [session]); // Removed page from dependency to avoid re-fetch on page change triggered by loadMore

  const fetchDiscoverableUsers = async (pageToLoad) => {
    if (loading || (pageToLoad > 1 && !hasMore)) return; // Prevent fetch if already loading or no more for subsequent pages

    setLoading(true);

    try {
      const loggedInUserId =
        typeof session === "string" ? session : session?.userId || session?.id;

      if (!loggedInUserId) {
        // This case should ideally be handled by the session check effect
        throw new Error("Invalid user session for fetching users.");
      }

      const res = await fetch(
        `${API_BASE_URL}/api/users/discover/${loggedInUserId}?page=${pageToLoad}&limit=${PAGE_LIMIT}`
      );

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Failed to fetch users" }));
        throw new Error(errorData.message || "Failed to fetch users");
      }

      const data = await res.json();

      if (data.length < PAGE_LIMIT) {
        setHasMore(false);
      }

      // Deduplicate users if fetching more and some might overlap (optional, depends on API)
      // For simplicity, direct concat or set based on pageToLoad
      setUsers((prevUsers) => {
        if (pageToLoad === 1) return data;
        // Basic deduplication based on ID
        const existingUserIds = new Set(prevUsers.map((u) => u.id));
        const newUniqueUsers = data.filter((u) => !existingUserIds.has(u.id));
        return [...prevUsers, ...newUniqueUsers];
      });
    } catch (err) {
      Alert.alert(
        "Fetch Users Error",
        err.message || "Something went wrong while fetching users."
      );
      setHasMore(false); // Stop trying if there's an error
    } finally {
      setLoading(false);
    }
  };

  const loadMoreUsers = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchDiscoverableUsers(nextPage);
        return nextPage;
      });
    }
  };

  // ----- FIXED handleSwipe Function -----
  const handleSwipe = async (type: "like" | "dislike") => {
    if (
      users.length === 0 ||
      currentIndex < 0 ||
      currentIndex >= users.length
    ) {
      // No user to swipe or index out of bounds
      return;
    }
    const userToInteractWith = users[currentIndex];
    if (!userToInteractWith) return;

    const loggedInUserId =
      typeof session === "string" ? session : session || session;

    if (!loggedInUserId) {
      Alert.alert("Error", "User session not found. Please log in again.");
      // Optionally, redirect to login: router.push("/welcome");
      return;
    }
    console.log("Logged in user ID:", loggedInUserId, userToInteractWith.id);

    if (type === "like") {
      try {
        // Ensure API_BASE_URL is correctly defined and accessible
        // The backend 'exports.likeUser' expects fromUserId and toUserId in the body.
        // Assuming your Express route for 'exports.likeUser' is POST '/api/likes'
        const res = await fetch(`${API_BASE_URL}/api/likes/like`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if your API requires it (e.g., JWT token)
            // "Authorization": `Bearer ${session.token}` // Example if session contains a token
          },
          body: JSON.stringify({
            fromUserId: loggedInUserId,
            toUserId: userToInteractWith.id,
          }),
        });

        const responseData = await res.json(); // Attempt to parse JSON regardless of res.ok status initially

        if (!res.ok) {
          // Use the error message from API if available, otherwise a default one
          throw new Error(
            responseData.error || `Failed to like user. Status: ${res.status}`
          );
        }

        // Handle successful like (e.g., match notification)
        if (responseData.message === "It's a match!") {
          Alert.alert("Congratulations!", "It's a match!");
          // You could add specific UI changes for a match here
        } else if (responseData.message === "Like recorded.") {
          console.log("Like recorded for user:", userToInteractWith.id);
          // Optionally, show a subtle confirmation
        } else if (responseData.error === "Already liked.") {
          console.log("User already liked:", userToInteractWith.id);
          // Decide if this should be an error or just proceed with swipe
          // For now, this is caught by !res.ok if status is 409
        }
      } catch (err) {
        // Alert the error message from the throw new Error() or a generic message
        Alert.alert(
          "Like Action Failed",
          err.message || "An unexpected error occurred."
        );
        return; // Important: Do not remove the card from UI if the like action failed
      }
    } else {
      // Handle 'dislike' action if needed (e.g., call a dislike API)
      console.log("Disliked user:", userToInteractWith.id);
    }

    // Proceed to remove card from UI for both successful 'like' and 'dislike'
    const newUsers = users.filter((_, index) => index !== currentIndex);
    setUsers(newUsers);

    if (newUsers.length === 0) {
      setCurrentIndex(0); // Reset or handle empty state
      // Consider fetching more users or showing an "out of profiles" message
      if (hasMore && !loading) {
        fetchDiscoverableUsers(1); // Attempt to fetch more if list becomes empty and more might exist
      } else {
        console.log("No more users to display.");
        // Show some UI indication that there are no more users
      }
    } else {
      // If the swiped card was the last one, new currentIndex should be the new last item.
      // Otherwise, currentIndex effectively stays (pointing to the item that took the swiped item's place).
      const nextVisibleIndex = Math.min(currentIndex, newUsers.length - 1);
      setCurrentIndex(nextVisibleIndex);

      // Scroll the FlatList to the new current card
      // This is crucial as scrollEnabled is false, so programmatic scroll is needed.
      if (flatListRef.current && newUsers.length > 0) {
        flatListRef.current.scrollToIndex({
          index: nextVisibleIndex,
          animated: true,
          viewPosition: 0.5, // Centers the card in view
        });
      }
    }

    // Check if we need to load more users proactively
    if (newUsers.length < PAGE_LIMIT / 2 && hasMore && !loading) {
      loadMoreUsers();
    }
  };
  // ----- END of FIXED handleSwipe -----

  // Conditional rendering for loading or empty state
  if (loading && users.length === 0 && page === 1) {
    // Initial load
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading profiles...</Text>
      </View>
    );
  }

  if (users.length === 0 && !loading && !hasMore) {
    // No users found or all swiped
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <Image
            source={require("../../assets/images/logo.png")} // Ensure path is correct
            resizeMode="contain" // Changed to contain for better logo display
            style={styles.logo}
          />
          <Ionicons
            name="settings-outline" // settings or settings-outline
            size={30}
            color="black"
            style={styles.settingsIcon}
            onPress={() => {
              signOut();
              // No need to push to /welcome here if the useEffect for !session handles it
            }}
          />
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, color: "#666" }}>
            No more profiles to show right now.
          </Text>
          <Text style={{ fontSize: 14, color: "#999", marginTop: 8 }}>
            Check back later!
          </Text>
        </View>
        {/* Floating buttons might still be shown or hidden based on preference */}
        <FloatingButtons
          onLike={() => handleSwipe("like")}
          onDislike={() => handleSwipe("dislike")}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../../assets/images/logo.png")} // Ensure path is correct
          resizeMode="contain" // Changed to contain for better logo display
          style={styles.logo}
        />
        <Ionicons
          name="settings-outline" // settings or settings-outline
          size={30}
          color="black"
          style={styles.settingsIcon}
          onPress={() => {
            signOut();
            // router.push("/welcome"); // useEffect for !session handles this
          }}
        />
      </View>

      {/* Render FlatList only if there are users */}
      {users.length > 0 && (
        <FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          data={users}
          keyExtractor={(item) => item.id.toString()} // Make sure item.id is unique and stable
          renderItem={(
            { item, index } // Pass index if UserCard needs to know if it's active
          ) => (
            <View
              style={{
                width: width, // Full screen width for each card
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 20, // Add some padding around cards
              }}
            >
              <UserCard userData={item} />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false} // Swiping is controlled by buttons
          onEndReached={loadMoreUsers} // For loading more users when nearing end (if scrollEnabled was true)
          onEndReachedThreshold={0.5} // (if scrollEnabled was true)
          // initialScrollIndex={currentIndex} // Not needed as we manage view with scrollToIndex
          // onViewableItemsChanged={onViewRef.current} // If you need to track visible items manually
          // viewabilityConfig={viewConfigRef.current} // For onViewableItemsChanged
        />
      )}

      {/* Render FloatingButtons only if there are users to interact with */}
      {users.length > 0 && (
        <FloatingButtons
          onLike={() => handleSwipe("like")}
          onDislike={() => handleSwipe("dislike")}
        />
      )}

      {/* Loading indicator for pagination */}
      {loading && users.length > 0 && (
        <View style={styles.loadingMoreContainer}>
          <Text>Loading more...</Text>
        </View>
      )}
    </View>
  );
};

// Add styles for headerContainer, logo, settingsIcon, loadingMoreContainer
const styles = StyleSheet.create({
  headerContainer: {
    height: 60, // Increased height for better spacing
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 40, // Handle status bar
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center logo
    backgroundColor: "white",
    paddingHorizontal: 16, // Added padding
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  logo: {
    width: 100,
    height: 40, // Adjusted for contain
  },
  settingsIcon: {
    position: "absolute",
    right: 16, // Position with padding
  },
  loadingMoreContainer: {
    position: "absolute",
    bottom: 80, // Adjust to be above floating buttons or as needed
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 10,
  },
  // ... any other styles you have from ProfileScreen or that UserCard/FloatingButtons might need if not self-contained
});

export default ProfileScreen;
