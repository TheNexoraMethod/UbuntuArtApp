import { View, Text } from "react-native";

export function BookingSummary({
  selectedRoom,
  bookingType,
  selectedStartDate,
  selectedEndDate,
  calculateNights,
  calculateTotalPrice,
}) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#D1E7DD",
        shadowColor: "#22C55E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontFamily: "Inter_700Bold",
          color: "#166534",
          marginBottom: 12,
        }}
      >
        Booking Summary
      </Text>
      <View style={{ gap: 8 }}>
        <Text
          style={{
            color: "#6B7280",
            fontFamily: "Inter_400Regular",
            fontSize: 13,
          }}
        >
          Room:{" "}
          <Text
            style={{
              color: "#166534",
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {selectedRoom?.title}
          </Text>
        </Text>
        <Text
          style={{
            color: "#6B7280",
            fontFamily: "Inter_400Regular",
            fontSize: 13,
          }}
        >
          Type:{" "}
          <Text
            style={{
              color: "#166534",
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {bookingType === "artist" ? "Artist Residency" : "Guest Stay"}
          </Text>
        </Text>
        <Text
          style={{
            color: "#6B7280",
            fontFamily: "Inter_400Regular",
            fontSize: 13,
          }}
        >
          Dates:{" "}
          <Text
            style={{
              color: "#166534",
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {selectedStartDate} to {selectedEndDate}
          </Text>
        </Text>
        <Text
          style={{
            color: "#6B7280",
            fontFamily: "Inter_400Regular",
            fontSize: 13,
          }}
        >
          Nights:{" "}
          <Text
            style={{
              color: "#166534",
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {calculateNights()}
          </Text>
        </Text>
        <View
          style={{
            height: 1,
            backgroundColor: "#D1E7DD",
            marginVertical: 8,
          }}
        />
        <Text
          style={{
            color: "#F59E0B",
            fontFamily: "Inter_700Bold",
            fontSize: 18,
          }}
        >
          Total: ${calculateTotalPrice()}
        </Text>
      </View>
    </View>
  );
}
