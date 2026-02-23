import { View, Text, TouchableOpacity } from "react-native";
import { Palette, User } from "lucide-react-native";

export function BookingTypeSelection({ onSelectType }) {
  return (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 16,
          fontFamily: "Inter_400Regular",
          color: "#6B7280",
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        Are you booking as an artist or a guest?
      </Text>

      <TouchableOpacity
        onPress={() => onSelectType("artist")}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 32,
          marginBottom: 20,
          borderWidth: 2,
          borderColor: "#D1E7DD",
          alignItems: "center",
          shadowColor: "#22C55E",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Palette size={56} color="#F59E0B" />
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Inter_700Bold",
            color: "#166534",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          Artist Residency
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          Book as an artist for creative residency with dedicated studio space
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelectType("guest")}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 32,
          borderWidth: 2,
          borderColor: "#D1E7DD",
          alignItems: "center",
          shadowColor: "#22C55E",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <User size={56} color="#22C55E" />
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Inter_700Bold",
            color: "#166534",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          Guest Stay
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          Book a comfortable room for your visit to Ubuntu Art Village
        </Text>
      </TouchableOpacity>
    </View>
  );
}
