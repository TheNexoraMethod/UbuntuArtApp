import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo } from "react";
import { create } from "zustand";
import { Modal, View } from "react-native";
import { useAuthModal, useAuthStore, authKey } from "./store";

/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();

  const initiate = useCallback(async () => {
    try {
      // 1) Ask Supabase if there is already a saved session
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        // If session exists, store both session and user
        setAuth({
          session: data.session,
          user: data.session.user,
        });
        useAuthStore.setState({
          auth: {
            session: data.session,
            user: data.session.user,
          },
          isReady: true,
        });
      } else {
        // No session, mark as ready with no auth
        useAuthStore.setState({
          auth: null,
          isReady: true,
        });
      }
    } catch (error) {
      console.error("Auth initiate error:", error);
      // Still mark as ready even if there's an error
      useAuthStore.setState({
        auth: null,
        isReady: true,
      });
    }
  }, [setAuth]);

  useEffect(() => {}, []);

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
