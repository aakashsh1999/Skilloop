import { supabase } from "@/lib/supabase";

export async function googleSignIn(userId) {
  const { data, error } = await supabase.auth.s({
    provider: "email",
    email: userId,
  });
  if (error) {
    console.log("Error signing in:", error.message);
    return;
  }
  console.log("Successfully signed in:", data.user.email);
}
