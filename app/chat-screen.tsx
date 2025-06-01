import React, { useEffect, useState, useRef, useCallback, use } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import io from "socket.io-client";
import { API_BASE_URL } from "@/env";
import { useLocalSearchParams } from "expo-router";
import { useSession } from "@/utils/AuthContext";

export default function ChatScreen() {
  const session = useSession();
  const userId = session;
  // route.params: { chatWithUserId, chatWithUserName }
  const { chatWithUserId, chatWithUserName } = useLocalSearchParams();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef();

  // Fetch chat history when screen loads
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/chat/history/${userId}/${chatWithUserId}`)
      .then((res) => res.json())
      .then((data) => {
        // Sort messages ascending by createdAt just in case
        const sorted = data?.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sorted);
      })
      .catch((err) => {
        console.error("Failed to fetch chat history", err);
        Alert.alert("Error", "Failed to load chat history.");
      })
      .finally(() => setLoading(false));
  }, [userId, chatWithUserId]);

  // Connect to socket server
  useEffect(() => {
    socketRef.current = io(API_BASE_URL, {
      query: { userId },
    });

    socketRef.current.on("connect", () => {
      setSocketConnected(true);
      console.log("Connected to chat server");
    });

    socketRef.current.on("disconnect", () => {
      setSocketConnected(false);
      console.log("Disconnected from chat server");
    });

    socketRef.current.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("error_message", (error) => {
      Alert.alert("Error", error);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  // Send message
  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!socketConnected) {
      Alert.alert("Error", "Not connected to chat server.");
      return;
    }

    const msgObj = {
      senderId: userId,
      receiverId: chatWithUserId,
      message: trimmed,
    };

    socketRef.current.emit("send_message", msgObj);
    setInput("");
  };

  // Render each message
  const renderMessage = useCallback(
    ({ item }) => {
      const isSender = item.senderId === userId;
      return (
        <View
          style={[
            styles.messageContainer,
            isSender ? styles.sender : styles.receiver,
          ]}
        >
          <Text style={styles.messageText}>{item.message}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      );
    },
    [userId]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: null })}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.header}>Chat with {chatWithUserName}</Text>

      {loading ? (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: "center", marginTop: 20 }}
          size="large"
          color="#007AFF"
        />
      ) : (
        <FlatList
          data={messages.slice().reverse()} // reverse for inverted flatlist
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 10 }}
          inverted
          keyboardShouldPersistTaps="handled"
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          style={styles.input}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={[styles.sendButton, !input.trim() && { opacity: 0.5 }]}
          disabled={!input.trim()}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
    backgroundColor: "#eee",
    textAlign: "center",
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    maxWidth: "80%",
  },
  sender: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  receiver: {
    backgroundColor: "#ECECEC",
    alignSelf: "flex-start",
  },
  messageText: { fontSize: 16 },
  timestamp: {
    fontSize: 10,
    color: "#555",
    marginTop: 5,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    marginLeft: 10,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});
