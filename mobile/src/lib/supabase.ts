import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1) Read the Supabase URL and anon key from Expo env vars
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 2) Safety checks so the app crashes early if env vars are missing
if (!supabaseUrl) {
  throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing EXPO_PUBLIC_SUPABASE_ANON_KEY");
}

// 3) This is the Supabase client for the MOBILE APP (uses anon key)
// React Native requires AsyncStorage for session persistence and
// detectSessionInUrl: false to prevent URL-based auth handling.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
