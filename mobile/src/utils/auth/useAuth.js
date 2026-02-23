import { supabase } from "@/lib/supabase";
import { useCallback, useEffect } from "react";
import { useAuthModal, useAuthStore } from "./store";

/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const isReady = useAuthStore((s) => s.isReady);
  const auth = useAuthStore((s) => s.auth);
  const setAuth = useAuthStore((s) => s.setAuth);
  const isOpen = useAuthModal((s) => s.isOpen);
  const close = useAuthModal((s) => s.close);
  const open = useAuthModal((s) => s.open);

  const initiate = useCallback(async () => {
    try {
      // Ask Supabase if there is already a saved session
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        // Single combined setState: set both auth and isReady atomically
        useAuthStore.setState({
          auth: {
            session: data.session,
            user: data.session.user,
          },
          isReady: true,
        });
      } else {
        useAuthStore.setState({ auth: null, isReady: true });
      }
    } catch (error) {
      console.error("Auth initiate error:", error);
      useAuthStore.setState({ auth: null, isReady: true });
    }
  }, []);

  const signIn = useCallback(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase signIn error:", error.message);
        return { data: null, error };
      }

      if (data.session) {
        setAuth({
          session: data.session,
          user: data.session.user,
        });
      }

      return { data, error: null };
    },
    [setAuth],
  );

  const signUp = useCallback(
    async (email, password) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Supabase signUp error:", error.message);
        return { data: null, error };
      }

      // Some flows require email confirmation; you may or may not get a session immediately.
      if (data.session) {
        setAuth({
          session: data.session,
          user: data.session.user,
        });
      }

      return { data, error: null };
    },
    [setAuth],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAuth(null);
    close();
  }, [close, setAuth]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};

export default useAuth;
