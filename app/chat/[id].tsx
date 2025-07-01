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
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BusinessCard from "@/components/SummarCard";

interface LocalChatMessage extends ApiChatMessage {
  senderType: "me" | "other" | "system" | "suggestion";
  messageStatus?: "sending" | "sent" | "error";
}

interface QuickActionMessage {
  text: string;
  message: string;
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
  const [isChatEmpty, setIsChatEmpty] = useState(true);
  const [otherUserData, setOtherUserData] = useState<any>(null);

  console.log(otherUserData, "adfddfs");

  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickActionMessages: QuickActionMessage[] = [
    {
      text: "👋 Say Hi",
      message: "Hey there! 👋 Just wanted to say hi and connect!",
    },
    {
      text: "🤝 Propose Project",
      message:
        "Hi! I came across your profile and think we might be a good fit for a project I'm working on. Would you be open to chatting about a potential collaboration?",
    },
    {
      text: "💬 Ask About Their Work",
      message:
        "Hey! Your work looks really interesting. I'd love to hear more about what you're currently working on!",
    },
  ];

  useEffect(() => {
    if (scrollViewRef.current) {
      const scrollTimeout = setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages]);

  async function getOtherUserData() {
    const otherData = await JSON.parse(
      await AsyncStorage.getItem("otherUserData")
    );
    if (otherData) {
      setOtherUserData(otherData);
    }
  }
  useEffect(() => {
    getOtherUserData();
  }, []);

  useEffect(() => {
    setIsChatEmpty(messages.length === 0);
  }, [messages.length]);

  useEffect(() => {
    if (!loggedInUserId || !matchId) {
      setLoading(false);
      return;
    }

    const socket = io(API_BASE_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("joinChat", { userId: loggedInUserId, matchId });
    });

    socket.on("chatJoined", (message) => {
      fetchHistoricalMessages();
    });

    socket.on("receiveMessage", (receivedMessage: ApiChatMessage) => {
      setMessages((prevMessages) => {
        // If message with this ID already exists, ignore
        if (prevMessages.some((msg) => msg.id === receivedMessage.id)) {
          return prevMessages;
        }

        // Replace optimistic "sending" message if found
        const index = prevMessages.findIndex(
          (msg) =>
            msg.senderId === receivedMessage.senderId &&
            msg.message === receivedMessage.message &&
            msg.messageStatus === "sending"
        );

        const newMessage: LocalChatMessage = {
          ...receivedMessage,
          senderType:
            receivedMessage.senderId === loggedInUserId ? "me" : "other",
          messageStatus: "sent",
          createdAt: new Date(receivedMessage.createdAt).toISOString(),
        };

        if (index !== -1) {
          // Replace the optimistic message
          const updatedMessages = [...prevMessages];
          updatedMessages[index] = newMessage;
          return updatedMessages;
        }

        // If no optimistic message found, just append
        return [...prevMessages, newMessage];
      });
    });

    socket.on("chatError", (error: string) => {
      Alert.alert("Chat Error", error);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      Alert.alert(
        "Disconnected",
        "You have been disconnected from the chat. Please try refreshing the screen."
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [loggedInUserId, matchId]);

  const fetchHistoricalMessages = useCallback(async () => {
    if (!loggedInUserId || !matchId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const history = await ChatAPI.getChatMessages(matchId, loggedInUserId);
      const formattedHistory: LocalChatMessage[] = history.map((msg) => ({
        ...msg,
        senderType: msg.senderId === loggedInUserId ? "me" : "other",
        messageStatus: "sent",
      }));
      setMessages(formattedHistory);
    } catch (error) {
      Alert.alert("Error", "Failed to load chat history.");
    } finally {
      setLoading(false);
    }
  }, [loggedInUserId, matchId]);

  const sendMessage = useCallback(
    (messageToSend: string) => {
      if (messageToSend.trim() === "") return;
      if (!socketRef.current || !socketConnected) {
        Alert.alert("Error", "Not connected to chat server.");
        return;
      }
      if (!loggedInUserId || !otherUserId || !matchId) {
        Alert.alert("Error", "Missing chat context (user/match IDs).");
        return;
      }

      const tempMessageId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      const messageData = {
        matchId,
        senderId: loggedInUserId,
        receiverId: otherUserId,
        message: messageToSend.trim(),
      };

      socketRef.current.emit("sendMessage", messageData);

      const optimisticMessage: LocalChatMessage = {
        id: tempMessageId,
        matchId,
        senderId: loggedInUserId,
        receiverId: otherUserId,
        message: messageToSend.trim(),
        createdAt: new Date().toISOString(),
        senderType: "me",
        messageStatus: "sending",
      };

      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

      setMessageInput("");
    },
    [socketConnected, loggedInUserId, otherUserId, matchId]
  );

  const handleQuickActionPress = (messageText: string) => {
    sendMessage(messageText);
  };

  const MessageBubble = ({ message }: { message: LocalChatMessage }) => {
    const isMyMessage = message.senderId === loggedInUserId;

    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMyMessage && (
          <View
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: 0.5,
              shadowRadius: 16.0,
              elevation: 24,
              position: "absolute",
              left: -35,
              alignSelf: "center", // Center vertically relative to bubble
              bottom: 2.5, // Place at bottom of bubble
              zIndex: -1,
              width: 50,
              height: 50,
            }}
          >
            <Image
              source={{ uri: message.senderAvatar }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#fff", // ensures shadow appears clearly
              }}
            />
          </View>
        )}
        <Text
          style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText,
          ]}
        >
          {message.message}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={isMyMessage ? styles.myMessageTime : styles.otherMessageTime}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isMyMessage && message.messageStatus === "sending" && (
            <Text style={styles.messageStatus}>Sending...</Text>
          )}
        </View>
      </View>
    );
  };

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
      {/* <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "default"}
      /> */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonTouchable}
        >
          <Image
            source={require("../../assets/images/double-arrow.png")}
            style={styles.backArrowIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.contactInfo}>
        {otherUserData && (
          <BusinessCard profileData={otherUserData} showActionButtons={false} />
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {isChatEmpty && (
          <>
            <Text style={styles.initialPromptText}>
              You and {userName} Matched.
            </Text>
            <Text style={styles.initialPromptSubText}>
              Start a conversation or propose a task
            </Text>
          </>
        )}

        {isChatEmpty && (
          <View style={styles2.quickActionButtonsContainer}>
            {quickActionMessages.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles2.quickActionButton,
                  index === 0 ? styles2.editButton : styles2.customizeButton,
                ]}
                onPress={() => handleQuickActionPress(action.message)}
              >
                <Text
                  style={[
                    styles2.quickActionButtonText,
                    index === 0
                      ? styles2.editButtonText
                      : styles2.customizeButtonText,
                  ]}
                >
                  {action.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        style={styles.inputContainer}
      >
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconBtn}>
            <Image
              source={require("../../assets/images/upload.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Image
              source={require("../../assets/images/notes.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />{" "}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Image
              source={require("../../assets/images/task.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="message..."
          style={styles.textInput}
          placeholderTextColor="#999"
          value={messageInput}
          onChangeText={setMessageInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={() => {
            sendMessage(messageInput);
            setMessageInput("");
          }}
          blurOnSubmit={false}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
              sendMessage(messageInput);
              setMessageInput("");
            }
          }}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Image
            source={require("../../assets/images/mic.png")}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  backButtonTouchable: {
    padding: 8,
  },
  backArrowIcon: {
    width: 24,
    height: 24,
    tintColor: "#000",
  },
  headerSpacer: {
    flex: 1,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  contactActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionIcon: {
    fontSize: 22,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  messagesContentContainer: {
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 35,
    marginVertical: 6,
    flexDirection: "column",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#D9D9D9",
    borderWidth: 1,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    marginLeft: 30,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: "Montserrat",
  },
  myMessageText: {
    color: "black",
  },
  otherMessageText: {
    color: "#000",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  myMessageTime: {
    color: "rgba(0,0,0,0.7)",
    fontSize: 8,
  },
  otherMessageTime: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 8,
  },
  messageStatus: {
    color: "rgba(0,0,20,0.7)",
    fontSize: 8,
    fontFamily: "Montserrat",
    marginLeft: 8,
  },
  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    marginHorizontal: 10,
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attachButton: {
    padding: 8,
  },
  attachIcon: {
    fontSize: 20,
    color: "#666",
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderLeftWidth: 1,
    borderColor: "#e0e0e0",
    fontFamily: "Montserrat",
    maxHeight: 100,
    fontSize: 16,
    lineHeight: 22,
  },
  sendButton: {
    backgroundColor: "#BFD5CD",
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
    fontWeight: "bold",
  },
  sendIconDisabled: {
    color: "#ccc",
  },
  initialPromptText: {
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Montserrat",
    fontWeight: "600",
    marginTop: 20,
  },
  initialPromptSubText: {
    textAlign: "center",
    marginTop: 5,
    fontSize: 16,
    fontFamily: "Montserrat",
    color: "#666",
    marginBottom: 20,
  },
  iconRow: {
    flexDirection: "row",
    paddingVertical: 8,
    marginRight: 8,
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    width: 30,
    height: 30,
    backgroundColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    elevation: 1,
  },
});

const styles2 = StyleSheet.create({
  quickActionButtonsContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "white",
    marginTop: 10,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    maxWidth: 300,
    width: "100%",
  },
  editButton: {
    backgroundColor: "#F6D3BD",
    borderColor: "#F6D3BD",
  },
  editButtonText: {
    fontFamily: "Montserrat",
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  customizeButton: {
    backgroundColor: "#BFD5CD",
    borderColor: "#BFD5CD",
  },
  customizeButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
  quickActionButtonText: {},
});

export default ChatScreen;
