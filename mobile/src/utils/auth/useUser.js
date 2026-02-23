import { useCallback, useMemo, useRef } from "react";
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
  const setAuth = useAuthStore((s) => s.setAuth);
  const rawUser = auth?.user || null;

  // Memoize the mapped user so the object reference only changes when the
  // underlying Supabase user data actually changes (not on every render).
  const user = useMemo(
    () => mapSupabaseUser(rawUser),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      rawUser?.id,
      rawUser?.email,
      rawUser?.email_confirmed_at,
      rawUser?.updated_at,
      rawUser?.user_metadata?.name,
      rawUser?.user_metadata?.avatar_url,
    ],
  );

  // Keep a ref to the current user so fetchUser can return it on error
  // without needing user in its useCallback deps (which would make it unstable).
  const userRef = useRef(user);
  userRef.current = user;

  /**
   * Refreshes user data from Supabase and updates the auth store.
   * Called after profile saves, email verification, etc.
   */
  const fetchUser = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setAuth((prev) => ({ ...(prev || {}), user: data.user }));
        return mapSupabaseUser(data.user);
      }
    } catch (error) {
      console.error("❌ Error refreshing user:", error);
    }
    return userRef.current;
  }, [setAuth]); // setAuth is a stable Zustand action — no other deps needed

  return { user, data: user, loading: !isReady, refetch: fetchUser };
};
export default useUser;
