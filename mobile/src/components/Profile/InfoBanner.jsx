import { View, Text, ActivityIndicator } from "react-native";

export function LoadingBanner() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F0F9F4" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#22C55E" />
        <Text
          style={{
            color: "#166534",
            fontSize: 16,
            fontFamily: "Inter_500Medium",
            marginTop: 12,
          }}
        >
          Loading settings...
        </Text>
      </View>
    </View>
  );
}

export function AuthRequiredBanner() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F0F9F4" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: "#166534",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Authentication Required
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          Please sign in to access account settings
        </Text>
      </View>
    </View>
  );
}
