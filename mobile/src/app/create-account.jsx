// apps/mobile/src/app/create-account.jsx
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

export default function CreateAccount() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateAccount() {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      });

      if (error) {
        Alert.alert("Sign Up Failed", error.message);
        return;
      }

      // If we got a session immediately (email confirmation disabled), sync Zustand
      if (data.session) {
        useAuthStore.setState({
          auth: { session: data.session, user: data.session.user },
          isReady: true,
        });
        router.replace("/(tabs)/profile");
      } else {
        // Email confirmation required
        Alert.alert(
          "Check your email",
          "We sent a confirmation link to " +
            email.trim() +
            ". Tap it to activate your account, then sign in.",
          [{ text: "OK", onPress: () => router.replace("/login") }],
        );
      }
    } catch (err) {
      Alert.alert("Error", err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenBackground>
      <View style={styles.root}>
        <Text style={styles.title}>Create account</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleCreateAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Create account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.altButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.altButtonText}>
            Already have an account? Login
          </Text>
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
