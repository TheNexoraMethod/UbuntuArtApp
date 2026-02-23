import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import ScreenBackground from "../../components/ScreenBackground.jsx";

/**
 * Profile tab — acts as an auth gate.
 *  • Loading:          spinner
 *  • Authenticated:    redirect to /profile
 *  • Not authed:       sign-in / create-account screen
 */
export default function ProfileTab() {
  const { isReady, isAuthenticated } = useAuth();
  const router = useRouter();

  // Still resolving session
  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#111827",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  // Signed in → full profile screen
  if (isAuthenticated) {
    return <Redirect href="/profile" />;
  }

  // Not signed in → friendly gate
  return (
    <ScreenBackground>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#FFFFFF",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Your Profile
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#D1FAE5",
            textAlign: "center",
            marginBottom: 40,
            lineHeight: 24,
          }}
        >
          Sign in to manage your bookings, residency applications, and
          membership.
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: "#22C55E",
            borderRadius: 12,
            paddingVertical: 16,
            width: "100%",
            alignItems: "center",
            marginBottom: 16,
          }}
          onPress={() => router.push("/login")}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
            Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            borderRadius: 12,
            paddingVertical: 16,
            width: "100%",
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: "#22C55E",
          }}
          onPress={() => router.push("/create-account")}
        >
          <Text style={{ color: "#22C55E", fontSize: 16, fontWeight: "700" }}>
            Create Account
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}
