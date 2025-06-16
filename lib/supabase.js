// lib/supabase.js
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace with your actual Supabase URL and Anon Key
// For Expo, consider using EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
// in your .env file or app.json

const supabaseUrl = "https://wmdsvwbwqqksldytuumw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZHN2d2J3cXFrc2xkeXR1dW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODkxMzksImV4cCI6MjA2NDI2NTEzOX0.xzp3eitpzVcbGaRLtGX1NvgmFRo6g1O1-meZxkt7dF0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
