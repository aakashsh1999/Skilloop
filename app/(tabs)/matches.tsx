import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native";
import {
  LikesAPI,
  MatchesAPI,
  LikerProfile,
  MatchedUserProfile,
} from "@/api/index";
import { useSession } from "@/utils/AuthContext";
import { router } from "expo-router";
import SummaryCard, { ProfileSummaryData } from "@/components/SummarCard";

// 1. ENHANCE CombinedProfileData: Add `matchId`
interface CombinedProfileData extends ProfileSummaryData {
  sortDate: string; // The date used for sorting (likedAt or matchedAt)
  isLikedYou: boolean; // True if this entry represents a "liked you" relationship
  isMutualMatch: boolean; // True if this entry represents a mutual match
  matchId?: string; // NEW: Optional matchId for mutual matches
}

const LikesYouScreen = () => {
  const { session } = useSession();
  const loggedInUserId =
    typeof session === "string"
      ? session
      : session?.userId || session?.id || null;

  const [combinedProfiles, setCombinedProfiles] = useState<
    CombinedProfileData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCombinedProfiles = useCallback(
    async (isInitialOrRefresh: boolean = false) => {
      if (!loggedInUserId) {
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (loading && !isInitialOrRefresh) return;
      if (isRefreshing && !isInitialOrRefresh) return;

      if (isInitialOrRefresh) {
        setIsRefreshing(true);
        setCombinedProfiles([]); // Clear data for fresh load
      }
      setLoading(true);

      try {
        const likesResponse = await LikesAPI.getReceivedLikes(
          loggedInUserId,
          1,
          100
        );
        const allLikes: LikerProfile[] = likesResponse.likers;

        const allMatches: MatchedUserProfile[] =
          await MatchesAPI.getUserMatches(loggedInUserId);

        const profilesMap = new Map<string, CombinedProfileData>();

        // 2. UPDATE fetchCombinedProfiles: Store `match.id` for mutual matches
        allMatches.forEach((match) => {
          const socialLinks =
            match.socialLinks?.map((profile) => ({
              type: profile.type.toLowerCase(),
              url: profile.url,
            })) || [];

          profilesMap.set(match.id, {
            id: match.id,
            name: match.name,
            age: match.age,
            gender: match.gender,
            avatar: match.avatar || match.profile_image,
            profile_image: match.profile_image,
            title: match.title || "No title provided",
            website: match.website,
            socialLinks: socialLinks,
            matched: true,
            isApproved: true,
            sortDate: match.matchedAt,
            isLikedYou: false,
            isMutualMatch: true,
            matchId: match.matchId, // Store the match ID here!
          });
        });

        allLikes.forEach((liker) => {
          if (!profilesMap.has(liker.id)) {
            const socialLinks =
              liker.business_card?.socialProfiles?.map((profile) => ({
                type: profile.platform.toLowerCase(),
                url: profile.url,
              })) || [];

            profilesMap.set(liker.id, {
              id: liker.id,
              name: liker.name,
              age: liker.age,
              gender: liker.gender,
              avatar: liker.avatar || liker.profile_image,
              profile_image: liker.profile_image,
              title:
                liker.business_card?.role ||
                liker.short_bio ||
                "No title provided",
              website: liker.business_card?.portfolio || null,
              socialLinks: socialLinks,
              matched: false,
              isApproved: false,
              sortDate: liker.createdAt,
              isLikedYou: true,
              isMutualMatch: false,
              matchId: undefined, // No matchId for pending likes
            });
          }
        });

        const sortedCombinedProfiles = Array.from(profilesMap.values()).sort(
          (a, b) =>
            new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
        );

        setCombinedProfiles(sortedCombinedProfiles);
      } catch (err) {
        console.error("Error fetching combined profiles:", err);
        Alert.alert(
          "Error",
          (err as Error).message || "Failed to load connections."
        );
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [loggedInUserId]
  );

  useEffect(() => {
    if (loggedInUserId) {
      fetchCombinedProfiles(true);
    }
  }, [loggedInUserId, fetchCombinedProfiles]);

  const handleApproveMatch = useCallback(
    async (otherUserId: string) => {
      if (!loggedInUserId) {
        Alert.alert("Error", "User session not found.");
        return;
      }

      try {
        const result = await MatchesAPI.approveMatch(
          loggedInUserId,
          otherUserId
        );

        // 3. UPDATE handleApproveMatch: Set `matchId` when a new match occurs
        setCombinedProfiles((prev) =>
          prev
            .map((profile) => {
              if (profile.id === otherUserId) {
                return {
                  ...profile,
                  isApproved: true,
                  matched: result.matched,
                  isMutualMatch: result.matched,
                  sortDate: result.matched
                    ? result.match.matchedAt // Use new matchedAt
                    : profile.sortDate,
                  matchId: result.matched // Set matchId if it's a mutual match
                    ? result.match.id
                    : profile.matchId, // Keep existing if not a new match
                };
              }
              return profile;
            })
            .sort(
              (a, b) =>
                new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
            )
        );

        if (result.matched) {
          Alert.alert("Congratulations!", "It's a match! You can now chat.");
        } else {
          Alert.alert(
            "Approval Sent",
            result.message ||
              "Approval recorded. Waiting for the other person to approve."
          );
        }
        return result;
      } catch (err) {
        console.error("Error approving match:", err);
        const errorMessage =
          (err as Error).message || "An unexpected error occurred.";
        Alert.alert("Error", errorMessage);
        throw err;
      }
    },
    [loggedInUserId]
  );

  const openChatScreen = useCallback(
    (user: CombinedProfileData) => {
      // Change type to CombinedProfileData to access matchId
      if (!loggedInUserId) {
        Alert.alert("Error", "User session not found.");
        return;
      }
      if (!user.isMutualMatch || !user.matchId) {
        // Check isMutualMatch and if matchId exists
        Alert.alert("Error", "Chat is only available for mutual matches.");
        return;
      }

      // 4. MODIFY openChatScreen: Pass the matchId
      router.push({
        pathname: "/chat/[id]",
        params: {
          id: user.id, // This is the otherUserId for the chat screen
          userName: user.name,
          userAvatar: user.avatar || user.profile_image || "",
          matchId: user.matchId, // Pass the matchId here!
        },
      });
    },
    [loggedInUserId]
  );

  const renderFooter = () => {
    return null;
  };

  const renderEmptyComponent = () => {
    if (!loading && !isRefreshing && combinedProfiles.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No connections yet.</Text>
          <Text style={styles.emptySubText}>
            Keep swiping to find new people!
          </Text>
        </View>
      );
    }
    return null;
  };

  if (loading && combinedProfiles.length === 0 && !isRefreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading connections...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Connections</Text>
      </View>
      <FlatList
        data={combinedProfiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SummaryCard
            profileData={item}
            onApprove={handleApproveMatch}
            onChatPress={openChatScreen}
          />
        )}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={
          combinedProfiles.length === 0 && !loading && !isRefreshing
            ? styles.emptyListContent
            : {}
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchCombinedProfiles(true)}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
});

export default LikesYouScreen;
