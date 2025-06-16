import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  StatusBar,
  View,
  RefreshControl,
  ScrollView, // Make sure ScrollView is imported
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../env";
import UserCard from "@/components/UserCard";
import FloatingButtons from "@/components/FloatingButtons";
import { useSession } from "@/utils/AuthContext";
import { useRouter } from "expo-router";

const PAGE_LIMIT = 10;

const ProfileScreen = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentUserCardRef = useRef(null);

  const router = useRouter();
  const { signOut, session } = useSession();

  useEffect(() => {
    if (session) {
      fetchDiscoverableUsers(1);
    } else {
      setUsers([]);
      setHasMore(false);
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [session]);

  const fetchDiscoverableUsers = useCallback(
    async (pageToLoad: number) => {
      if (loading || (pageToLoad > 1 && !hasMore)) return;

      if (pageToLoad === 1) {
        setHasMore(true); // Reset hasMore for a fresh load or refresh
      }

      setLoading(true);
      if (pageToLoad === 1) {
        setIsRefreshing(true);
      }

      try {
        const loggedInUserId =
          typeof session === "string"
            ? session
            : session?.userId || session?.id;

        if (!loggedInUserId) {
          throw new Error("Invalid user session for fetching users.");
        }

        const res = await fetch(
          `${API_BASE_URL}/api/users/recommendations/${loggedInUserId}?page=${pageToLoad}&limit=${PAGE_LIMIT}&radius=50`
        );

        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ message: "Failed to fetch users" }));
          throw new Error(errorData.message || "Failed to fetch users");
        }

        const responseData = await res.json();
        const {
          users: fetchedUsers,
          totalPages,
          page: currentPage,
        } = responseData;

        if (!Array.isArray(fetchedUsers)) {
          console.error(
            "API response does not contain a 'users' array:",
            responseData
          );
          throw new Error("Invalid data format received from server.");
        }

        setHasMore(currentPage < totalPages);

        setUsers((prevUsers) => {
          if (pageToLoad === 1) {
            return fetchedUsers;
          }
          const existingUserIds = new Set(prevUsers.map((u) => u.id));
          const newUniqueUsers = fetchedUsers.filter(
            (u) => !existingUserIds.has(u.id)
          );
          return [...prevUsers, ...newUniqueUsers];
        });
      } catch (err) {
        Alert.alert(
          "Fetch Users Error",
          (err as Error).message || "Something went wrong while fetching users."
        );
        setHasMore(false);
      } finally {
        setLoading(false);
        if (pageToLoad === 1) {
          setIsRefreshing(false);
        }
      }
    },
    [session, loading, hasMore]
  );

  const loadMoreUsers = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchDiscoverableUsers(nextPage);
        return nextPage;
      });
    }
  }, [loading, hasMore, fetchDiscoverableUsers]);

  const handleUserCardSwipe = useCallback(
    async (type: "like" | "dislike", userId: string) => {
      console.log(`User ${userId} was ${type} (gesture detected)!`);

      if (type === "like") {
        try {
          const loggedInUserId =
            typeof session === "string"
              ? session
              : session?.userId || session?.id;

          if (!loggedInUserId) {
            Alert.alert(
              "Error",
              "User session not found. Please log in again."
            );
            return;
          }

          const res = await fetch(`${API_BASE_URL}/api/likes/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fromUserId: loggedInUserId,
              toUserId: userId,
            }),
          });

          const responseData = await res.json();

          if (!res.ok) {
            throw new Error(
              responseData.error || `Failed to like user. Status: ${res.status}`
            );
          }

          if (responseData.message === "It's a match!") {
            Alert.alert("Congratulations!", "It's a match!");
          } else {
            console.log("Like recorded for user:", userId);
          }
        } catch (err) {
          Alert.alert(
            "Like Action Failed",
            (err as Error).message || "An unexpected error occurred."
          );
        }
      } else {
        console.log("Disliked user:", userId);
      }
    },
    [session]
  );

  const handleCardRemoved = useCallback(
    (userId: string) => {
      console.log(
        `Card for ${userId} animation completed, removing from stack.`
      );
      setUsers((prevUsers) => {
        const newUsers = prevUsers.slice(1);
        if (newUsers.length < PAGE_LIMIT / 2 && hasMore && !loading) {
          loadMoreUsers();
        }
        return newUsers;
      });
    },
    [hasMore, loading, loadMoreUsers]
  );

  const triggerUserCardSwipe = useCallback(
    (type: "like" | "dislike") => {
      if (currentUserCardRef.current && users.length > 0) {
        currentUserCardRef.current.forceSwipe(type);
      } else {
        console.warn("UserCard ref not available or no users.");
      }
    },
    [users.length]
  );

  const onRefresh = useCallback(() => {
    setPage(1);
    setUsers([]); // Clear users when refreshing
    setHasMore(true); // Assume there might be more after refresh
    fetchDiscoverableUsers(1);
  }, [fetchDiscoverableUsers]);

  // Consolidate the rendering logic to always include the ScrollView
  return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          resizeMode="contain"
          style={styles.logo}
        />
        <Ionicons
          name="settings-outline"
          size={30}
          color="black"
          style={styles.settingsIcon}
          onPress={() => router.push("/(settings)")}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      >
        {loading && users.length === 0 && page === 1 ? (
          <View style={styles.initialLoadingContainer}>
            <Text style={styles.initialLoadingText}>Loading profiles...</Text>
          </View>
        ) : users.length > 0 ? (
          <View style={styles.cardWrapper}>
            <UserCard
              ref={currentUserCardRef}
              userData={users[0]}
              onSwipe={handleUserCardSwipe}
              onCardRemoved={handleCardRemoved}
            />
          </View>
        ) : (
          // This block now renders inside the ScrollView
          <View style={styles.noMoreCardsContainer}>
            <Text style={styles.noMoreCardsText}>
              No more profiles to show right now.
            </Text>
            <Text style={styles.noMoreCardsSubText}>Check back later!</Text>
          </View>
        )}

        {loading && users.length > 0 && (
          <View style={styles.loadingMoreContainer}>
            <Text>Loading more profiles...</Text>
          </View>
        )}
      </ScrollView>

      {users.length > 0 && (
        <FloatingButtons
          onLike={() => triggerUserCardSwipe("like")}
          onDislike={() => triggerUserCardSwipe("dislike")}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    zIndex: 1,
    paddingBottom: 20,
  },
  logo: {
    width: 100,
    height: 40,
  },
  settingsIcon: {
    position: "absolute",
    right: 16,
  },
  scrollViewContent: {
    backgroundColor: "white",
    flexGrow: 1,
    // Add these two styles to ensure content takes full height
    // and correctly positions when there are no cards
    minHeight:
      Dimensions.get("window").height -
      (Platform.OS === "android" ? StatusBar.currentHeight : 40) -
      60, // Subtract header height
    justifyContent: "center", // Center content vertically
  },
  cardWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    zIndex: 0,
  },
  loadingMoreContainer: {
    // Keep this positioning if you want it absolutely at the bottom of the scroll view content
    position: "absolute", // This makes it relative to its parent `scrollViewContent`
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 10,
    // To ensure it appears when no card is present, it might need different logic
    // Or simpler: remove 'position: "absolute"' and it will flow with content
  },
  noMoreCardsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noMoreCardsText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  noMoreCardsSubText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginTop: 8,
  },
  initialLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  initialLoadingText: {
    fontSize: 18,
    color: "#666",
  },
});

export default ProfileScreen;
