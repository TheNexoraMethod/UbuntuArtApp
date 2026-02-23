import { View, Text, TextInput } from "react-native";
import { Lock } from "lucide-react-native";

export function PasswordInput({ label, value, onChangeText, placeholder }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter_500Medium",
          color: "#374151",
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#D1D5DB",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
        }}
      >
        <Lock size={16} color="#6B7280" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingLeft: 8,
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#374151",
          }}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
}
