import { useCallback } from "react";
import { useAuth } from "./useAuth";
import { useAuthStore } from "./store";
import { supabase } from "@/lib/supabase";

/**
 * Maps a raw Supabase auth user object to the shape the profile UI expects.
 */
function mapSupabaseUser(raw) {
  if (!raw) return null;
  return {
    ...raw,
    // Friendly display name: user_metadata.name → first part of email → 'User'
    name: raw.user_metadata?.name || raw.email?.split("@")[0] || "User",
    // Avatar: user_metadata.avatar_url (set by updateUser)
    image: raw.user_metadata?.avatar_url || null,
    // Email verification status
    email_verified: !!raw.email_confirmed_at,
    // Membership — not yet implemented (Stripe deferred)
    subscription_status: null,
    membership_status: null,
    membership_number: null,
  };
}

export const useUser = () => {
  const { auth, isReady } = useAuth();
  const { setAuth } = useAuthStore();
  const rawUser = auth?.user || null;
  const user = mapSupabaseUser(rawUser);

  /**
   * Refreshes user data from Supabase and updates the auth store.
   * Called after profile saves, email verification, etc.
   */
  const fetchUser = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        const updatedAuth = { ...(auth || {}), user: data.user };
        setAuth(updatedAuth);
        return mapSupabaseUser(data.user);
      }
    } catch (error) {
      console.error("❌ Error refreshing user:", error);
    }
    return user;
  }, [auth, user, setAuth]);

  return { user, data: user, loading: !isReady, refetch: fetchUser };
};
export default useUser;
