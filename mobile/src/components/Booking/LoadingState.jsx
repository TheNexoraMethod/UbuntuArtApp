import { View, Text, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";

export function LoadingState() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F0F9F4",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar style="dark" />
      <ActivityIndicator size="large" color="#22C55E" />
      <Text
        style={{
          color: "#166534",
          marginTop: 16,
          fontFamily: "Inter_500Medium",
        }}
      >
        Loading booking system...
      </Text>
    </View>
  );
}
