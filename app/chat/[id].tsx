import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSession } from "@/utils/AuthContext";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/env";
import { ChatAPI, ChatMessage as ApiChatMessage } from "@/api/index";

interface LocalChatMessage extends ApiChatMessage {
  senderType: "me" | "other" | "system" | "suggestion";
}

const ChatScreen = () => {
  const { session } = useSession();
  const loggedInUserId =
    typeof session === "string"
      ? session
      : session?.userId || session?.id || null;

  const params = useLocalSearchParams();
  const {
    id: otherUserId,
    userName,
    userAvatar,
    matchId,
  } = params as {
    id: string;
    userName: string;
    userAvatar: string;
    matchId: string;
  };

  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // --- Socket.IO Connection and Event Handling ---
  useEffect(() => {
    if (!loggedInUserId || !matchId) {
      console.warn("Missing loggedInUserId or matchId for chat.");
      setLoading(false);
      return;
    }

    const socket = io(API_BASE_URL, {
      transports: ["websocket"],
      // You might need to add auth headers here if your backend requires it for socket connections
      // auth: { token: 'your_auth_token_here' }
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setSocketConnected(true);
      socket.emit("joinChat", { userId: loggedInUserId, matchId });
    });

    socket.on("chatJoined", (message) => {
      console.log("Chat joined:", message);
      fetchHistoricalMessages();
    });

    socket.on("receiveMessage", (newMessage: ApiChatMessage) => {
      console.log("Message received:", newMessage);
      setMessages((prevMessages) => {
        // Prevent adding duplicate if it was an optimistic update from *this* client
        // This check is important if you later decide to re-introduce optimistic updates
        // For now, with optimistic updates removed, this ensures messages are unique.
        if (prevMessages.find((msg) => msg.id === newMessage.id)) {
          return prevMessages; // Message already exists, likely from a previous optimistic update that was confirmed
        }

        const senderType =
          newMessage.senderId === loggedInUserId ? "me" : "other";
        return [
          ...prevMessages,
          {
            ...newMessage,
            senderType,
            createdAt: new Date(newMessage.createdAt).toISOString(),
          },
        ];
      });
    });

    socket.on("chatError", (error: string) => {
      console.error("Chat Error:", error);
      Alert.alert("Chat Error", error);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected.");
      setSocketConnected(false);
      Alert.alert(
        "Disconnected",
        "You have been disconnected from chat. Please refresh."
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [loggedInUserId, matchId]);

  // --- Fetch Historical Messages ---
  const fetchHistoricalMessages = useCallback(async () => {
    if (!loggedInUserId || !matchId) return;

    try {
      setLoading(true);
      const history = await ChatAPI.getChatMessages(matchId, loggedInUserId);
      const formattedHistory: LocalChatMessage[] = history.map((msg) => ({
        ...msg,
        senderType: msg.senderId === loggedInUserId ? "me" : "other",
      }));
      setMessages(formattedHistory);
    } catch (error) {
      console.error("Failed to fetch historical messages:", error);
      Alert.alert("Error", "Failed to load chat history.");
    } finally {
      setLoading(false);
    }
  }, [loggedInUserId, matchId]);

  // --- Send Message Function ---
  const sendMessage = () => {
    if (messageInput.trim() === "") return;
    if (!socketRef.current || !socketConnected) {
      Alert.alert("Error", "Not connected to chat server.");
      return;
    }
    if (!loggedInUserId || !otherUserId || !matchId) {
      Alert.alert("Error", "Missing chat context (user/match IDs).");
      return;
    }

    const messageData = {
      matchId,
      senderId: loggedInUserId,
      receiverId: otherUserId,
      message: messageInput.trim(),
    };

    socketRef.current.emit("sendMessage", messageData);
    setMessageInput(""); // Clear input immediately

    // REMOVED OPTIMISTIC UI UPDATE HERE.
    // The message will now appear in the UI only when the server
    // broadcasts it back via `receiveMessage`.
  };

  // --- Message Bubble Component (unchanged) ---
  const MessageBubble = ({ message }: { message: LocalChatMessage }) => {
    if (message.senderType === "system") {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{message.message}</Text>
          <TouchableOpacity style={styles.sendTaskButton}>
            <Text style={styles.sendTaskText}>Send a task</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (message.senderType === "suggestion") {
      return (
        <TouchableOpacity style={styles.suggestionBubble}>
          <Text style={styles.suggestionText}>{message.message}</Text>
        </TouchableOpacity>
      );
    }

    const isMyMessage = message.senderId === loggedInUserId;

    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText,
          ]}
        >
          {message.message}
        </Text>
        <Text
          style={isMyMessage ? styles.myMessageTime : styles.otherMessageTime}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  console.log(
    loggedInUserId,
    matchId,
    otherUserId,
    userName,
    "ChatScreen Debug Info"
  );

  if (!loggedInUserId || !matchId || !otherUserId || !userName) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Error: Missing chat information. Please go back.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#007AFF", marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading || !socketConnected) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>
          {socketConnected
            ? "Loading chat history..."
            : "Connecting to chat..."}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.contactInfo}>
        <Image
          source={{ uri: userAvatar || "https://via.placeholder.com/40" }}
          style={styles.contactAvatar}
        />
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{userName}</Text>
        </View>
        <View style={styles.contactActions}>
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionIcon}>📹</Text>
          <Text style={styles.actionIcon}>ℹ️</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Initial system message upon match */}
        <MessageBubble
          message={{
            id: "sys-1",
            matchId: matchId,
            senderId: "system", // Consider using a unique ID for system/suggestion messages if you store them
            receiverId: loggedInUserId,
            message: `You and ${userName} matched!\nStart a conversation or propose a task`,
            createdAt: new Date().toISOString(),
            senderType: "system",
          }}
        />
        {/* Initial suggestion message */}
        <MessageBubble
          message={{
            id: "sugg-1",
            matchId: matchId,
            senderId: "suggestion", // Consider using a unique ID for system/suggestion messages if you store them
            receiverId: loggedInUserId,
            message: "Ask about their Work",
            createdAt: new Date().toISOString(),
            senderType: "suggestion",
          }}
        />

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={messageInput}
            onChangeText={setMessageInput}
            placeholder="message..."
            multiline
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
  },
  backButton: {
    fontSize: 24,
    color: "#000",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  contactRole: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  portfolioLink: {
    fontSize: 14,
    color: "#007AFF",
  },
  contactActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionIcon: {
    fontSize: 20,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messagesContentContainer: {
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
    flexDirection: "column",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#000",
  },
  myMessageTime: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  otherMessageTime: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 10,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  systemMessage: {
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  systemMessageText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  sendTaskButton: {
    backgroundColor: "#FFB800",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendTaskText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
  },
  suggestionBubble: {
    alignSelf: "center",
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 4,
  },
  suggestionText: {
    color: "#007AFF",
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e0e0e0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  attachButton: {
    padding: 8,
  },
  attachIcon: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    lineHeight: 22,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    padding: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    color: "#fff",
    fontSize: 16,
  },
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

export default ChatScreen;
