// apps/mobile/src/app/login.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenBackground from "../components/ScreenBackground.jsx";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "@/utils/auth/store";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
        setLoading(false);
        return;
      }

      // Immediately sync Zustand so the profile tab auth gate reflects
      // the new session without waiting for onAuthStateChange.
      if (data.session) {
        useAuthStore.setState({
          auth: { session: data.session, user: data.session.user },
          isReady: true,
        });
      }

      // Success — go to profile tab (auth gate will redirect to full profile)
      router.replace("/(tabs)/profile");
    } catch (err) {
      Alert.alert("Login Error", err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.root}>
        <TouchableOpacity
          style={{ marginBottom: 16 }}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={{ color: "#22C55E", fontWeight: "600", fontSize: 15 }}>
            ← Back to home
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>Login</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.altButton}
          onPress={() => router.push("/create-account")}
          disabled={loading}
        >
          <Text style={styles.altButtonText}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: "#111827",
  },
  button: {
    backgroundColor: "#16A34A",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  linkText: {
    color: "#E5E7EB",
    fontSize: 13,
    textAlign: "center",
  },
  altButton: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(209,213,219,0.9)",
    alignItems: "center",
    backgroundColor: "rgba(31,41,55,0.4)",
  },
  altButtonText: {
    color: "#E5E7EB",
    fontSize: 13,
    fontWeight: "600",
  },
});
