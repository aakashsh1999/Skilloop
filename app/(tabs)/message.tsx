import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "@/env";
import { useSession } from "@/utils/AuthContext";

const MessageItem = ({ item, isPriority, onPress }) => (
  <TouchableOpacity
    style={[
      styles.messageItem,
      isPriority ? styles.priorityItem : styles.regularItem,
    ]}
    onPress={onPress}
  >
    <Image
      source={{ uri: item.user.avatar || "https://via.placeholder.com/50" }}
      style={styles.avatar}
    />
    <View style={styles.messageContent}>
      <Text style={styles.name}>{item.user.name}</Text>
      <Text style={styles.messagePreview} numberOfLines={1}>
        {item.lastMessage || "No messages yet"}
      </Text>
    </View>
    <View style={styles.statusContainer}>
      <View
        style={[
          styles.statusDot,
          { backgroundColor: item.statusColor || "gray" },
        ]}
      />
      <Text style={styles.statusText}>{item.status || "Offline"}</Text>
    </View>
  </TouchableOpacity>
);

export default function MessageScreen() {
  const { session } = useSession();
  const userId = session;
  const router = useRouter();

  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchChats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/list/${userId}`);
        const data = await res.json();
        console.log(data, "asdfds");
        setChatList(data);
      } catch (err) {
        console.error("Failed to load chat list", err);
      }
    };

    fetchChats();
  }, [userId]);

  const priorityChats = chatList?.filter((c) => c.status === "On") || [];
  const regularChats = chatList?.filter((c) => c.status !== "On") || [];

  const openChat = (chatWithUser) => {
    router.push({
      pathname: "/chat-screen",
      params: {
        chatWithUserId: chatWithUser.id,
        chatWithUserName: chatWithUser.name,
      },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Message</Text>

      {/* Priority */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Priority</Text>
        <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
      </View>
      <FlatList
        data={priorityChats}
        keyExtractor={(item) => item.user.id}
        renderItem={({ item }) => (
          <MessageItem
            item={item}
            isPriority
            onPress={() => openChat(item.user)}
          />
        )}
        scrollEnabled={false}
      />

      {/* Regular */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Message</Text>
        <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
      </View>
      <FlatList
        data={regularChats}
        keyExtractor={(item) => item.user.id}
        renderItem={({ item }) => (
          <MessageItem
            item={item}
            isPriority={false}
            onPress={() => openChat(item.user)}
          />
        )}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  priorityItem: {},
  regularItem: {},
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: "#555",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
});
