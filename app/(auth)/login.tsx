import React, { use, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
  ViewStyle,
  TextStyle,
  Image,
} from "react-native";
import * as Linking from "expo-linking";

import Svg, { Path } from "react-native-svg";
import { Feather } from "@expo/vector-icons"; // Import Feather from Expo Vector Icons
import OtpModal from "@/components/OTPModal";
import { API_BASE_URL } from "@/env";
import { useRouter } from "expo-router";
import { useSession } from "@/utils/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { makeRedirectUri, startAsync } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { toast } from "@/hooks/useToast";

// --- PhoneInput Component (Inline) ---
interface PhoneInputProps {
  onPhoneChange: (phone: string) => void;
  defaultCountryCode?: string;
}

WebBrowser.maybeCompleteAuthSession();

// Generate redirect URI
const redirectTo = makeRedirectUri({
  scheme: "skilloop",
  path: "welcome",
  useProxy: true,
});

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);

  const { access_token, refresh_token } = params;
  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) throw error;
  return data.session;
};

// Generic OAuth login handler
const performOAuth = async (provider: "github" | "google") => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(
    data?.url ?? "",
    redirectTo
  );

  if (res.type === "success") {
    const { url } = res;
    return createSessionFromUrl(url);
  }
};

const PhoneInput: React.FC<PhoneInputProps> = ({
  onPhoneChange,
  defaultCountryCode = "+91",
}) => {
  const [phone, setPhone] = useState("");

  const handlePhoneChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setPhone(value);
      onPhoneChange(value);
    }
  };

  return (
    <View style={phoneInputStyles.container}>
      <Text style={phoneInputStyles.label}>Phone Number</Text>
      <View style={phoneInputStyles.inputWrapper}>
        <View style={phoneInputStyles.countryCodeContainer}>
          <Text style={phoneInputStyles.countryCodeText}>
            {defaultCountryCode}
          </Text>
        </View>
        <TextInput
          style={phoneInputStyles.textInput}
          placeholder="Enter your phone number"
          placeholderTextColor="#9CA3AF"
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>
    </View>
  );
};

const phoneInputStyles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "black",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 25,
  },
  countryCodeContainer: {
    justifyContent: "center",
    paddingLeft: 16,
    paddingRight: 8,
  },
  countryCodeText: {
    color: "#6B7280",
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    height: 48,
    paddingVertical: 12,
    paddingRight: 16,
    fontSize: 16,
    color: "#1F2937",
  },
});

// --- Button Component (Inline) ---
interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  type?: "primary" | "secondary";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  type = "primary",
  style,
  textStyle,
  disabled = false,
  isLoading = false,
}) => {
  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isButtonDisabled}
      style={[
        buttonStyles.base,
        type === "primary" ? buttonStyles.primary : buttonStyles.secondary,
        isButtonDisabled && buttonStyles.disabled,
        style,
      ]}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={type === "primary" ? "#4A5568" : "#374151"} />
      ) : (
        <Text
          style={[
            buttonStyles.textBase,
            type === "primary"
              ? buttonStyles.textPrimary
              : buttonStyles.textSecondary,
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  base: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primary: {
    backgroundColor: "#F5D0B5",
    color: "black",
    borderWidth: 1,
    borderColor: "black",
  },
  secondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "black",
  },
  textBase: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  textPrimary: {
    color: "black",
  },
  textSecondary: {
    color: "black",
  },
  disabled: {
    opacity: 0.5,
  },
});

// --- Divider Component (Inline) ---
interface DividerProps {
  text: string;
}

const Divider: React.FC<DividerProps> = ({ text }) => {
  return (
    <View style={dividerStyles.container}>
      <View style={dividerStyles.line} />
      <Text style={dividerStyles.text}>{text}</Text>
      <View style={dividerStyles.line} />
    </View>
  );
};

const dividerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  line: {
    flexGrow: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  text: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#6B7280",
  },
});

