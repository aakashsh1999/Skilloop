// app/MessagesListScreen.tsx
"use client"; // Important for Expo Router to recognize this as a client component

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useSession } from "@/utils/AuthContext";
import { ChatAPI, ActiveChatSummary } from "@/api/index";
import io, { Socket } from "socket.io-client";
import { API_BASE_URL } from "@/env";

// --- NEW IMPORTS FOR NOTIFICATIONS ---
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device'; // To check if it's a physical device

// // --- NOTIFICATION HANDLER CONFIGURATION ---
// // This configures how notifications are handled when the app is in the foreground.
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true, // Display a native alert (banner)
//     shouldPlaySound: true, // Play a notification sound
//     shouldSetBadge: false, // Don't modify the app icon badge
//   }),
// });

const MessagesListScreen = () => {
  const router = useRouter();
  const { session } = useSession();

  // Safely extract loggedInUserId from the session object.
  // Adjust this based on the actual structure of your `session` object from `useSession`.
  // For example, if `session` is an object like `{ userId: '...' }`, use `session.userId`.
  // If `session` directly holds the userId string, then `session` is correct.
  const loggedInUserId =
    typeof session === "string" ? session : (session as any)?.userId;

  const [activeChats, setActiveChats] = useState<ActiveChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const expoPushTokenRef = useRef<string | null>(null); // Ref to store the Expo Push Token

  // --- Push Notification Setup ---
  // const registerForPushNotificationsAsync = useCallback(async () => {
  //   if (Device.isDevice) { // Only attempt to get a token on a physical device
  //     const { status: existingStatus } = await Notifications.getPermissionsAsync();
  //     let finalStatus = existingStatus;

  //     // If permission hasn't been granted, request it
  //     if (existingStatus !== 'granted') {
  //       const { status } = await Notifications.requestPermissionsAsync();
  //       finalStatus = status;
  //     }

  //     // If permission is still not granted, alert the user
  //     if (finalStatus !== 'granted') {
  //       Alert.alert('Permission Denied', 'Failed to get push token for push notifications! Please enable notifications in your device settings.');
  //       return;
  //     }

  //     // Get the Expo Push Token
  //     // const token = (await Notifications.getExpoPushTokenAsync()).data;
  //     console.log('Expo Push Token:', token);
  //     expoPushTokenRef.current = token;

  //     // --- Send the token to your backend ---
  //     // This step is CRUCIAL: your backend needs to store this token
  //     // associated with the `loggedInUserId` to send notifications later.
  //     if (loggedInUserId && token) {
  //       try {
  //         // You need to implement this `saveExpoPushToken` function in your `ChatAPI`
  //         await ChatAPI.saveExpoPushToken(loggedInUserId, token);
  //         console.log('Expo Push Token sent to backend successfully.');
  //       } catch (error) {
  //         console.error('Failed to send Expo Push Token to backend:', error);
  //       }
  //     }
  //   } else {
  //     // Alert if not on a physical device (push notifications don't work on emulators/simulators)
  //     Alert.alert('Not on physical device', 'Must use a physical device for Push Notifications');
  //   }

  //   // --- Android Specific: Notification Channel ---
  //   // For Android, you need to set up a notification channel for importance and sound.
  //   if (Platform.OS === 'android') {
  //     Notifications.setNotificationChannelAsync('default', {
  //       name: 'default',
  //       importance: Notifications.AndroidImportance.MAX, // High importance for chat messages
  //       vibrationPattern: [0, 250, 250, 250], // Vibrate pattern
  //       lightColor: '#FF231F7C', // Notification light color
  //     });
  //   }
  // }, [loggedInUserId]); // Re-run this effect if loggedInUserId changes

  // --- Effect Hook for Notification Registration and Listeners ---
  // useEffect(() => {
  //   registerForPushNotificationsAsync(); // Call the function to register for notifications

  //   // This listener fires whenever a notification is received while the app is foregrounded.
  //   const notificationListener = Notifications.addNotificationReceivedListener(notification => {
  //     console.log("Notification received in foreground:", notification);
  //     // You can add logic here to update UI, display a custom in-app banner,
  //     // or refresh the chat list if the notification contains relevant data.
  //     // Example: fetchActiveChats();
  //   });

  //   // This listener fires whenever a user taps on a notification (when the app is foregrounded, backgrounded, or killed).
  //   const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
  //     console.log("Notification response received (tapped):", response);
  //     const { notification } = response;
  //     // You would typically navigate to the specific chat screen here.
  //     // The `notification.request.content.data` object should contain
  //     // the `matchId` and `otherUserId` sent from your backend.
  //     //
  //     // Example navigation:
  //     // if (notification.request.content.data && notification.request.content.data.matchId) {
  //     //   router.push({
  //     //     pathname: "/chat/[id]",
  //     //     params: {
  //     //       id: notification.request.content.data.otherUserId, // Assuming you pass otherUserId
  //     //       userName: notification.request.content.data.otherUserName, // If you pass it
  //     //       userAvatar: notification.request.content.data.otherUserAvatar, // If you pass it
  //     //       matchId: notification.request.content.data.matchId,
  //     //     },
  //     //   });
  //     // }
  //   });

  //   // Cleanup: Remove notification listeners when the component unmounts
  //   return () => {
  //     Notifications.removeNotificationSubscription(notificationListener);
  //     Notifications.removeNotificationSubscription(responseListener);
  //   };
  // }, [registerForPushNotificationsAsync]); // Dependency array: Re-run this effect if `registerForPushNotificationsAsync` changes

  // --- Socket.IO Setup for Real-time Online Status and New Messages ---

  const fetchActiveChats = useCallback(async () => {
    if (!loggedInUserId) {
      setLoading(false);
      setIsRefreshing(false);
      console.warn("MessagesListScreen: Cannot fetch chats, userId is null.");
      return;
    }

    try {
      setLoading(true);
      const chats = await ChatAPI.getActiveChats(loggedInUserId);
      setActiveChats(chats);
      console.log("MessagesListScreen: Fetched active chats:", chats.length);
    } catch (error) {
      console.error("MessagesListScreen: Failed to fetch active chats:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load your chats. Please try again."
      );
      setActiveChats([]); // Clear chats on error
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [loggedInUserId]); // Dependency array: Re-create fetch function if loggedInUserId changes

  useEffect(() => {
    if (!loggedInUserId) {
      console.warn(
        "MessagesListScreen: No loggedInUserId found for socket connection."
      );
      return;
    }

    const socket = io(API_BASE_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("MessagesListScreen: Socket connected for online status.");
      socket.emit("registerUser", { userId: loggedInUserId });
    });

    socket.on(
      "userStatusChange",
      (data: { userId: string; isOnline: boolean }) => {
        console.log(
          `[Socket] User ${data.userId} is now ${
            data.isOnline ? "online" : "offline"
          }.`
        );
        setActiveChats((prevChats) =>
          prevChats.map((chat) =>
            chat.otherUserId === data.userId
              ? { ...chat, isOtherUserOnline: data.isOnline }
              : chat
          )
        );
      }
    );

    // --- Listen for new messages via Socket.IO ---
    socket.on("newMessage", (messageData: any) => {
      console.log("New message received via Socket.IO:", messageData);
      // Optimistically update the chat list with the new message
      setActiveChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          // If the new message belongs to an existing chat in the list
          if (chat.matchId === messageData.matchId) {
            return {
              ...chat,
              lastMessage: messageData.message,
              lastMessageTimestamp: messageData.createdAt,
              lastMessageSenderId: messageData.senderId,
              // You could also increment an unread count here if you implement it
              // unreadCount: chat.unreadCount + 1,
            };
          }
          return chat;
        });

        // If a new message comes in for an existing chat,
        // we should re-fetch the list to ensure it's ordered correctly (most recent at top).
        // This is more robust than trying to manually reorder.
        fetchActiveChats(); // Re-fetch the entire list to ensure proper ordering and state

        return updatedChats; // Return immediate update, fetch will correct later
      });
    });

    socket.on("disconnect", () => {
      console.log("MessagesListScreen: Socket disconnected.");
    });

    socket.on("connect_error", (err) => {
      console.error(
        "MessagesListScreen: Socket connection error:",
        err.message
      );
      Alert.alert(
        "Connection Error",
        "Could not connect to chat service. Please check your internet connection."
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("MessagesListScreen: Socket cleaned up.");
      }
    };
  }, [loggedInUserId, fetchActiveChats]); // Added fetchActiveChats to dependencies as it's called inside

  // --- Fetch Active Chats from Backend ---

  // Initial fetch when component mounts
  useEffect(() => {
    fetchActiveChats();
  }, [fetchActiveChats]); // Call fetchActiveChats when it changes (which is on loggedInUserId change)

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchActiveChats();
  }, [fetchActiveChats]);

  // Helper function to format time (you might want a more robust solution)
  const formatTime = (isoString: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "now";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    // Fallback to a simple date for older messages: MM/DD
    return date.toLocaleDateString([], { month: "numeric", day: "numeric" });
  };

  // Custom ContactItem component for rendering each chat summary
  const ContactItem = ({ contact }: { contact: ActiveChatSummary }) => {
    // Determine the message preview text
    let messagePreview = contact.lastMessage || "Start chatting!";
    if (contact.lastMessageSenderId === loggedInUserId) {
      messagePreview = `You: ${messagePreview}`;
    }

    return (
      <TouchableOpacity
        style={styles.contactItem}
        // Navigate to the ChatScreen, passing necessary parameters
        onPress={() =>
          router.push({
            pathname: "/chat/[id]", // Your dynamic route for the chat screen (e.g., app/chat/[id].tsx)
            params: {
              id: contact.otherUserId, // The ID of the other user in the chat
              userName: contact.otherUserName,
              userAvatar: contact.otherUserAvatar || "", // Ensure it's a string, even if empty
              matchId: contact.matchId, // IMPORTANT: Pass matchId to the chat screen
            },
          })
        }
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: contact.otherUserAvatar || "https://via.placeholder.com/60",
            }} // Placeholder if no avatar URL
            style={styles.avatar}
          />
          {contact.isOtherUserOnline && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactName}>{contact.otherUserName}</Text>
            <Text style={styles.contactTime}>
              {formatTime(contact.lastMessageTimestamp)}
            </Text>
          </View>
          <Text style={styles.contactMessage} numberOfLines={1}>
            {messagePreview}
          </Text>
        </View>
        {/* If your ActiveChatSummary includes `unreadCount`, you can re-enable this: */}
        {/* {contact.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{contact.unreadCount}</Text>
          </View>
        )} */}
      </TouchableOpacity>
    );
  };

  // --- Render Logic ---
  // Show a large activity indicator when initially loading and no chats are present
  if (loading && activeChats.length === 0 && !isRefreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          Loading your chats...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerIcon}>💬</Text>
      </View>

      <FlatList
        data={activeChats}
        keyExtractor={(item) => item.matchId} // Use matchId as unique key for each conversation
        renderItem={({ item }) => <ContactItem contact={item} />}
        contentContainerStyle={
          activeChats.length === 0 && !loading
            ? styles.emptyListContainer
            : styles.listContentContainer
        }
        // Display a message when the chat list is empty
        ListEmptyComponent={() =>
          !loading && ( // Only show empty message if not loading
            <View style={styles.emptyMessageContainer}>
              <Text style={styles.emptyMessageText}>No active chats yet.</Text>
              <Text style={styles.emptyMessageSubText}>
                Connect with new people to start chatting!
              </Text>
            </View>
          )
        }
        // Enable pull-to-refresh functionality
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={["#007AFF"]} // For Android
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, // Account for Android status bar
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth, // Subtle line at the bottom
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginRight: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Android shadow
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0", // Placeholder if image fails to load
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50", // Green for online
    borderWidth: 2,
    borderColor: "#fff",
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  contactTime: {
    fontSize: 12,
    color: "#666",
  },
  contactMessage: {
    fontSize: 14,
    color: "#666",
  },
  unreadBadge: {
    backgroundColor: "#FF3B30", // Red badge
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyListContainer: {
    flexGrow: 1, // Allows content to take up available space
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyMessageContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyMessageText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessageSubText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  // bottomNav and navItem styles are not directly used in this component's new logic
  // but keeping them for completeness if they are part of a parent layout.
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavItem: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: "#666",
  },
});

export default MessagesListScreen;
