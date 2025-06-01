import { useContext, createContext, type PropsWithChildren } from "react";
import useStorageState from "./useStorageState"; // Assuming useStorageState is correctly implemented
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the shape of your authentication context
const AuthContext = createContext<{
  signIn: (newSession: string) => void; // signIn now accepts a session string
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => {
    // Default dummy function, will be overridden by the provider
    console.warn("signIn function not yet initialized");
  },
  signOut: () => {
    // Default dummy function, will be overridden by the provider
    console.warn("signOut function not yet initialized");
  },
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export default function SessionProvider({ children }: PropsWithChildren) {
  // useStorageState will manage the 'session' state in local storage
  // It returns [isLoading, sessionData], and a function to set sessionData
  const [[isLoading, session], setSession] = useStorageState("session");

  return (
    <AuthContext.Provider
      value={{
        signIn: async (userData: string) => {
          console.log(userData, "asdfsdf");
          // When signing in, set the new session token
          // This would typically come from an authentication API response
          setSession(userData);
          await AsyncStorage.setItem("session", userData);
        },
        signOut: async () => {
          // When signing out, clear the session token
          await AsyncStorage.removeItem("session");

          setSession(null);
        },
        session, // The current session state from useStorageState
        isLoading, // The loading state from useStorageState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