// --- SocialButton Component (Inline) ---
interface SocialButtonProps {
  provider: "apple" | "google";
  onPress: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, onPress }) => {
  const getIcon = () => {
    if (provider === "apple") {
      return (
        <Svg viewBox="0 0 24 24" width="24" height="24">
          <Path
            d="M9 18c-4.5 2-5-2-7-2"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M16 22l5-5-5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M8.5 14c-1.5 0-3-1-2.4-3 .1-.4.6-1.1 1.4-1.5 0-1 .4-2 1-2.5 1.5-1.2 4-.5 5 .5 3-1.2 4.5 0 5 1 .8 1.5-.5 2-1 2.5 3.5 1 2 5.5-2 5.5-1.5 0-3-.5-4-2-.5 1-1.5 2-3 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    } else {
      return (
        <Svg viewBox="0 0 24 24" width="24" height="24">
          <Path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <Path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <Path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <Path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </Svg>
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={socialButtonStyles.button}
      activeOpacity={0.7}
    >
      {getIcon()}
    </TouchableOpacity>
  );
};

const socialButtonStyles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});

interface LogoProps {
  style?: ViewStyle;
}

const Logo: React.FC<LogoProps> = ({ style }) => {
  return (
    // <View style={[logoStyles.container, style]}>
    <Image
      source={require("../../assets/images/skilloop.png")}
      style={logoStyles.logoImage}
    />
  );
};

const logoStyles = StyleSheet.create({
  logoImage: {
    width: "100%",
    height: 30,
    resizeMode: "contain",
    marginTop: 20,
    marginBottom: 20,
  },
});

// --- AuthForm Component (Inline) ---
const AuthForm: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const { signIn } = useSession();
  const [mobileWithCode, setMobileWithCode] = useState(""); // store full mobile with code
  const router = useRouter(); // Change this to your real backend base URL

  // Function to send OTP request
  const handlePhoneSubmit = async () => {
    if (phone.length < 10) {
      Alert.alert(
        "Invalid Phone Number",
        "Enter a valid phone number (10 digits)."
      );
      return;
    }

    setIsLoading(true);
    try {
      const fullMobile = `+91${phone}`;
      setMobileWithCode(fullMobile);

      const response = await fetch(`${API_BASE_URL}/api/auth/otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile_number: fullMobile }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpModalVisible(true);
        Alert.alert("OTP Sent", `OTP sent to ${fullMobile}`);
      } else {
        Alert.alert("Error", data.error || "Failed to send OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    }
    setIsLoading(false);
  };

  // Function to verify OTP by calling backend
  const handleVerifyOtp = async (otp: string) => {
    if (!otp) {
      Alert.alert("Invalid OTP", "Please enter the OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile_number: mobileWithCode,
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok && data.message) {
        setOtpModalVisible(false);
        Alert.alert("Success", data.message);

        if (data.isNewUser) {
          // New user flow: Show registration or further steps
          router.push({
            pathname: "/(registration)",
            params: { mobile: data.mobile_number }, // Pass mobile number as param
          });
          console.log("New user detected:", data.mobile_number);
          // TODO: navigate to registration screen
        } else {
          // Existing user: login successful, handle JWT or navigation
          console.log("User logged in:", data.user.id);
          signIn(data.user.id);
          router.replace("/(tabs)");
        }
      } else {
        Alert.alert("OTP Verification Failed", data.error || "Invalid OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    }
    setIsLoading(false);
  };

  const url = Linking.useURL();
  // Handle deep links
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url).then((s) => {
        if (s) handleSession(s);
      });
    }
  }, [url]);

  // Handle new session and store tokens
  const handleSession = async (s: any) => {
    console.log("handleSession", s);

    const { user } = s;
    const id = user?.id;

    if (!id) return;
    try {
      console.log("checkSession", id);
      // Check if user exists in your custom `profiles` or `users` table
      const { data, error } = await supabase
        .from("users") // or 'profiles', depending on your schema
        .select("*")
        .eq("id", id as string)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        await AsyncStorage.removeItem("session");
        await AsyncStorage.setItem(
          "gmail_user",
          JSON.stringify({
            id: id,
            isGoogle: true,
          })
        );
        toast({
          title: "Google Signup",
          description: "You have successfully signed in with Google.",
          variant: "success",
        });
        // User not found – navigate to register page
        router.push("/(registration)");
      } else {
        console.log("sddd");
        // User exists – navigate to home or dashboard
        signIn(id);
        router.replace("/"); // adjust as needed
      }
    } catch (err) {
      console.error("Error checking user:", err);
      Alert.alert("Error", "There was a problem checking your account.");
    }
  };

  return (
    <View style={authFormStyles.container}>
      <PhoneInput onPhoneChange={setPhone} />
      <Button
        onPress={handlePhoneSubmit}
        disabled={phone.length < 10 || isLoading}
        isLoading={isLoading}
        style={authFormStyles.phoneButton}
      >
        Continue with Phone
      </Button>

      <Divider text="or continue with" />

      <View style={authFormStyles.socialButtonsContainer}>
        <SocialButton
          provider="google"
          onPress={() => {
            performOAuth("google");
          }}
        />
      </View>

      <OtpModal
        visible={otpModalVisible}
        onClose={() => setOtpModalVisible(false)}
        onVerify={handleVerifyOtp}
        phone={phone}
      />
    </View>
  );
};

const authFormStyles = StyleSheet.create({
  container: {
    width: "100%",
  },
  phoneButton: {
    marginTop: 24,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    gap: 24,
  },
});

// --- AuthPage Component (Main Component) ---
const AuthPage: React.FC = () => {
  return (
    <SafeAreaView style={authPageStyles.safeArea}>
      <View style={authPageStyles.container}>
        <View style={authPageStyles.card}>
          <Logo style={authPageStyles.logo} />

          <Text style={authPageStyles.subtitle}>
            Sign in or create an account to continue
          </Text>

          <AuthForm />
        </View>
      </View>
    </SafeAreaView>
  );
};

const authPageStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: "30%",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "white",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 32,
  },
  logo: {
    marginBottom: 24,
    alignSelf: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#374151",
    marginBottom: 32,
    fontSize: 16,
    lineHeight: 24,
  },
});

export default AuthPage;
