import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Home as HomeIcon } from "lucide-react-native";

export function SignInPrompt({ onSignIn, onSignUp }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#F0F9F4" }}>
      <StatusBar style="dark" />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            padding: 40,
            borderRadius: 24,
            borderWidth: 2,
            borderColor: "#D1E7DD",
            shadowColor: "#22C55E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <HomeIcon size={48} color="#F59E0B" />
          <Text
            style={{
              color: "#166534",
              fontSize: 24,
              fontFamily: "Inter_700Bold",
              textAlign: "center",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            Book Your Room
          </Text>
          <Text
            style={{
              color: "#6B7280",
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Sign in or create an account to reserve your space at Ubuntu Art
            Village
          </Text>

          <TouchableOpacity
            onPress={onSignUp}
            style={{
              backgroundColor: "#22C55E",
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 12,
              width: "100%",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                textAlign: "center",
              }}
            >
              Create Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSignIn}
            style={{
              backgroundColor: "transparent",
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "#D1E7DD",
              width: "100%",
            }}
          >
            <Text
              style={{
                color: "#166534",
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                textAlign: "center",
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
