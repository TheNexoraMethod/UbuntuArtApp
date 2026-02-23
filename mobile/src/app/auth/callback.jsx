// src/app/auth/callback.jsx
// Handles Supabase email confirmation deep links.
// Supabase redirects to: ubuntuartvillage://auth/callback#access_token=...&refresh_token=...&type=signup
// OR (PKCE):              ubuntuartvillage://auth/callback?code=...
//
// Set in Supabase dashboard → Authentication → URL Configuration:
//   Site URL:      ubuntuartvillage://
//   Redirect URLs: ubuntuartvillage://auth/callback

import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/utils/auth/store";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription;

    const handleUrl = async (url) => {
      if (!url) {
        setError("No confirmation URL received.");
        return;
      }

      try {
        // Supabase can send tokens in the URL fragment (#) or as a query param ?code=
        const fragmentIndex = url.indexOf("#");
        const queryIndex = url.indexOf("?");

        // ── PKCE flow: ?code=XXX ──────────────────────────────────────────
        if (queryIndex !== -1) {
          const query = url.slice(queryIndex + 1).split("#")[0]; // strip fragment if both present
          const params = Object.fromEntries(new URLSearchParams(query));
          if (params.code) {
            const { data, error: codeError } =
              await supabase.auth.exchangeCodeForSession(params.code);
            if (codeError) throw codeError;
            if (data.session) {
              useAuthStore.setState({
                auth: { session: data.session, user: data.session.user },
                isReady: true,
              });
              router.replace("/(tabs)/profile");
              return;
            }
          }
        }

        // ── Implicit flow: #access_token=XXX&refresh_token=XXX ────────────
        if (fragmentIndex !== -1) {
          const fragment = url.slice(fragmentIndex + 1);
          const params = Object.fromEntries(new URLSearchParams(fragment));

          if (params.error) {
            throw new Error(params.error_description || params.error);
          }

          if (params.access_token) {
            const { data, error: sessionError } =
              await supabase.auth.setSession({
                access_token: params.access_token,
                refresh_token: params.refresh_token ?? "",
              });
            if (sessionError) throw sessionError;
            if (data.session) {
              useAuthStore.setState({
                auth: { session: data.session, user: data.session.user },
                isReady: true,
              });
              router.replace("/(tabs)/profile");
              return;
            }
          }
        }

        throw new Error(
          "No token or code found in the confirmation link. The link may have expired — please request a new one.",
        );
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err.message || "Verification failed. Please try again.");
      }
    };

    // Case 1: app was launched cold from the deep link
    Linking.getInitialURL().then(handleUrl);

    // Case 2: app was already open and received the URL
    subscription = Linking.addEventListener("url", ({ url }) => handleUrl(url));

    return () => subscription?.remove();
  }, [router]);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F0F9F4",
          padding: 24,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: "#DC2626",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Verification Failed
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 32,
            lineHeight: 22,
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          style={{
            backgroundColor: "#22C55E",
            borderRadius: 10,
            paddingVertical: 14,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            Back to Sign In
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0F9F4",
      }}
    >
      <ActivityIndicator size="large" color="#22C55E" />
      <Text
        style={{
          marginTop: 16,
          color: "#166534",
          fontSize: 16,
          fontWeight: "600",
        }}
      >
        Verifying your email…
      </Text>
    </View>
  );
}
