// apps/mobile/src/app/create-account.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenBackground from "../components/ScreenBackground.jsx";

export default function CreateAccount() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleCreateAccount() {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    Alert.alert("Success", "Account created (simulation).");
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

        <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
          <Text style={styles.buttonText}>Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
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
});
