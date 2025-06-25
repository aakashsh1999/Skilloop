import { API_BASE_URL } from "../env"; // Make sure your env.ts or similar file exports API_BASE_URL

// Define the structure of a liker profile received from the backend
export interface LikerProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string; // Assuming 'location' is part of the LikerProfile
  profile_image?: string; // Main profile image (optional, use avatar as fallback)
  avatar?: string; // Potentially for chat UI, fallback if profile_image is null
  short_bio?: string;
  skill_type?: string;
  business_card?: {
    // Detailed structure based on your Prisma schema
    role?: string;
    portfolio?: string;
    socialProfiles?: Array<{
      platform: string; // e.g., 'linkedin', 'github', 'website'
      url: string;
    }>;
  };
  // Add other fields you might need that come from the backend's User model
}

// Define the response structure for getReceivedLikes
interface ReceivedLikesResponse {
  likers: LikerProfile[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Define the response structure for a successful like action
interface SendLikeResponse {
  message: string;
  liked: boolean; // Indicates if the like was recorded
  matched: boolean; // Indicates if a mutual match was formed immediately (should be false for a pure "like" action)
}

export const LikesAPI = {
  /**
   * Fetches a paginated list of users who have liked the specified user.
   * These are 'pending' likes that the current user can choose to approve.
   * @param userId The ID of the user whose received likes to fetch.
   * @param page The page number (default: 1).
   * @param limit The number of items per page (default: 10).
   * @returns {Promise<ReceivedLikesResponse>} The paginated list of likers.
   */
  async getReceivedLikes(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReceivedLikesResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/likes/received/${userId}?page=${page}&limit=${limit}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to fetch received likes: ${response.statusText}`
        );
      }
      return data;
    } catch (error) {
      console.error("Error in LikesAPI.getReceivedLikes:", error);
      throw error;
    }
  },

  /**
   * Sends a like from one user to another.
   * This action can also trigger a mutual match if the 'toUser' has already liked the 'fromUser'.
   * @param fromUserId The ID of the user sending the like.
   * @param toUserId The ID of the user receiving the like.
   * @returns {Promise<SendLikeResponse>} The response from the server, indicating like success and if a match occurred.
   */
  async sendLike(
    fromUserId: string,
    toUserId: string
  ): Promise<SendLikeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/likes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId, toUserId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || `Failed to send like: ${response.statusText}`
        );
      }
      return data;
    } catch (error) {
      console.error("Error in LikesAPI.sendLike:", error);
      throw error;
    }
  },

  /**
   * (Optional) Removes a like from one user to another.
   * @param fromUserId The ID of the user who originally sent the like.
   * @param toUserId The ID of the user who received the like.
   * @returns {Promise<{ message: string }>} Confirmation message.
   */
  async unlike(
    fromUserId: string,
    toUserId: string
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/likes/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId, toUserId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || `Failed to unlike user: ${response.statusText}`
        );
      }
      return data;
    } catch (error) {
      console.error("Error in LikesAPI.unlike:", error);
      throw error;
    }
  },
};

// Define the structure of a matched user profile received from the backend
// This should align with the 'formattedMatchResponse' from the backend's /api/matches/approve endpoint
// and the output of /api/matches/:userId
export interface MatchedUserProfile {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  profile_image?: string; // Main profile image
  avatar?: string; // Potentially for chat UI, fallback
  title?: string; // Job title or role from business card or bio
  website?: string | null; // From business card
  socialLinks?: Array<{ type: string; url: string }>; // From business card
  matchId: string; // The ID of the match record
  matchedAt: string; // Timestamp when the mutual match was created (ISO string)
  // Add other fields you might need for a matched user
}

// Define the response structure for the approve match endpoint
interface ApproveMatchResponse {
  message: string;
  match: MatchedUserProfile; // The full match object with other user's profile data
  matched: boolean; // Crucial: Indicates if it *became* a mutual match after this approval
}

export const MatchesAPI = {
  /**
   * Sends an approval for a received like, potentially creating a mutual match.
   * This is typically called when a user views their "Likes You" list and accepts an incoming like.
   * @param currentUserId The ID of the currently logged-in user who is performing the approval.
   * @param otherUserId The ID of the user whose like is being approved.
   * @returns {Promise<ApproveMatchResponse>} The response from the server, including `message`, `matched` status, and the `match` object if successful.
   */
  async approveMatch(
    currentUserId: string,
    otherUserId: string
  ): Promise<ApproveMatchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentUserId, otherUserId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || `Failed to approve match: ${response.statusText}`
        );
      }
      return data;
    } catch (error) {
      console.error("Error in MatchesAPI.approveMatch:", error);
      throw error;
    }
  },

  /**
   * Fetches all mutual matches for a given user.
   * These are the users with whom the current user can now chat.
   * @param userId The ID of the user whose matches to fetch.
   * @returns {Promise<MatchedUserProfile[]>} An array of matched user profiles.
   */
  async getUserMatches(userId: string): Promise<MatchedUserProfile[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${userId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || `Failed to fetch matches: ${response.statusText}`
        );
      }
      // The backend should return an array of MatchedUserProfile directly.
      return data;
    } catch (error) {
      console.error("Error in MatchesAPI.getUserMatches:", error);
      throw error;
    }
  },
};
export interface ActiveChatSummary {
  matchId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  isOtherUserOnline: boolean;
  lastMessage: string | null;
  lastMessageTimestamp: string | null; // ISO string
  lastMessageSenderId: string | null;
  approvedByUser1: boolean;
  approvedByUser2: boolean;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string; // ISO string timestamp
  senderName?: string; // Optional: Backend can provide sender name
  senderAvatar?: string; // Optional: Backend can provide sender avatar
}

export const ChatAPI = {
  getActiveChats: async (userId: string): Promise<ActiveChatSummary[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chats/active/${userId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch active chats.");
      }
      const data: ActiveChatSummary[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error in ChatAPI.getActiveChats:", error);
      throw error;
    }
  },
  /**
   * Fetches historical chat messages for a specific match.
   * @param matchId The ID of the match.
   * @param userId The ID of the current logged-in user (for backend verification).
   * @returns {Promise<ChatMessage[]>} An array of chat messages.
   */
  async getChatMessages(
    matchId: string,
    userId: string
  ): Promise<ChatMessage[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chats/${matchId}/messages?userId=${userId}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to fetch chat messages: ${response.statusText}`
        );
      }
      return data;
    } catch (error) {
      console.error("Error in ChatAPI.getChatMessages:", error);
      throw error;
    }
  },

  saveExpoPushToken: async (userId: string, token: string): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/save-expo-token`,
        {
          // Make sure this endpoint matches your backend
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // **IMPORTANT**: If your API requires authentication, add your auth token here
            // 'Authorization': `Bearer ${yourAuthToken}`, // e.g., from useSession or AsyncStorage
          },
          body: JSON.stringify({ userId, token }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to save Expo push token on backend."
        );
      }
      console.log("Expo push token successfully sent to backend.");
    } catch (error) {
      console.error("Error in ChatAPI.saveExpoPushToken:", error);
      throw error;
    }
  },
};
